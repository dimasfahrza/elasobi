import { isLoggedIn, getUser, signOut } from '../auth.js';
import { fetchUserOrders } from '../checkout.js';
import { formatPrice } from '../products.js';
import { supabase } from '../supabase.js';
import { showToast, navigate } from '../app.js';

export const renderAccount = async (root) => {
  if (!isLoggedIn()) { navigate('/login'); return; }

  root.innerHTML = `
    <section class="container account-page">
      <h1>My Account</h1>
      <div class="account-grid">
        <nav class="account-nav">
          <a href="#" data-tab="profile" class="active">Profile</a>
          <a href="#" data-tab="orders">My Orders</a>
          <a href="#" data-tab="logout">Logout</a>
        </nav>
        <div class="account-content" id="account-content"><div class="loader"></div></div>
      </div>
    </section>`;

  let active = 'profile';
  const render = async () => {
    const c = root.querySelector('#account-content');
    if (active === 'profile')  { c.innerHTML = await renderProfile(); bindProfile(c); }
    else if (active === 'orders') c.innerHTML = await renderOrders();
  };

  root.querySelectorAll('[data-tab]').forEach(a => {
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      const tab = a.dataset.tab;
      if (tab === 'logout') {
        await signOut();
        showToast('Signed out', 'success');
        navigate('/');
        return;
      }
      active = tab;
      root.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('active', x === a));
      await render();
    });
  });
  await render();
};

const renderProfile = async () => {
  const { data: p } = await supabase.from('profiles').select('*').eq('id', getUser().id).maybeSingle();
  return `
    <h2 style="margin-bottom:20px;">Profile</h2>
    <form id="profile-form" class="checkout-form">
      <div class="form-group"><label>Email</label><input type="email" value="${getUser().email}" readonly /></div>
      <div class="form-group"><label>Full Name</label><input type="text" name="full_name" value="${p?.full_name || ''}" /></div>
      <div class="form-row">
        <div class="form-group"><label>Phone</label><input type="tel" name="phone" value="${p?.phone || ''}" /></div>
        <div class="form-group"><label>Country</label><input type="text" name="country" value="${p?.country || 'Taiwan'}" /></div>
      </div>
      <div class="form-group"><label>Address</label><input type="text" name="address" value="${p?.address || ''}" /></div>
      <div class="form-row">
        <div class="form-group"><label>City</label><input type="text" name="city" value="${p?.city || ''}" /></div>
        <div class="form-group"><label>Postal Code</label><input type="text" name="postal_code" value="${p?.postal_code || ''}" /></div>
      </div>
      <button type="submit" style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;font-weight:600;">Save</button>
    </form>`;
};

const bindProfile = (c) => {
  c.querySelector('#profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    const { error } = await supabase.from('profiles')
      .update({ ...fd, updated_at: new Date().toISOString() })
      .eq('id', getUser().id);
    if (error) showToast(error.message, 'error');
    else showToast('Profile saved', 'success');
  });
};

const renderOrders = async () => {
  const orders = await fetchUserOrders();
  if (!orders.length) return `<div class="empty-state"><i class="fas fa-receipt"></i><p>No orders yet</p><a href="#/products" class="btn-primary">Start shopping</a></div>`;
  return `
    <h2 style="margin-bottom:20px;">My Orders</h2>
    ${orders.map(o => `
      <div style="border:1px solid #e5e5e5;border-radius:6px;padding:16px;margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <strong>${o.order_number}</strong>
          <span style="background:#eef;color:#6c63ff;padding:2px 10px;border-radius:12px;font-size:13px;text-transform:capitalize;">${o.status}</span>
        </div>
        <div style="font-size:14px;color:#666;margin-bottom:8px;">${new Date(o.created_at).toLocaleString()}</div>
        <ul style="margin:8px 0;padding-left:18px;">
          ${o.order_items.map(it => `<li>${it.product_name} × ${it.quantity} — ${formatPrice(it.price * it.quantity)}</li>`).join('')}
        </ul>
        <div style="text-align:right;font-weight:700;">Total: ${formatPrice(o.total)}</div>
      </div>`).join('')}`;
};

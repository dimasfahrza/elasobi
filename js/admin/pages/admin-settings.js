import { supabase } from '../../supabase.js';
import { showAdminToast } from '../admin-app.js';

export const renderAdminSettings = async (root) => {
  root.innerHTML = `
    <div class="admin-page-header">
      <div>
        <h1>Settings</h1>
        <p>Manage special offer timer and coupons</p>
      </div>
    </div>

    <!-- ── Special Offer Timer ── -->
    <div class="admin-card" style="max-width:520px;margin-bottom:28px;">
      <div class="admin-card-header">
        <h3 style="font-size:16px;font-weight:600;">Special Offer Timer</h3>
      </div>
      <div style="padding:24px;">
        <div class="admin-form-group" style="margin-bottom:20px;">
          <label style="display:block;margin-bottom:8px;font-weight:500;font-size:14px;">
            Offer End Date &amp; Time
          </label>
          <input type="datetime-local" id="offer-end-input" class="admin-input" style="width:100%;" />
          <p style="font-size:12px;color:var(--admin-text-muted);margin-top:6px;">
            The countdown on the homepage will count down to this date.
          </p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <button class="admin-btn" id="save-offer-btn">
            <i class="fas fa-save"></i> Save
          </button>
          <span id="last-updated" style="font-size:12px;color:var(--admin-text-muted);"></span>
        </div>
      </div>
    </div>

    <!-- ── Coupon Management ── -->
    <div class="admin-card">
      <div class="admin-card-header">
        <h3 style="font-size:16px;font-weight:600;">Coupons</h3>
        <span id="coupon-count" style="font-size:13px;color:var(--admin-text-muted);"></span>
      </div>
      <div style="padding:24px;">

        <!-- Add coupon form -->
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--admin-border);">
          <div class="admin-form-group" style="margin:0;">
            <label style="font-size:13px;font-weight:500;display:block;margin-bottom:6px;">Code</label>
            <input type="text" id="new-coupon-code" class="admin-input" placeholder="e.g. SAVE15"
              style="width:150px;text-transform:uppercase;" />
          </div>
          <div class="admin-form-group" style="margin:0;">
            <label style="font-size:13px;font-weight:500;display:block;margin-bottom:6px;">Discount %</label>
            <input type="number" id="new-coupon-discount" class="admin-input" placeholder="10"
              min="1" max="100" style="width:90px;" />
          </div>
          <div class="admin-form-group" style="margin:0;">
            <label style="font-size:13px;font-weight:500;display:block;margin-bottom:6px;">Expires At <small style="color:var(--admin-text-muted);font-weight:400;">(optional)</small></label>
            <input type="datetime-local" id="new-coupon-expires" class="admin-input" style="width:200px;" />
          </div>
          <button class="admin-btn" id="add-coupon-btn">
            <i class="fas fa-plus"></i> Add Coupon
          </button>
        </div>

        <!-- Coupon list -->
        <div id="coupon-list"><div class="admin-loader"></div></div>
      </div>
    </div>
  `;

  await loadOfferTimer(root);
  await loadCoupons(root);
  bindOfferTimer(root);
  bindAddCoupon(root);
};

// ── Special Offer Timer ──────────────────────────────────────────────────────
const loadOfferTimer = async (root) => {
  const { data } = await supabase
    .from('settings')
    .select('value, updated_at')
    .eq('key', 'offer_end_date')
    .single();

  const input = root.querySelector('#offer-end-input');
  const lastUpdated = root.querySelector('#last-updated');

  if (data?.value) {
    const d = new Date(data.value);
    input.value = d.toISOString().slice(0, 16);
    lastUpdated.textContent = `Last saved: ${d.toLocaleString()}`;
  }
};

const bindOfferTimer = (root) => {
  root.querySelector('#save-offer-btn').addEventListener('click', async () => {
    const btn = root.querySelector('#save-offer-btn');
    const val = root.querySelector('#offer-end-input').value;
    if (!val) { showAdminToast('Please select a date and time.', 'error'); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

    const isoValue = new Date(val).toISOString();
    const { error } = await supabase.from('settings')
      .upsert({ key: 'offer_end_date', value: isoValue, updated_at: new Date().toISOString() });

    if (error) {
      showAdminToast(`Error: ${error.message}`, 'error');
    } else {
      showAdminToast('Offer timer updated!', 'success');
      root.querySelector('#last-updated').textContent =
        `Last saved: ${new Date(isoValue).toLocaleString()}`;
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save';
  });
};

// ── Coupons ──────────────────────────────────────────────────────────────────
const loadCoupons = async (root) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    root.querySelector('#coupon-list').innerHTML =
      `<p style="color:var(--admin-danger);">Error: ${error.message}</p>`;
    return;
  }

  const coupons = data || [];
  const active  = coupons.filter(c => c.is_active).length;
  root.querySelector('#coupon-count').textContent =
    `${coupons.length} total · ${active} active`;

  if (!coupons.length) {
    root.querySelector('#coupon-list').innerHTML =
      '<p style="color:var(--admin-text-muted);font-size:14px;">No coupons yet.</p>';
    return;
  }

  root.querySelector('#coupon-list').innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Code</th>
          <th>Discount</th>
          <th>Status</th>
          <th>Expires At</th>
          <th>Created</th>
          <th class="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${coupons.map((c, i) => {
          const expired = c.expires_at && new Date(c.expires_at) < new Date();
          const expiryLabel = c.expires_at
            ? `<span style="color:${expired ? 'var(--admin-danger)' : 'inherit'};">
                ${new Date(c.expires_at).toLocaleDateString()}
                ${expired ? ' <em>(expired)</em>' : ''}
               </span>`
            : '<span style="color:var(--admin-text-muted);">No expiry</span>';
          return `
          <tr data-coupon-id="${c.id}">
            <td style="color:var(--admin-text-muted);font-size:13px;">${i + 1}</td>
            <td><strong style="font-family:monospace;letter-spacing:.5px;">${c.code}</strong></td>
            <td><span style="font-weight:700;color:var(--admin-primary);">${c.discount_percent}%</span></td>
            <td>
              <span style="
                display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;
                background:${c.is_active ? '#dcfce7' : '#f3f4f6'};
                color:${c.is_active ? '#16a34a' : '#6b7280'};">
                ${c.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td>${expiryLabel}</td>
            <td style="color:var(--admin-text-muted);font-size:13px;">
              ${new Date(c.created_at).toLocaleDateString()}
            </td>
            <td class="col-actions" style="white-space:nowrap;">
              <button class="admin-btn admin-btn-sm admin-btn-secondary"
                data-action="toggle" title="${c.is_active ? 'Deactivate' : 'Activate'}">
                <i class="fas fa-${c.is_active ? 'toggle-on' : 'toggle-off'}"></i>
              </button>
              <button class="admin-btn admin-btn-sm admin-btn-danger"
                data-action="delete" title="Delete" style="margin-left:4px;">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;

  // Bind toggle & delete
  root.querySelector('#coupon-list').querySelectorAll('tr[data-coupon-id]').forEach(row => {
    const id = Number(row.dataset.couponId);
    const coupon = coupons.find(c => c.id === id);

    row.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
      const { error } = await supabase.from('coupons')
        .update({ is_active: !coupon.is_active }).eq('id', id);
      if (error) { showAdminToast(`Error: ${error.message}`, 'error'); return; }
      showAdminToast(`Coupon ${coupon.is_active ? 'deactivated' : 'activated'}`, 'success');
      await loadCoupons(root);
    });

    row.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) { showAdminToast(`Error: ${error.message}`, 'error'); return; }
      showAdminToast('Coupon deleted', 'success');
      await loadCoupons(root);
    });
  });
};

const bindAddCoupon = (root) => {
  root.querySelector('#new-coupon-code').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  root.querySelector('#add-coupon-btn').addEventListener('click', async () => {
    const btn      = root.querySelector('#add-coupon-btn');
    const code     = root.querySelector('#new-coupon-code').value.trim().toUpperCase();
    const discount = parseInt(root.querySelector('#new-coupon-discount').value, 10);
    const expires  = root.querySelector('#new-coupon-expires').value;

    if (!code) { showAdminToast('Please enter a coupon code.', 'error'); return; }
    if (!discount || discount < 1 || discount > 100) {
      showAdminToast('Discount must be between 1 and 100.', 'error'); return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const payload = {
      code,
      discount_percent: discount,
      is_active: true,
      expires_at: expires ? new Date(expires).toISOString() : null,
    };

    const { error } = await supabase.from('coupons').insert(payload);

    if (error) {
      showAdminToast(
        error.message.includes('unique') ? `Code "${code}" already exists.` : `Error: ${error.message}`,
        'error'
      );
    } else {
      showAdminToast(`Coupon "${code}" added!`, 'success');
      root.querySelector('#new-coupon-code').value    = '';
      root.querySelector('#new-coupon-discount').value = '';
      root.querySelector('#new-coupon-expires').value  = '';
      await loadCoupons(root);
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus"></i> Add Coupon';
  });
};

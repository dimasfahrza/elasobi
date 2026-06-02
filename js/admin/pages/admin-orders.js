import { supabase } from '../../supabase.js';
import { showAdminToast } from '../admin-app.js';

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const formatPrice = (n) => 'NT$' + Number(n || 0).toLocaleString();

let cachedOrders   = [];   // all orders with order_items
let cachedRefunds  = {};   // map: order_id -> refund row
let currentFilter  = 'all';

export const renderAdminOrders = async (root) => {
  root.innerHTML = `
    <div class="admin-page-header">
      <div>
        <h1>Orders</h1>
        <p>Manage order statuses, cancel orders (auto-restores stock), and issue refunds</p>
      </div>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <h2>All Orders</h2>
        <select id="status-filter" class="admin-select">
          <option value="all">All statuses</option>
          ${STATUSES.map(s => `<option value="${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="admin-table-wrap">
        <div id="orders-body"><div class="admin-loader"></div></div>
      </div>
    </div>
  `;

  root.querySelector('#status-filter').addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderTable(root);
  });

  await loadData();
  renderTable(root);
};

const loadData = async () => {
  const [ordersRes, refundsRes] = await Promise.all([
    supabase
      .from('orders')
      .select('*, order_items(product_id, product_name, quantity, price)')
      .order('created_at', { ascending: false }),
    supabase.from('refunds').select('*'),
  ]);

  cachedOrders  = ordersRes.data || [];
  cachedRefunds = Object.fromEntries((refundsRes.data || []).map(r => [r.order_id, r]));
};

const renderTable = (root) => {
  const body = root.querySelector('#orders-body');
  const filtered = currentFilter === 'all'
    ? cachedOrders
    : cachedOrders.filter(o => o.status === currentFilter);

  if (!filtered.length) {
    body.innerHTML = `<div class="admin-empty">No orders match this filter.</div>`;
    return;
  }

  body.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Order #</th>
          <th>Customer</th>
          <th>Items</th>
          <th>Date</th>
          <th>Total</th>
          <th>Status</th>
          <th class="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody id="orders-tbody"></tbody>
    </table>
  `;

  const tbody = body.querySelector('#orders-tbody');
  filtered.forEach(o => tbody.appendChild(renderOrderRow(o, root)));
};

const renderOrderRow = (o, root) => {
  const tr = document.createElement('tr');
  tr.dataset.id = o.id;
  tr.dataset.status = o.status;

  const itemsHTML = (o.order_items || []).map(it =>
    `<li>${it.product_name} × ${it.quantity}</li>`
  ).join('');

  const refund = cachedRefunds[o.id];

  const actionsHTML = buildActionsHTML(o, refund);

  tr.innerHTML = `
    <td><strong>${o.order_number}</strong></td>
    <td>${o.shipping_full_name || '—'}<br/><small style="color:var(--admin-text-muted);">${o.shipping_phone || ''}</small></td>
    <td><ul class="order-items-list">${itemsHTML}</ul></td>
    <td>${new Date(o.created_at).toLocaleDateString()}<br/><small style="color:var(--admin-text-muted);">${new Date(o.created_at).toLocaleTimeString()}</small></td>
    <td><strong>${formatPrice(o.total)}</strong></td>
    <td>
      <select class="admin-select admin-input-sm" data-action="change-status" ${o.status === 'cancelled' ? 'disabled' : ''}>
        ${STATUSES.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
      <div style="margin-top:6px;"><span class="badge-status ${o.status}">${o.status}</span></div>
    </td>
    <td class="col-actions">${actionsHTML}</td>
  `;

  bindRowActions(tr, o, root);
  return tr;
};

const buildActionsHTML = (o, refund) => {
  const html = [];
  if (o.status !== 'cancelled') {
    html.push(`<button class="admin-btn admin-btn-danger admin-btn-sm" data-action="cancel">
      <i class="fas fa-ban"></i> Cancel
    </button>`);
  } else {
    if (!refund) {
      html.push(`<button class="admin-btn admin-btn-sm" data-action="refund">
        <i class="fas fa-undo"></i> Issue Refund
      </button>`);
    } else if (refund.status === 'pending') {
      html.push(`<span class="badge-status pending" style="display:block; margin-bottom:6px;">Refund pending</span>
        <button class="admin-btn admin-btn-success admin-btn-sm" data-action="mark-processed">
          <i class="fas fa-check"></i> Mark Processed
        </button>`);
    } else {
      html.push(`<span class="badge-status processed">Refunded ✓</span>`);
    }
  }
  return html.join(' ');
};

const bindRowActions = (tr, o, root) => {
  // Change status
  tr.querySelector('[data-action="change-status"]')?.addEventListener('change', async (e) => {
    const newStatus = e.target.value;
    if (newStatus === o.status) return;
    if (newStatus === 'cancelled') {
      // Use cancel flow to also restore stock
      e.target.value = o.status;
      await handleCancel(o, root);
      return;
    }
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', o.id);
    if (error) {
      showAdminToast(`Update failed: ${error.message}`, 'error');
      e.target.value = o.status;
      return;
    }
    showAdminToast(`Order status updated to "${newStatus}"`, 'success');
    o.status = newStatus;
    tr.dataset.status = newStatus;
    refreshRow(tr, o);
  });

  // Cancel button
  tr.querySelector('[data-action="cancel"]')?.addEventListener('click', () => handleCancel(o, root));

  // Refund (open inline form)
  tr.querySelector('[data-action="refund"]')?.addEventListener('click', () => openRefundForm(tr, o, root));

  // Mark processed
  tr.querySelector('[data-action="mark-processed"]')?.addEventListener('click', async () => {
    const refund = cachedRefunds[o.id];
    if (!refund) return;
    const { error } = await supabase
      .from('refunds')
      .update({ status: 'processed' })
      .eq('id', refund.id);
    if (error) { showAdminToast(error.message, 'error'); return; }
    refund.status = 'processed';
    cachedRefunds[o.id] = refund;
    showAdminToast('Refund marked as processed', 'success');
    refreshRow(tr, o);
  });
};

const handleCancel = async (o, root) => {
  if (!confirm(`Cancel order ${o.order_number} and restore stock?`)) return;

  // Restore stock for each item
  for (const it of (o.order_items || [])) {
    if (!it.product_id) continue;
    const { data: prod } = await supabase
      .from('products').select('stock').eq('id', it.product_id).maybeSingle();
    if (!prod) continue;
    await supabase
      .from('products')
      .update({ stock: Number(prod.stock) + Number(it.quantity) })
      .eq('id', it.product_id);
  }

  const { error } = await supabase
    .from('orders').update({ status: 'cancelled' }).eq('id', o.id);

  if (error) {
    showAdminToast(`Cancel failed: ${error.message}`, 'error');
    return;
  }

  o.status = 'cancelled';
  showAdminToast(`Order ${o.order_number} cancelled, stock restored`, 'success');
  await loadData();
  renderTable(root);
};

const openRefundForm = (tr, o, root) => {
  // Avoid duplicate form
  if (tr.nextElementSibling?.classList?.contains('refund-row')) {
    tr.nextElementSibling.remove();
    return;
  }

  const formRow = document.createElement('tr');
  formRow.className = 'refund-row';
  formRow.innerHTML = `
    <td colspan="7">
      <form class="refund-form" id="refund-form-${o.id}">
        <div class="refund-form-fields">
          <div>
            <label style="font-size:12px; font-weight:600; display:block; margin-bottom:4px;">Amount</label>
            <input type="number" step="0.01" min="0" name="amount" value="${o.total}" class="admin-input" required style="width:100%;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:600; display:block; margin-bottom:4px;">Reason</label>
            <input type="text" name="reason" placeholder="Reason for refund" class="admin-input" style="width:100%;" />
          </div>
        </div>
        <div class="refund-form-actions">
          <button type="submit" class="admin-btn admin-btn-sm">
            <i class="fas fa-paper-plane"></i> Submit
          </button>
          <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" data-action="cancel-form">
            Cancel
          </button>
        </div>
      </form>
    </td>
  `;

  tr.parentNode.insertBefore(formRow, tr.nextSibling);

  formRow.querySelector('[data-action="cancel-form"]').addEventListener('click', () => formRow.remove());

  formRow.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const amount = Number(fd.get('amount'));
    const reason = fd.get('reason')?.trim() || null;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    const { data, error } = await supabase
      .from('refunds')
      .insert({ order_id: o.id, amount, reason, status: 'pending' })
      .select()
      .single();

    if (error) {
      showAdminToast(`Refund failed: ${error.message}`, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit';
      return;
    }

    cachedRefunds[o.id] = data;
    showAdminToast('Refund created (pending)', 'success');
    formRow.remove();
    refreshRow(tr, o);
  });
};

const refreshRow = (tr, o) => {
  const actionsCell = tr.querySelector('.col-actions');
  if (actionsCell) actionsCell.innerHTML = buildActionsHTML(o, cachedRefunds[o.id]);

  const statusBadge = tr.querySelector('.badge-status');
  if (statusBadge) {
    statusBadge.className = `badge-status ${o.status}`;
    statusBadge.textContent = o.status;
  }
  const select = tr.querySelector('[data-action="change-status"]');
  if (select) {
    select.value = o.status;
    select.disabled = (o.status === 'cancelled');
  }
  bindRowActions(tr, o, document.getElementById('admin-app'));
};

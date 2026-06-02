import { supabase } from '../../supabase.js';
import { showAdminToast } from '../admin-app.js';

const formatPrice = (n) => 'NT$' + Number(n || 0).toLocaleString();

export const renderAdminRefunds = async (root) => {
  root.innerHTML = `
    <div class="admin-page-header">
      <div>
        <h1>Refunds</h1>
        <p>Track all refund records. Issue new refunds from the Orders page.</p>
      </div>
    </div>
    <div class="admin-card">
      <div class="admin-table-wrap">
        <div id="refunds-body"><div class="admin-loader"></div></div>
      </div>
    </div>
  `;

  await loadAndRender(root);
};

const loadAndRender = async (root) => {
  const { data, error } = await supabase
    .from('refunds')
    .select('*, orders(order_number, shipping_full_name, total, status)')
    .order('created_at', { ascending: false });

  const body = root.querySelector('#refunds-body');

  if (error) {
    body.innerHTML = `<div class="admin-empty" style="color:var(--admin-danger);">Error: ${error.message}</div>`;
    return;
  }

  if (!data?.length) {
    body.innerHTML = `
      <div class="admin-empty">
        <i class="fas fa-undo" style="font-size:32px; color:var(--admin-border); display:block; margin-bottom:8px;"></i>
        No refunds recorded yet.<br/>
        <a href="#/orders" style="color:var(--admin-primary); font-weight:600;">Go to Orders</a> to issue a refund on cancelled orders.
      </div>`;
    return;
  }

  body.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Refund ID</th>
          <th>Order #</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Reason</th>
          <th>Created</th>
          <th>Status</th>
          <th class="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(r => `
          <tr data-id="${r.id}">
            <td>#${r.id}</td>
            <td><strong>${r.orders?.order_number || '—'}</strong></td>
            <td>${r.orders?.shipping_full_name || '—'}</td>
            <td><strong>${formatPrice(r.amount)}</strong></td>
            <td style="max-width:220px; color:var(--admin-text-muted);">${r.reason || '—'}</td>
            <td>${new Date(r.created_at).toLocaleDateString()}</td>
            <td><span class="badge-status ${r.status}">${r.status}</span></td>
            <td class="col-actions">
              ${r.status === 'pending' ? `
                <button class="admin-btn admin-btn-success admin-btn-sm" data-action="mark-processed">
                  <i class="fas fa-check"></i> Mark Processed
                </button>` : `<span style="color:var(--admin-success);"><i class="fas fa-check-circle"></i> Done</span>`
              }
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  body.querySelectorAll('tr[data-id]').forEach(tr => {
    const id = Number(tr.dataset.id);
    tr.querySelector('[data-action="mark-processed"]')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

      const { error } = await supabase
        .from('refunds')
        .update({ status: 'processed' })
        .eq('id', id);

      if (error) {
        showAdminToast(`Failed: ${error.message}`, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Mark Processed';
        return;
      }

      showAdminToast('Refund marked as processed', 'success');
      await loadAndRender(root);
    });
  });
};

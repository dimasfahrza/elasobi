import { supabase } from '../../supabase.js';

const formatPrice = (n) => 'NT$' + Number(n || 0).toLocaleString();

export const renderAdminDashboard = async (root) => {
  root.innerHTML = `
    <div class="admin-page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Overview of your store performance</p>
      </div>
    </div>
    <div id="dash-content"><div class="admin-loader"></div></div>
  `;

  const [
    ordersCountRes,
    revenueRowsRes,
    lowStockRes,
    couponsCountRes,
    recentRes,
  ] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total').neq('status', 'cancelled'),
    supabase.from('products').select('id, name, stock').lt('stock', 5).order('stock'),
    supabase.from('coupons').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders')
      .select('id, order_number, total, status, created_at, shipping_full_name')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const totalOrders   = ordersCountRes.count ?? 0;
  const totalRevenue  = (revenueRowsRes.data || []).reduce((s, r) => s + Number(r.total), 0);
  const lowStock      = lowStockRes.data || [];
  const activeCoupons = couponsCountRes.count ?? 0;
  const recent        = recentRes.data || [];

  root.querySelector('#dash-content').innerHTML = `
    <div class="admin-stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-receipt"></i></div>
        <div>
          <div class="stat-label">Total Orders</div>
          <div class="stat-value">${totalOrders}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-dollar-sign"></i></div>
        <div>
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value">${formatPrice(totalRevenue)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fas fa-exclamation-triangle"></i></div>
        <div>
          <div class="stat-label">Low Stock Products</div>
          <div class="stat-value">${lowStock.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><i class="fas fa-tag"></i></div>
        <div>
          <div class="stat-label">Active Coupons</div>
          <div class="stat-value">${activeCoupons}</div>
        </div>
      </div>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <h2><i class="fas fa-exclamation-triangle" style="color:var(--admin-warning);"></i> Low Stock Alert</h2>
        <a href="#/products" class="admin-btn admin-btn-secondary admin-btn-sm">Manage Products</a>
      </div>
      <div class="admin-table-wrap">
        ${lowStock.length === 0
          ? `<div class="admin-empty">All products have sufficient stock ✓</div>`
          : `<table class="admin-table">
              <thead><tr><th>Product</th><th>Current Stock</th></tr></thead>
              <tbody>
                ${lowStock.map(p => `
                  <tr>
                    <td>${p.name}</td>
                    <td><span class="badge-stock-low">${p.stock} left</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
        }
      </div>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <h2>Recent Orders</h2>
        <a href="#/orders" class="admin-btn admin-btn-secondary admin-btn-sm">View All</a>
      </div>
      <div class="admin-table-wrap">
        ${recent.length === 0
          ? `<div class="admin-empty">No orders yet</div>`
          : `<table class="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${recent.map(o => `
                  <tr>
                    <td><strong>${o.order_number}</strong></td>
                    <td>${o.shipping_full_name || '—'}</td>
                    <td>${new Date(o.created_at).toLocaleDateString()}</td>
                    <td>${formatPrice(o.total)}</td>
                    <td><span class="badge-status ${o.status}">${o.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
        }
      </div>
    </div>
  `;
};

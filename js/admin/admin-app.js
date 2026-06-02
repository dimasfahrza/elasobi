import {
  initAdminAuth, isAdminLoggedIn, checkAdminRole, adminSignOut, onAdminAuthChange
} from './admin-auth.js';

import { renderAdminDashboard } from './pages/admin-dashboard.js';
import { renderAdminProducts }  from './pages/admin-products.js';
import { renderAdminOrders }    from './pages/admin-orders.js';
import { renderAdminRefunds }   from './pages/admin-refunds.js';
import { renderAdminMessages }  from './pages/admin-messages.js';
import { renderAdminSettings }  from './pages/admin-settings.js';

// ============ TOAST ============
export const showAdminToast = (msg, type = '') => {
  const t = document.getElementById('admin-toast');
  if (!t) return;
  t.className = 'admin-toast ' + type;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showAdminToast._id);
  showAdminToast._id = setTimeout(() => { t.hidden = true; }, 2800);
};

// ============ NAV ============
export const adminNavigate = (path) => { location.hash = '#' + path; };

// Redirect to the main login page on index.html
const redirectToLogin = () => {
  window.location.href = 'index.html#/login';
};

// ============ ROUTES ============
const routes = [
  { pattern: /^\/?$/,         redirect: '/dashboard' },
  { pattern: /^\/dashboard$/, handler: renderAdminDashboard, requiresAdmin: true },
  { pattern: /^\/products$/,  handler: renderAdminProducts,  requiresAdmin: true },
  { pattern: /^\/orders$/,    handler: renderAdminOrders,    requiresAdmin: true },
  { pattern: /^\/refunds$/,   handler: renderAdminRefunds,   requiresAdmin: true },
  { pattern: /^\/messages$/,  handler: renderAdminMessages,  requiresAdmin: true },
  { pattern: /^\/settings$/,  handler: renderAdminSettings,  requiresAdmin: true },
];

const router = async () => {
  const path = (location.hash || '#/').slice(1) || '/';
  const app  = document.getElementById('admin-app');

  // Highlight active nav link
  document.querySelectorAll('.admin-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === path);
  });

  for (const r of routes) {
    const m = path.match(r.pattern);
    if (!m) continue;

    if (r.redirect) { location.hash = '#' + r.redirect; return; }

    // Auth gate — redirect to main login page if not authenticated
    if (r.requiresAdmin) {
      if (!isAdminLoggedIn()) {
        redirectToLogin();
        return;
      }
      const ok = await checkAdminRole();
      if (!ok) {
        await adminSignOut();
        redirectToLogin();
        return;
      }
    }

    try {
      await r.handler(app);
    } catch (err) {
      console.error('[admin route]', err);
      app.innerHTML = `
        <div class="admin-card" style="padding:30px;">
          <h2>Something went wrong</h2>
          <p style="color:#6b7280; margin-top:8px;">${err.message}</p>
        </div>`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  app.innerHTML = `
    <div class="admin-card" style="padding:40px; text-align:center;">
      <h2>404 – Page not found</h2>
      <a href="#/dashboard" class="admin-btn" style="margin-top:14px;">Go to dashboard</a>
    </div>`;
};

// ============ INIT ============
const init = async () => {
  await initAdminAuth();
  onAdminAuthChange(() => {
    // Redirect to main login page if user logs out
    if (!isAdminLoggedIn()) {
      redirectToLogin();
    }
  });

  document.getElementById('admin-logout-btn')?.addEventListener('click', async () => {
    await adminSignOut();
  });

  window.addEventListener('hashchange', router);
  await router();
};

init().catch(err => {
  console.error('[admin init]', err);
  document.getElementById('admin-app').innerHTML = `
    <div style="padding:40px;">
      <h2>Admin setup error</h2>
      <p style="color:#6b7280; margin-top:8px;">${err.message}</p>
      <p style="color:#6b7280; margin-top:8px;">Check your Supabase credentials in <code>js/supabase.js</code>.</p>
    </div>`;
});

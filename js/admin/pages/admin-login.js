import { adminSignIn, adminSignOut, checkAdminRole } from '../admin-auth.js';
import { showAdminToast } from '../admin-app.js';

export const renderAdminLogin = (root) => {
  root.innerHTML = `
    <section class="admin-login-page">
      <div class="admin-login-card">
        <div class="admin-logo">
          <span class="logo-mark">E</span>
          <div>
            <div class="logo-name">Elasobi</div>
            <div class="logo-sub">Admin Panel</div>
          </div>
        </div>
        <h1>Admin Sign In</h1>
        <p class="subtitle">Restricted area — administrators only</p>
        <div id="login-error" class="admin-login-error" hidden></div>
        <form id="admin-login-form" novalidate>
          <div class="admin-form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="admin@elasobi.com" required />
          </div>
          <div class="admin-form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" required />
          </div>
          <button type="submit" id="login-submit">Sign In</button>
        </form>
        <p class="admin-login-hint">
          <i class="fas fa-info-circle"></i>
          Default credentials: <strong>admin@elasobi.com</strong> / <strong>admin123</strong>
        </p>
      </div>
    </section>
  `;

  const errorEl = root.querySelector('#login-error');
  const btn     = root.querySelector('#login-submit');
  const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };
  const hideError = () => { errorEl.hidden = true; };

  root.querySelector('#admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    const fd = new FormData(e.target);
    const email = fd.get('email')?.trim();
    const password = fd.get('password');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    try {
      const { error } = await adminSignIn(email, password);
      if (error) throw error;

      const isAdmin = await checkAdminRole();
      if (!isAdmin) {
        await adminSignOut();
        showError('Access denied. Admins only.');
        btn.disabled = false;
        btn.textContent = 'Sign In';
        return;
      }

      showAdminToast('Welcome back, admin!', 'success');
      location.hash = '#/dashboard';
    } catch (err) {
      console.error('[admin-login]', err);
      showError(err.message || 'Sign in failed. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
};

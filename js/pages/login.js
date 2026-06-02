import { signIn, signUp, checkAdminRole } from '../auth.js';
import { mergeGuestCart } from '../cart.js';
import { showToast, navigate } from '../app.js';

export const renderLogin = (root) => {
  root.innerHTML = renderForm('login');
  bindForm(root, 'login');
};

const renderForm = (mode) => `
  <section class="auth-page">
    <div class="auth-logo"><a href="#/">Elasobi</a></div>
    <h1>${mode === 'login' ? 'Sign In' : 'Create Account'}</h1>
    <p class="auth-subtitle">${mode === 'login' ? 'Welcome back!' : 'Join us to start shopping'}</p>
    <div id="auth-error" class="auth-error" hidden></div>
    <form id="auth-form" novalidate>
      ${mode === 'register' ? `
        <div class="form-group"><label>Full Name</label><input type="text" name="fullName" placeholder="John Doe" required /></div>` : ''}
      <div class="form-group"><label>Email</label><input type="email" name="email" placeholder="you@example.com" required /></div>
      <div class="form-group"><label>Password</label><input type="password" name="password" minlength="6" placeholder="Min. 6 characters" required /></div>
      <button type="submit" class="auth-submit-btn" id="auth-btn">
        ${mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>
    </form>
    ${mode === 'login' ? '' : ''}
    <p class="auth-toggle">
      ${mode === 'login'
        ? 'New here? <a href="#" id="toggle-mode">Create an account</a>'
        : 'Already have an account? <a href="#" id="toggle-mode">Sign in</a>'}
    </p>
    <a href="#/" style="display:block;text-align:center;margin-top:16px;font-size:14px;color:var(--text-muted);">
      <i class="fas fa-arrow-left" style="margin-right:6px;"></i>Back to Store
    </a>
  </section>`;

const bindForm = (root, mode) => {
  root.querySelector('#auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd       = new FormData(e.target);
    const email    = fd.get('email')?.trim();
    const password = fd.get('password');
    const fullName = fd.get('fullName')?.trim();
    const btn      = root.querySelector('#auth-btn');
    const errEl    = root.querySelector('#auth-error');

    errEl.hidden  = true;

    if (mode === 'register' && !/^[a-zA-Z\s]+$/.test(fullName)) {
      errEl.textContent = 'Full name must contain letters only.';
      errEl.hidden = false;
      return;
    }

    btn.disabled  = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        await mergeGuestCart();
        const isAdmin = await checkAdminRole();
        if (isAdmin) {
          showToast('Welcome back, admin!', 'success');
          window.location.href = 'admin.html';
          return;
        }
        showToast('Welcome back!', 'success');
        navigate('/');
      } else {
        const { data, error } = await signUp(email, password, fullName);
        if (error) throw error;
        if (data?.user && !data?.session) {
          root.innerHTML = `
            <section class="auth-page">
              <div class="auth-logo"><a href="#/">Elasobi</a></div>
              <div style="text-align:center;padding:20px 0;">
                <i class="fas fa-envelope" style="font-size:48px;color:#6c63ff;margin-bottom:16px;"></i>
                <h2 style="margin-bottom:12px;">Check your email</h2>
                <p style="color:#666;margin-bottom:20px;">We sent a confirmation link to <strong>${email}</strong>.<br/>Click it to activate your account, then sign in.</p>
                <a href="#/login" class="btn-primary">Back to Sign In</a>
              </div>
            </section>`;
          return;
        }
        if (data?.session) {
          await mergeGuestCart();
          showToast('Account created! Welcome to Elasobi.', 'success');
          navigate('/');
          return;
        }
        showToast('Account created! Please sign in.', 'success');
        navigate('/login');
      }
    } catch (err) {
      errEl.textContent = err.message || 'Something went wrong. Please try again.';
      errEl.hidden = false;
      btn.disabled = false;
      btn.textContent = mode === 'login' ? 'Sign In' : 'Create Account';
    }
  });

  root.querySelector('#toggle-mode').addEventListener('click', (e) => {
    e.preventDefault();
    const next = mode === 'login' ? 'register' : 'login';
    root.innerHTML = renderForm(next);
    bindForm(root, next);
  });
};

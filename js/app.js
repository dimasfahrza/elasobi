import { initAuth, isLoggedIn, onAuthChange, checkAdminRole } from './auth.js';
import { fetchCategories } from './products.js';
import { getCartCount, onCartChange } from './cart.js';
import { getWishlistCount, onWishlistChange } from './wishlist.js';

import { renderHome }        from './pages/home.js';
import { renderAbout }       from './pages/about.js';
import { renderProducts, renderCategoryPage, renderSearchResults } from './pages/products.js';
import { renderProductDetail } from './pages/product-detail.js';
import { renderCart }        from './pages/cart.js';
import { renderWishlist }    from './pages/wishlist.js';
import { renderCheckout }    from './pages/checkout.js';
import { renderLogin }       from './pages/login.js';
import { renderAccount }     from './pages/account.js';

// ============ TOAST ============
export const showToast = (msg, type = '') => {
  const t = document.getElementById('toast');
  t.className = 'toast ' + type;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showToast._id);
  showToast._id = setTimeout(() => { t.hidden = true; }, 2500);
};

// ============ NAVIGATE ============
export const navigate = (path) => { location.hash = '#' + path; };

// ============ LOGIN REQUIRED MODAL ============
export const showLoginRequiredModal = () => {
  const existing = document.getElementById('login-required-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'login-required-modal';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:16px;
  `;

  overlay.innerHTML = `
    <div style="
      background:#fff;border-radius:16px;padding:32px 28px;max-width:360px;width:100%;
      text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25);
    ">
      <div style="font-size:40px;margin-bottom:12px;">🤍</div>
      <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#1a1a1a;">Sign in to use Wishlist</h3>
      <p style="font-size:14px;color:#666;margin-bottom:24px;line-height:1.5;">
        Create an account or sign in to save your favourite products.
      </p>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button id="lrm-cancel" style="
          padding:10px 20px;border-radius:50px;border:1px solid #ddd;
          background:#fff;font-size:14px;cursor:pointer;font-weight:500;
        ">Continue Browsing</button>
        <a href="#/login" id="lrm-login" style="
          padding:10px 24px;border-radius:50px;background:#6c63ff;color:#fff;
          font-size:14px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;
        ">Sign In</a>
      </div>
    </div>
  `;

  const close = () => overlay.remove();
  overlay.querySelector('#lrm-cancel').addEventListener('click', close);
  overlay.querySelector('#lrm-login').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  document.body.appendChild(overlay);
};

// Section to scroll to after next route render (null = scroll to top)
let _scrollTarget = null;

const closeMobileDrawer = () => {
  document.getElementById('mobile-drawer')?.classList.remove('open');
  document.getElementById('hamburger-btn')?.classList.remove('open');
};

// ============ ROUTER ============
const routes = [
  { pattern: /^\/?$/,               handler: renderHome },
  { pattern: /^\/about$/,           handler: renderAbout },
  { pattern: /^\/products$/,        handler: renderProducts },
  { pattern: /^\/products\/(\d+)$/, handler: (root, m) => renderProductDetail(root, m[1]) },
  { pattern: /^\/category\/(.+)$/,  handler: (root, m) => renderCategoryPage(root, m[1]) },
  { pattern: /^\/search\/(.+)$/,    handler: (root, m) => renderSearchResults(root, decodeURIComponent(m[1])) },
  { pattern: /^\/cart$/,            handler: renderCart },
  { pattern: /^\/wishlist$/,        handler: renderWishlist },
  { pattern: /^\/checkout$/,        handler: renderCheckout },
  { pattern: /^\/login$/,           handler: renderLogin },
  { pattern: /^\/account$/,         handler: renderAccount },
];

const router = async () => {
  const path = (location.hash || '#/').slice(1) || '/';
  const root = document.getElementById('app');

  closeMobileDrawer();
  document.body.dataset.page = path === '/login' ? 'login' : '';

  document.querySelectorAll('.main-menu a').forEach(a => {
    const base = '/' + (path.split('/')[1] || '');
    a.classList.toggle('active', a.dataset.route === base || (path === '/' && a.dataset.route === '/'));
  });

  for (const r of routes) {
    const m = path.match(r.pattern);
    if (m) {
      try {
        await r.handler(root, m);
      } catch (err) {
        console.error(err);
        root.innerHTML = `<section class="container" style="padding:60px 0;"><h1>Something went wrong</h1><p>${err.message}</p></section>`;
      }
      if (_scrollTarget) {
        const el = document.getElementById(_scrollTarget);
        _scrollTarget = null;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      await refreshBadges();
      return;
    }
  }

  root.innerHTML = `
    <section class="container" style="padding:60px 0; text-align:center;">
      <h1>404 — Page not found</h1>
      <a href="#/" class="btn-primary" style="margin-top:20px;">Go home</a>
    </section>`;
};

// ============ BADGES ============
const refreshBadges = async () => {
  const cartCount = await getCartCount();
  const wishCount = await getWishlistCount();
  const cb = document.getElementById('cart-badge');
  const wb = document.getElementById('wishlist-badge');
  cb.textContent = cartCount; cb.hidden = cartCount === 0;
  wb.textContent = wishCount; wb.hidden = wishCount === 0;
};

// ============ HEADER ============
const setupHeader = async () => {
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('search-input').value.trim();
    if (q) { closeMobileDrawer(); navigate('/search/' + encodeURIComponent(q)); }
  });

  const catBtn  = document.getElementById('category-btn');
  const catMenu = document.getElementById('category-menu');
  const catGo   = document.getElementById('category-go');
  let selectedSlug = null;

  const cats = await fetchCategories();
  catMenu.innerHTML = cats.map(c =>
    `<li><a href="#" data-slug="${c.slug}">${c.name}</a></li>`
  ).join('');

  catBtn.addEventListener('click', () => { catMenu.hidden = !catMenu.hidden; });
  document.addEventListener('click', (e) => {
    if (!catBtn.contains(e.target) && !catMenu.contains(e.target)) catMenu.hidden = true;
  });
  catMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      selectedSlug = a.dataset.slug;
      catBtn.querySelector('span').textContent = a.textContent;
      catMenu.hidden = true;
    });
  });
  catGo.addEventListener('click', () => {
    navigate(selectedSlug ? '/category/' + selectedSlug : '/products');
  });

  // ---- Contact Now → scroll to contact form ----
  document.getElementById('contact-now-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    const alreadyOnAbout = (location.hash === '#/about' || location.hash === '#/about/');
    if (alreadyOnAbout) {
      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      _scrollTarget = 'contact-section';
      navigate('/about');
    }
  });

  // ---- Hamburger / mobile drawer ----
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const drawer       = document.getElementById('mobile-drawer');

  hamburgerBtn?.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    hamburgerBtn.classList.toggle('open', isOpen);
    // Set drawer top to match current header height
    const headerH = document.querySelector('.site-header')?.offsetHeight ?? 110;
    drawer.style.top = headerH + 'px';
  });

  // Close drawer when any mobile nav link is clicked
  drawer?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeMobileDrawer());
  });

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (drawer?.classList.contains('open') &&
        !drawer.contains(e.target) &&
        !hamburgerBtn.contains(e.target)) {
      closeMobileDrawer();
    }
  });
};

// ============ SCROLL TOP ============
const setupScrollTop = () => {
  const btn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => { btn.classList.toggle('visible', window.scrollY > 400); });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
};

// ============ ADMIN SHORTCUT ============
const updateAdminShortcut = async () => {
  const el = document.getElementById('admin-shortcut');
  if (!el) return;
  const isAdmin = isLoggedIn() && await checkAdminRole();
  el.hidden = !isAdmin;
  el.style.display = isAdmin ? 'flex' : 'none';
};

// ============ INIT ============
const init = async () => {
  await initAuth();
  onAuthChange(async () => { await refreshBadges(); await updateAdminShortcut(); });
  onCartChange(refreshBadges);
  onWishlistChange(refreshBadges);
  await setupHeader();
  setupScrollTop();
  window.addEventListener('hashchange', router);
  await router();
  await refreshBadges();
  await updateAdminShortcut();
};

init().catch(err => {
  console.error('Init error:', err);
  document.getElementById('app').innerHTML = `
    <section class="container" style="padding:60px 0;">
      <h1>Setup required</h1>
      <p>Please configure your Supabase credentials in <code>js/supabase.js</code></p>
      <p style="color:#666; margin-top:8px; font-size:14px;">Error: ${err.message}</p>
    </section>`;
});

import { initAuth, isLoggedIn, onAuthChange } from './auth.js';
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

// ============ INIT ============
const init = async () => {
  await initAuth();
  onAuthChange(refreshBadges);
  onCartChange(refreshBadges);
  onWishlistChange(refreshBadges);
  await setupHeader();
  setupScrollTop();
  window.addEventListener('hashchange', router);
  await router();
  await refreshBadges();
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

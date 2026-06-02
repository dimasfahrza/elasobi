import { fetchProducts, fetchProductById, formatPrice } from '../products.js';
import { addToCart } from '../cart.js';
import { toggleWishlist, isInWishlist } from '../wishlist.js';
import { showToast } from '../app.js';

export const renderHome = async (root) => {
  root.innerHTML = `
    <div class="container">
      <section class="hero-section">
        <div class="hero-main"></div>
        <div class="hero-side">
          <div class="promo-card" id="promo-iphone">
            <h2>iPhone 17</h2>
            <p class="price"><del>NT$26,000</del> NT$25,000</p>
            <a href="#/products" class="shop-btn" id="promo-iphone-link">Shop now</a>
          </div>
          <div class="promo-card" id="promo-airpods">
            <h2>Airpods Pro 3</h2>
            <p class="price"><del>NT$6,900</del> NT$6,500</p>
            <a href="#/products" class="shop-btn" id="promo-airpods-link">Shop now</a>
          </div>
        </div>
      </section>

      <section class="features-bar">
        <div class="feature"><span class="feature-icon purple"><i class="fas fa-truck"></i></span><div><h4>Free Delivery</h4><p>Free shipping on all orders</p></div></div>
        <div class="feature"><span class="feature-icon green"><i class="fas fa-shield-alt"></i></span><div><h4>100% Authentic</h4><p>Guaranteed genuine products</p></div></div>
        <div class="feature"><span class="feature-icon blue"><i class="fas fa-headset"></i></span><div><h4>24/7 Support</h4><p>Online support every day</p></div></div>
        <div class="feature"><span class="feature-icon orange"><i class="fas fa-undo"></i></span><div><h4>7-Day Returns</h4><p>Money back guarantee</p></div></div>
      </section>

      <section style="margin: 48px 0;">
        <div class="section-header">
          <h2>Special Offers</h2>
          <div class="countdown">
            <span class="days"><strong id="cd-days">--</strong> Days</span>
            <span class="timer" id="cd-timer">--:--:--</span>
          </div>
        </div>
        <div class="product-grid" id="special-grid"><div class="loader"></div></div>
      </section>

      <section class="products-section">
        <h2>Products</h2>
        <div class="product-grid" id="all-grid"><div class="loader"></div></div>
      </section>
    </div>
  `;

  // Hero images — use Supabase PNG uploads (transparent background)
  const iphoneImg = document.createElement('img');
  iphoneImg.src = 'https://weuhzwltefdervbkjjhq.supabase.co/storage/v1/object/public/product-images/1, 11.png';
  iphoneImg.className = 'promo-img'; iphoneImg.alt = 'iPhone 17';
  root.querySelector('#promo-iphone').appendChild(iphoneImg);

  const airpodsImg = document.createElement('img');
  airpodsImg.src = 'https://weuhzwltefdervbkjjhq.supabase.co/storage/v1/object/public/product-images/9.png';
  airpodsImg.className = 'promo-img'; airpodsImg.alt = 'Airpods Pro 3';
  root.querySelector('#promo-airpods').appendChild(airpodsImg);

  root.querySelector('.hero-main').innerHTML = `
    <div style="display:flex;height:100%;align-items:center;justify-content:center;padding:40px;">
      <div style="text-align:center;">
        <h1 style="font-size:48px;font-weight:800;margin-bottom:16px;color:#1a1a1a;line-height:1.2;">Authentic Apple<br/>Products</h1>
        <p style="font-size:18px;color:#666;margin-bottom:28px;">Premium quality, guaranteed authentic</p>
        <a href="#/products" class="btn-primary" style="background:#111;padding:14px 40px;font-size:15px;">Shop All Products</a>
      </div>
    </div>`;

  startCountdown(root);

  const [special, all] = await Promise.all([fetchProducts({ onSale: true }), fetchProducts()]);

  // Set dynamic promo links
  const ip = all.find(p => p.slug === 'iphone-17');
  const ap = all.find(p => p.slug === 'airpods-pro-3');
  if (ip) root.querySelector('#promo-iphone-link').href  = `#/products/${ip.id}`;
  if (ap) root.querySelector('#promo-airpods-link').href = `#/products/${ap.id}`;

  if (!all.length) {
    const warn = `
      <div style="grid-column:1/-1;padding:28px;background:#fff8e1;border:1px solid #ffe082;border-radius:8px;">
        <p style="font-weight:700;margin-bottom:8px;">⚠️ No products found</p>
        <ol style="margin-left:20px;font-size:14px;color:#555;line-height:2;">
          <li>Check your Supabase credentials in <code>js/supabase.js</code></li>
          <li>Run <code>supabase/seed.sql</code> in Supabase SQL Editor</li>
          <li>Make sure <code>schema.sql</code> RLS policies were applied</li>
        </ol>
      </div>`;
    root.querySelector('#special-grid').innerHTML = warn;
    root.querySelector('#all-grid').innerHTML     = warn;
    return;
  }

  root.querySelector('#special-grid').innerHTML = await renderProductGrid(special.slice(0, 4));
  root.querySelector('#all-grid').innerHTML     = await renderProductGrid(all.slice(0, 8));
  bindGridActions(root);
};

const startCountdown = (root) => {
  const target = new Date(Date.now() + 39 * 24 * 60 * 60 * 1000);
  const dEl = root.querySelector('#cd-days');
  const tEl = root.querySelector('#cd-timer');
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    const s = Math.floor((diff / 1000) % 60);
    if (dEl) dEl.textContent = String(d).padStart(2, '0');
    if (tEl) tEl.textContent = `${String(h).padStart(2,'0')} : ${String(m).padStart(2,'0')} : ${String(s).padStart(2,'0')}`;
  };
  tick();
  const id = setInterval(tick, 1000);
  const obs = new MutationObserver(() => { if (!document.contains(dEl)) { clearInterval(id); obs.disconnect(); } });
  obs.observe(document.body, { childList: true, subtree: true });
};

export const renderProductGrid = async (products) => {
  if (!products.length) return '<p style="color:#666;grid-column:1/-1;">No products found.</p>';
  const cards = await Promise.all(products.map(async p => productCardHTML(p, await isInWishlist(p.id))));
  return cards.join('');
};

export const productCardHTML = (p, inWishlist = false) => {
  const price = p.is_on_sale && p.sale_price
    ? `<del>${formatPrice(p.price)}</del> <span class="sale-price">${formatPrice(p.sale_price)}</span>`
    : `<span class="reg-price">${formatPrice(p.price)}</span>`;
  return `
    <div class="product-card" data-product-id="${p.id}">
      <div class="img-wrap">
        <a href="#/products/${p.id}">
          <img src="${p.image_url}" alt="${p.name}" loading="lazy"
            onerror="this.src='https://placehold.co/300x300/f5f5f5/999?text=No+Image'" />
        </a>
        ${p.is_on_sale ? '<span class="sale-badge">SALE</span>' : ''}
        <button class="wishlist-toggle ${inWishlist ? 'active' : ''}" data-action="wishlist" aria-label="Wishlist">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <div class="product-card-body">
        <h3><a href="#/products/${p.id}">${p.name}</a></h3>
        <p class="price">${price}</p>
        <button class="add-cart-btn" data-action="add-cart">Add to cart</button>
      </div>
    </div>`;
};

export const bindGridActions = (root) => {
  root.querySelectorAll('.product-card').forEach(card => {
    const id = Number(card.dataset.productId);
    card.querySelector('[data-action="add-cart"]')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.textContent = 'Adding...'; btn.disabled = true;
      const p = await fetchProductById(id);
      if (p) { await addToCart(p, 1); showToast(`${p.name} added to cart`, 'success'); }
      btn.textContent = 'Add to cart'; btn.disabled = false;
    });
    card.querySelector('[data-action="wishlist"]')?.addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      const p = await fetchProductById(id);
      if (p) {
        const added = await toggleWishlist(p);
        e.currentTarget.classList.toggle('active', added);
        showToast(added ? 'Added to wishlist' : 'Removed from wishlist', 'success');
      }
    });
  });
};

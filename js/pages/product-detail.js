import { fetchProductById, formatPrice } from '../products.js';
import { addToCart } from '../cart.js';
import { toggleWishlist, isInWishlist } from '../wishlist.js';
import { showToast, showLoginRequiredModal } from '../app.js';

export const renderProductDetail = async (root, id) => {
  root.innerHTML = `<div class="loader"></div>`;
  const p = await fetchProductById(id);
  if (!p) {
    root.innerHTML = `<section class="container" style="padding:60px 0;text-align:center;"><h1>Product not found</h1><a href="#/products" class="btn-primary" style="margin-top:20px;">Back to products</a></section>`;
    return;
  }
  const inWish = await isInWishlist(p.id);
  const priceHTML = p.is_on_sale && p.sale_price
    ? `<del>${formatPrice(p.price)}</del> <span class="sale">${formatPrice(p.sale_price)}</span>`
    : formatPrice(p.price);

  root.innerHTML = `
    <div class="container product-detail">
      <div class="product-image"><img src="${p.image_url}" alt="${p.name}" /></div>
      <div>
        <h1>${p.name}</h1>
        <div class="price-block">${priceHTML}</div>
        <p class="description">${p.description || ''}</p>
        <div class="qty-control" style="margin-bottom:16px;">
          <button id="dec">−</button>
          <input id="qty" type="number" value="1" min="1" />
          <button id="inc">+</button>
        </div>
        <div class="actions">
          <button class="add-cart" id="btn-cart">Add to cart</button>
          <button class="add-wishlist ${inWish ? 'active' : ''}" id="btn-wish">
            <i class="${inWish ? 'fas' : 'far'} fa-heart"></i> ${inWish ? 'In wishlist' : 'Add to wishlist'}
          </button>
        </div>
        <p style="margin-top:24px;color:#666;font-size:14px;">
          Category: <a href="#/category/${p.categories?.slug}" style="color:#6c63ff;">${p.categories?.name || '—'}</a><br/>
          ${p.stock > 0 ? '<span class="in-stock">In Stock</span>' : '<span class="out-of-stock">Out of Stock</span>'}
        </p>
      </div>
    </div>`;

  const qtyEl = root.querySelector('#qty');
  root.querySelector('#dec').addEventListener('click', () => { qtyEl.value = Math.max(1, Number(qtyEl.value) - 1); });
  root.querySelector('#inc').addEventListener('click', () => { qtyEl.value = Number(qtyEl.value) + 1; });
  root.querySelector('#btn-cart').addEventListener('click', async () => {
    await addToCart(p, Math.max(1, Number(qtyEl.value)));
    showToast(`${p.name} added to cart`, 'success');
  });
  root.querySelector('#btn-wish').addEventListener('click', async (e) => {
    const result = await toggleWishlist(p);
    if (result?.loginRequired) { showLoginRequiredModal(); return; }
    showToast(result ? 'Added to wishlist' : 'Removed from wishlist', 'success');
    e.currentTarget.className = `add-wishlist ${result ? 'active' : ''}`;
    e.currentTarget.innerHTML = `<i class="${result ? 'fas' : 'far'} fa-heart"></i> ${result ? 'In wishlist' : 'Add to wishlist'}`;
  });
};

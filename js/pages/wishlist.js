import { getWishlist, removeFromWishlist } from '../wishlist.js';
import { addToCart } from '../cart.js';
import { formatPrice } from '../products.js';
import { showToast } from '../app.js';

export const renderWishlist = async (root) => {
  root.innerHTML = `
    <section class="page-banner"><h1>Wishlist</h1></section>
    <section class="container wishlist-page">
      <h2>My wishlist</h2>
      <div id="wishlist-body"><div class="loader"></div></div>
    </section>`;
  await renderBody(root);
};

const renderBody = async (root) => {
  const items = await getWishlist();
  const body  = root.querySelector('#wishlist-body');

  if (!items.length) {
    body.innerHTML = `<div class="empty-state"><i class="fas fa-heart"></i><p>Your wishlist is empty</p><a href="#/products" class="btn-primary">Browse products</a></div>`;
    return;
  }

  body.innerHTML = `
    <table class="wishlist-table">
      <thead><tr><th></th><th>Product name</th><th>Unit price</th><th>Stock status</th><th></th></tr></thead>
      <tbody>
        ${items.map(it => {
          const p     = it.product;
          const price = p.is_on_sale && p.sale_price
            ? `<del>${formatPrice(p.price)}</del> <u>${formatPrice(p.sale_price)}</u>`
            : formatPrice(p.price);
          const itemId = it.id ?? p.id;
          return `
            <tr data-item-id="${itemId}" data-product-id="${p.id}">
              <td><button class="wishlist-remove" data-action="remove"><i class="fas fa-times"></i></button></td>
              <td><div class="wishlist-product"><img src="${p.image_url}" alt="${p.name}" /><a href="#/products/${p.id}"><strong>${p.name}</strong></a></div></td>
              <td>${price}</td>
              <td>${p.stock > 0 ? '<span class="in-stock">In Stock</span>' : '<span class="out-of-stock">Out of Stock</span>'}</td>
              <td><button class="add-cart-btn" data-action="add-cart">Add to cart</button></td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;

  body.querySelectorAll('tr[data-item-id]').forEach(tr => {
    const itemId    = Number(tr.dataset.itemId);
    const productId = Number(tr.dataset.productId);

    tr.querySelector('[data-action="remove"]').addEventListener('click', async () => {
      if (itemId) await removeFromWishlist(itemId, false);
      else        await removeFromWishlist(productId, true);
      renderBody(root);
    });
    tr.querySelector('[data-action="add-cart"]').addEventListener('click', async () => {
      const item = items.find(i => i.product.id === productId);
      if (item) { await addToCart(item.product, 1); showToast(`${item.product.name} added to cart`, 'success'); }
    });
  });
};

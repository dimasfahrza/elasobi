import { getCart, updateCartItem, removeFromCart, getCartTotal } from '../cart.js';
import { formatPrice } from '../products.js';
import { validateCoupon } from '../checkout.js';
import { showToast } from '../app.js';

let appliedCoupon = null;

export const renderCart = async (root) => {
  root.innerHTML = `
    <section class="page-banner"><h1>Cart</h1></section>
    <section class="container">
      <div id="cart-body" class="cart-layout"><div class="loader"></div></div>
    </section>`;
  await renderCartBody(root);
};

const renderCartBody = async (root) => {
  const items   = await getCart();
  const body    = root.querySelector('#cart-body');

  if (!items.length) {
    body.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
        <a href="#/products" class="btn-primary">Continue shopping</a>
      </div>`;
    return;
  }

  const subtotal = await getCartTotal();
  const discount = appliedCoupon ? subtotal * appliedCoupon.discount_percent / 100 : 0;
  const total    = subtotal - discount;

  body.innerHTML = `
    <div>
      <table class="cart-table">
        <thead><tr><th>Product</th><th>Total</th></tr></thead>
        <tbody>
          ${items.map(it => {
            const price    = it.product.sale_price ?? it.product.price;
            const itemId   = it.id ?? it.product.id;
            return `
              <tr data-item-id="${itemId}" data-product-id="${it.product.id}">
                <td>
                  <div class="cart-product">
                    <img src="${it.product.image_url}" alt="${it.product.name}" />
                    <div class="cart-product-info">
                      <a href="#/products/${it.product.id}">${it.product.name}</a>
                      <div class="unit-price">${formatPrice(price)}</div>
                      <div style="display:flex;align-items:center;">
                        <div class="qty-control">
                          <button data-action="dec">−</button>
                          <input type="number" min="1" value="${it.quantity}" data-action="qty" />
                          <button data-action="inc">+</button>
                        </div>
                        <button class="cart-remove" data-action="remove"><i class="fas fa-trash"></i></button>
                      </div>
                    </div>
                  </div>
                </td>
                <td><strong>${formatPrice(Number(price) * it.quantity)}</strong></td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <aside class="cart-totals">
      <h3>Cart Totals</h3>
      <button class="coupon-toggle" id="coupon-toggle">
        <span>Add coupons</span><i class="fas fa-chevron-down"></i>
      </button>
      <div class="coupon-form" id="coupon-form" hidden>
        <input type="text" id="coupon-code" placeholder="Coupon code" />
        <button id="apply-coupon">Apply</button>
      </div>
      ${appliedCoupon ? `<div class="cart-row"><span>Coupon (${appliedCoupon.code})</span><span style="color:#16a34a;">−${formatPrice(discount)}</span></div>` : ''}
      <div class="cart-row"><span>Free shipping</span><strong>FREE</strong></div>
      <div class="cart-row total"><span>Estimated total</span><span>${formatPrice(total)}</span></div>
      <a href="#/checkout" class="checkout-btn" style="display:block;text-align:center;text-decoration:none;">Proceed to Checkout</a>
      <p style="margin-top:12px;font-size:12px;color:#666;text-align:center;">Try coupon: <strong>WELCOME10</strong></p>
    </aside>`;

  body.querySelectorAll('tr[data-item-id]').forEach(tr => {
    const itemId    = Number(tr.dataset.itemId);
    const productId = Number(tr.dataset.productId);
    const idForOps  = itemId || productId;
    const qtyEl     = tr.querySelector('[data-action="qty"]');

    tr.querySelector('[data-action="dec"]').addEventListener('click', async () => {
      await updateCartItem(idForOps, Math.max(1, Number(qtyEl.value) - 1));
      renderCartBody(root);
    });
    tr.querySelector('[data-action="inc"]').addEventListener('click', async () => {
      await updateCartItem(idForOps, Number(qtyEl.value) + 1);
      renderCartBody(root);
    });
    qtyEl.addEventListener('change', async () => {
      await updateCartItem(idForOps, Math.max(1, Number(qtyEl.value)));
      renderCartBody(root);
    });
    tr.querySelector('[data-action="remove"]').addEventListener('click', async () => {
      await removeFromCart(idForOps);
      renderCartBody(root);
    });
  });

  body.querySelector('#coupon-toggle').addEventListener('click', () => {
    const f = body.querySelector('#coupon-form');
    f.hidden = !f.hidden;
  });
  body.querySelector('#apply-coupon').addEventListener('click', async () => {
    const code = body.querySelector('#coupon-code').value.trim();
    const c    = await validateCoupon(code);
    if (c) { appliedCoupon = c; showToast(`Coupon applied: ${c.discount_percent}% off`, 'success'); renderCartBody(root); }
    else   { showToast('Invalid or expired coupon', 'error'); }
  });
};

export const getAppliedCoupon  = () => appliedCoupon;
export const clearAppliedCoupon = () => { appliedCoupon = null; };

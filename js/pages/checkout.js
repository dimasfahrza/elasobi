import { getCart, getCartTotal } from '../cart.js';
import { isLoggedIn, getUser } from '../auth.js';
import { placeOrder } from '../checkout.js';
import { formatPrice } from '../products.js';
import { showToast, navigate } from '../app.js';
import { getAppliedCoupon, clearAppliedCoupon } from './cart.js';

export const renderCheckout = async (root) => {
  if (!isLoggedIn()) {
    root.innerHTML = `
      <section class="container" style="padding:60px 20px;text-align:center;">
        <h1 style="margin-bottom:16px;">Sign in to check out</h1>
        <p style="margin-bottom:24px;color:#666;">You need an account to place an order.</p>
        <a href="#/login" class="btn-primary">Login or Register</a>
      </section>`;
    return;
  }
  const items = await getCart();
  if (!items.length) {
    root.innerHTML = `
      <section class="container" style="padding:60px 20px;text-align:center;">
        <h1>Your cart is empty</h1>
        <a href="#/products" class="btn-primary" style="margin-top:20px;">Browse products</a>
      </section>`;
    return;
  }

  const subtotal = await getCartTotal();
  const coupon   = getAppliedCoupon();
  const discount = coupon ? subtotal * coupon.discount_percent / 100 : 0;
  const total    = subtotal - discount;

  root.innerHTML = `
    <section class="container checkout-page">
      <h1>Checkout</h1>
      <form id="checkout-form" class="checkout-layout">
        <div class="checkout-form">
          <h3 style="margin-top:0;">Shipping Information</h3>
          <div class="form-group"><label>Full Name *</label><input type="text" name="fullName" required /></div>
          <div class="form-row">
            <div class="form-group"><label>Phone *</label><input type="tel" name="phone" required /></div>
            <div class="form-group"><label>Email</label><input type="email" name="email" value="${getUser()?.email || ''}" readonly /></div>
          </div>
          <div class="form-group"><label>Address *</label><input type="text" name="address" required /></div>
          <div class="form-row">
            <div class="form-group"><label>City *</label><input type="text" name="city" required /></div>
            <div class="form-group"><label>Postal Code *</label><input type="text" name="postalCode" required /></div>
          </div>
          <div class="form-group"><label>Country *</label><input type="text" name="country" value="Taiwan" required /></div>

          <h3>Payment Method</h3>
          <div class="payment-methods">
            <label class="payment-option"><input type="radio" name="payment" value="credit_card" checked /><i class="far fa-credit-card"></i><span>Credit / Debit Card (Mock)</span></label>
            <label class="payment-option"><input type="radio" name="payment" value="bank_transfer" /><i class="fas fa-university"></i><span>Bank Transfer</span></label>
            <label class="payment-option"><input type="radio" name="payment" value="cash_on_delivery" /><i class="fas fa-money-bill-wave"></i><span>Cash on Delivery</span></label>
          </div>
          <div id="card-fields" style="margin-top:16px;">
            <div class="form-group"><label>Card Number</label><input type="text" placeholder="4242 4242 4242 4242" maxlength="19" /></div>
            <div class="form-row">
              <div class="form-group"><label>Expiry</label><input type="text" placeholder="MM/YY" maxlength="5" /></div>
              <div class="form-group"><label>CVC</label><input type="text" placeholder="123" maxlength="4" /></div>
            </div>
            <p style="font-size:12px;color:#666;margin-top:6px;"><i class="fas fa-info-circle"></i> Mock checkout — no real payment processed.</p>
          </div>
        </div>
        <aside class="checkout-summary">
          <h3>Order Summary</h3>
          ${items.map(it => `
            <div class="summary-item">
              <span>${it.product.name} × ${it.quantity}</span>
              <strong>${formatPrice((it.product.sale_price ?? it.product.price) * it.quantity)}</strong>
            </div>`).join('')}
          <hr style="margin:16px 0;border:none;border-top:1px solid var(--border);" />
          <div class="summary-item"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
          ${coupon ? `<div class="summary-item" style="color:#16a34a;"><span>Coupon (${coupon.code})</span><span>−${formatPrice(discount)}</span></div>` : ''}
          <div class="summary-item"><span>Shipping</span><strong>FREE</strong></div>
          <div class="summary-item" style="font-size:18px;font-weight:700;margin-top:8px;"><span>Total</span><span>${formatPrice(total)}</span></div>
          <button type="submit" class="place-order-btn" id="place-order">Place Order</button>
        </aside>
      </form>
    </section>`;

  root.querySelectorAll('input[name="payment"]').forEach(r => {
    r.addEventListener('change', () => {
      root.querySelector('#card-fields').style.display = (r.value === 'credit_card' && r.checked) ? 'block' : 'none';
    });
  });

  root.querySelector('#checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd  = new FormData(e.target);
    const btn = root.querySelector('#place-order');
    btn.disabled = true; btn.textContent = 'Processing payment...';
    try {
      await new Promise(r => setTimeout(r, 1200));
      const order = await placeOrder({
        shipping: {
          fullName: fd.get('fullName'), phone: fd.get('phone'),
          address: fd.get('address'), city: fd.get('city'),
          postalCode: fd.get('postalCode'), country: fd.get('country'),
        },
        paymentMethod: fd.get('payment'), coupon,
      });
      clearAppliedCoupon();
      showToast(`Order ${order.order_number} placed!`, 'success');
      root.innerHTML = `
        <section class="container" style="padding:80px 20px;text-align:center;max-width:600px;">
          <div style="font-size:64px;color:#16a34a;margin-bottom:20px;"><i class="fas fa-check-circle"></i></div>
          <h1 style="margin-bottom:12px;">Thank you for your order!</h1>
          <p style="color:#666;margin-bottom:24px;">Order <strong>${order.order_number}</strong> placed successfully.<br/>Total: <strong>${formatPrice(order.total)}</strong></p>
          <a href="#/account" class="btn-primary" style="margin-right:8px;">View my orders</a>
          <a href="#/products" class="btn-primary" style="background:#000;">Continue shopping</a>
        </section>`;
    } catch (err) {
      showToast(err.message || 'Order failed. Please try again.', 'error');
      btn.disabled = false; btn.textContent = 'Place Order';
    }
  });
};

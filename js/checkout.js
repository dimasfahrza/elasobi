import { supabase } from './supabase.js';
import { getUser, isLoggedIn } from './auth.js';
import { getCart, clearCart } from './cart.js';

export const validateCoupon = async (code) => {
  if (!code) return null;
  const { data } = await supabase
    .from('coupons').select('*')
    .eq('code', code.toUpperCase()).eq('is_active', true).maybeSingle();
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  return data;
};

export const placeOrder = async ({ shipping, paymentMethod, coupon }) => {
  if (!isLoggedIn()) throw new Error('Please sign in to place an order.');
  const items = await getCart();
  if (!items.length) throw new Error('Your cart is empty.');

  const subtotal = items.reduce((s, i) => s + Number(i.product.sale_price ?? i.product.price) * i.quantity, 0);
  const discount = coupon ? subtotal * (coupon.discount_percent / 100) : 0;
  const total = subtotal - discount;

  const { data: order, error: orderErr } = await supabase
    .from('orders').insert({
      user_id: getUser().id,
      subtotal, discount, shipping: 0, total,
      status: 'paid',
      shipping_full_name: shipping.fullName,
      shipping_phone: shipping.phone,
      shipping_address: shipping.address,
      shipping_city: shipping.city,
      shipping_postal_code: shipping.postalCode,
      shipping_country: shipping.country,
      payment_method: paymentMethod,
      coupon_code: coupon?.code || null,
    }).select().single();

  if (orderErr) throw orderErr;

  const { error: itemsErr } = await supabase.from('order_items').insert(
    items.map(i => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      product_image: i.product.image_url,
      quantity: i.quantity,
      price: i.product.sale_price ?? i.product.price,
    }))
  );
  if (itemsErr) throw itemsErr;

  await clearCart();
  return order;
};

export const fetchUserOrders = async () => {
  if (!isLoggedIn()) return [];
  const { data, error } = await supabase
    .from('orders').select('*, order_items(*)')
    .eq('user_id', getUser().id)
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
};

import { supabase } from './supabase.js';
import { getUser, isLoggedIn } from './auth.js';

const LS_KEY = 'elasobi_cart';
const cartListeners = new Set();
export const onCartChange = (cb) => { cartListeners.add(cb); return () => cartListeners.delete(cb); };
const notify = () => cartListeners.forEach(cb => cb());

const loadLS  = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
const saveLS  = (items) => localStorage.setItem(LS_KEY, JSON.stringify(items));

export const getCart = async () => {
  if (isLoggedIn()) {
    const { data, error } = await supabase
      .from('cart_items').select('id, quantity, product:products(*)')
      .eq('user_id', getUser().id);
    if (error) { console.error(error); return []; }
    return (data || []).map(r => ({ id: r.id, quantity: r.quantity, product: r.product }));
  }
  return loadLS();
};

export const addToCart = async (product, quantity = 1) => {
  if (isLoggedIn()) {
    const userId = getUser().id;
    const { data: existing } = await supabase
      .from('cart_items').select('id, quantity')
      .eq('user_id', userId).eq('product_id', product.id).maybeSingle();
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({ user_id: userId, product_id: product.id, quantity });
    }
  } else {
    const items = loadLS();
    const existing = items.find(i => i.product.id === product.id);
    if (existing) existing.quantity += quantity;
    else items.push({ product, quantity });
    saveLS(items);
  }
  notify();
};

export const updateCartItem = async (idOrProductId, quantity) => {
  if (quantity < 1) return removeFromCart(idOrProductId);
  if (isLoggedIn()) {
    await supabase.from('cart_items').update({ quantity }).eq('id', idOrProductId);
  } else {
    const items = loadLS();
    const it = items.find(i => i.product.id === idOrProductId);
    if (it) { it.quantity = quantity; saveLS(items); }
  }
  notify();
};

export const removeFromCart = async (idOrProductId) => {
  if (isLoggedIn()) {
    await supabase.from('cart_items').delete().eq('id', idOrProductId);
  } else {
    saveLS(loadLS().filter(i => i.product.id !== idOrProductId));
  }
  notify();
};

export const clearCart = async () => {
  if (isLoggedIn()) {
    await supabase.from('cart_items').delete().eq('user_id', getUser().id);
  } else {
    localStorage.removeItem(LS_KEY);
  }
  notify();
};

export const getCartCount = async () => (await getCart()).reduce((s, i) => s + i.quantity, 0);

export const getCartTotal = async () => {
  const items = await getCart();
  return items.reduce((s, i) => s + Number(i.product.sale_price ?? i.product.price) * i.quantity, 0);
};

export const mergeGuestCart = async () => {
  if (!isLoggedIn()) return;
  const guest = loadLS();
  for (const item of guest) await addToCart(item.product, item.quantity);
  localStorage.removeItem(LS_KEY);
};

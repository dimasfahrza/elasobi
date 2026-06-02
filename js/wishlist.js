import { supabase } from './supabase.js';
import { getUser, isLoggedIn } from './auth.js';

const LS_KEY = 'elasobi_wishlist';
const listeners = new Set();
export const onWishlistChange = (cb) => { listeners.add(cb); return () => listeners.delete(cb); };
const notify = () => listeners.forEach(cb => cb());

const loadLS = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
const saveLS = (items) => localStorage.setItem(LS_KEY, JSON.stringify(items));

export const getWishlist = async () => {
  if (isLoggedIn()) {
    const { data, error } = await supabase
      .from('wishlist_items').select('id, product:products(*)')
      .eq('user_id', getUser().id);
    if (error) { console.error(error); return []; }
    return (data || []).map(r => ({ id: r.id, product: r.product }));
  }
  return loadLS();
};

export const isInWishlist = async (productId) =>
  (await getWishlist()).some(i => i.product.id === productId);

export const addToWishlist = async (product) => {
  if (isLoggedIn()) {
    await supabase.from('wishlist_items').insert({ user_id: getUser().id, product_id: product.id });
  } else {
    const items = loadLS();
    if (!items.some(i => i.product.id === product.id)) { items.push({ product }); saveLS(items); }
  }
  notify();
};

export const removeFromWishlist = async (idOrProductId, byProductId = false) => {
  if (isLoggedIn()) {
    if (byProductId) {
      await supabase.from('wishlist_items').delete().eq('user_id', getUser().id).eq('product_id', idOrProductId);
    } else {
      await supabase.from('wishlist_items').delete().eq('id', idOrProductId);
    }
  } else {
    saveLS(loadLS().filter(i => i.product.id !== idOrProductId));
  }
  notify();
};

export const toggleWishlist = async (product) => {
  if (!isLoggedIn()) return { loginRequired: true };
  const inList = await isInWishlist(product.id);
  if (inList) await removeFromWishlist(product.id, true);
  else await addToWishlist(product);
  return !inList;
};

export const getWishlistCount = async () => (await getWishlist()).length;

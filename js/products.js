import { supabase } from './supabase.js';

export const fetchProducts = async ({ categorySlug = null, onSale = null, search = null, featured = null } = {}) => {
  let q = supabase.from('products').select('*, categories(name, slug)').order('id');

  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle();
    if (cat) q = q.eq('category_id', cat.id);
    else return [];
  }
  if (onSale === true)    q = q.eq('is_on_sale', true);
  if (featured === true)  q = q.eq('is_featured', true);
  if (search)             q = q.ilike('name', `%${search}%`);

  const { data, error } = await q;
  if (error) { console.error('[fetchProducts]', error.message); return []; }
  return data || [];
};

export const fetchProductById = async (id) => {
  const { data, error } = await supabase
    .from('products').select('*, categories(name, slug)')
    .eq('id', id).maybeSingle();
  if (error) { console.error('[fetchProductById]', error.message); return null; }
  return data;
};

export const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*').order('id');
  if (error) { console.error('[fetchCategories]', error.message); return []; }
  return data || [];
};

export const formatPrice = (n) => 'NT$' + Number(n).toLocaleString();

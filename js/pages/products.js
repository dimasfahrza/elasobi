import { fetchProducts, fetchCategories } from '../products.js';
import { renderProductGrid, bindGridActions } from './home.js';

const SORT_OPTIONS = `
  <option value="">Sort: Default</option>
  <option value="price-desc">Price: High → Low</option>
  <option value="price-asc">Price: Low → High</option>
  <option value="stock-desc">Stock: Most</option>
  <option value="stock-asc">Stock: Least</option>
  <option value="on-sale">On Sale</option>
  <option value="featured">Featured</option>
`;

const sortBar = () => `
  <div style="display:flex;justify-content:flex-end;margin-bottom:20px;">
    <select id="store-sort" style="
      padding:8px 14px;border-radius:8px;border:1px solid var(--border);
      font-size:14px;background:#fff;cursor:pointer;outline:none;
      color:var(--text);
    ">${SORT_OPTIONS}</select>
  </div>
`;

const applySort = (products, val) => {
  if (val === 'price-desc') return [...products].sort((a, b) => b.price - a.price);
  if (val === 'price-asc')  return [...products].sort((a, b) => a.price - b.price);
  if (val === 'stock-desc') return [...products].sort((a, b) => b.stock - a.stock);
  if (val === 'stock-asc')  return [...products].sort((a, b) => a.stock - b.stock);
  if (val === 'on-sale')    return products.filter(p => p.is_on_sale);
  if (val === 'featured')   return products.filter(p => p.is_featured);
  return products;
};

const bindSort = (root, products, gridWrapId) => {
  root.querySelector('#store-sort')?.addEventListener('change', async (e) => {
    const sorted = applySort(products, e.target.value);
    const wrap = root.querySelector(`#${gridWrapId}`);
    wrap.innerHTML = sorted.length
      ? `<div class="product-grid">${await renderProductGrid(sorted)}</div>`
      : `<p style="color:var(--text-muted);padding:20px 0;">No products found.</p>`;
    bindGridActions(root);
  });
};

export const renderProducts = async (root) => {
  root.innerHTML = `
    <section class="page-banner"><h1>All Products</h1></section>
    <section class="products-page container">
      <div id="categories-list"><div class="loader"></div></div>
    </section>`;

  const cats = await fetchCategories();
  const list = root.querySelector('#categories-list');
  list.innerHTML = '';

  for (const c of cats) {
    const products = await fetchProducts({ categorySlug: c.slug });
    if (!products.length) continue;
    const sec = document.createElement('div');
    sec.className = 'category-section';
    sec.dataset.slug = c.slug;
    sec.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:4px;">
        <h2 style="margin:0;">${c.name}</h2>
        <select class="cat-sort" data-slug="${c.slug}" style="
          padding:7px 12px;border-radius:8px;border:1px solid var(--border);
          font-size:13px;background:#fff;cursor:pointer;color:var(--text);
        ">${SORT_OPTIONS}</select>
      </div>
      <div class="product-grid cat-grid-${c.slug}">${await renderProductGrid(products)}</div>
    `;
    list.appendChild(sec);

    sec.querySelector('.cat-sort').addEventListener('change', async (e) => {
      const sorted = applySort(products, e.target.value);
      const grid = sec.querySelector(`.cat-grid-${c.slug}`);
      grid.innerHTML = sorted.length
        ? await renderProductGrid(sorted)
        : `<p style="color:var(--text-muted);">No products found.</p>`;
      bindGridActions(root);
    });
  }
  bindGridActions(root);
};

export const renderCategoryPage = async (root, slug) => {
  const cats = await fetchCategories();
  const cat  = cats.find(c => c.slug === slug);
  if (!cat) {
    root.innerHTML = `<section class="container" style="padding:60px 0;"><h1>Category not found</h1></section>`;
    return;
  }
  const products = await fetchProducts({ categorySlug: slug });
  root.innerHTML = `
    <section class="page-banner"><h1>${cat.name}</h1></section>
    <section class="products-page container">
      ${sortBar()}
      <div id="cat-grid-wrap">
        <div class="product-grid">${await renderProductGrid(products)}</div>
      </div>
    </section>`;
  bindGridActions(root);
  bindSort(root, products, 'cat-grid-wrap');
};

export const renderSearchResults = async (root, query) => {
  const products = await fetchProducts({ search: query });
  root.innerHTML = `
    <section class="page-banner"><h1>Search: "${query}"</h1></section>
    <section class="products-page container">
      ${products.length ? sortBar() : ''}
      <div id="search-grid-wrap">
        ${products.length
          ? `<div class="product-grid">${await renderProductGrid(products)}</div>`
          : `<div class="empty-state"><i class="fas fa-search"></i><p>No products match "${query}"</p><a class="btn-primary" href="#/products">Browse all products</a></div>`
        }
      </div>
    </section>`;
  bindGridActions(root);
  if (products.length) bindSort(root, products, 'search-grid-wrap');
};

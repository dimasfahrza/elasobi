import { fetchProducts, fetchCategories } from '../products.js';
import { renderProductGrid, bindGridActions } from './home.js';

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
    sec.innerHTML = `<h2>${c.name}</h2><div class="product-grid">${await renderProductGrid(products)}</div>`;
    list.appendChild(sec);
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
      <div class="product-grid">${await renderProductGrid(products)}</div>
    </section>`;
  bindGridActions(root);
};

export const renderSearchResults = async (root, query) => {
  const products = await fetchProducts({ search: query });
  root.innerHTML = `
    <section class="page-banner"><h1>Search: "${query}"</h1></section>
    <section class="products-page container">
      ${products.length
        ? `<div class="product-grid">${await renderProductGrid(products)}</div>`
        : `<div class="empty-state"><i class="fas fa-search"></i><p>No products match "${query}"</p><a class="btn-primary" href="#/products">Browse all products</a></div>`
      }
    </section>`;
  bindGridActions(root);
};

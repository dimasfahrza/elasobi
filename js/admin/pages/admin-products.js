import { supabase } from '../../supabase.js';
import { showAdminToast } from '../admin-app.js';

const fmt = (n) => 'NT$' + Number(n || 0).toLocaleString();

let allCategories = [];
let allProducts   = [];
let editingId     = null; // null = adding new
let deleteId      = null;

// ─── Entry point ────────────────────────────────────────────────────────────
export const renderAdminProducts = async (root) => {
  root.innerHTML = `
    <div class="admin-page-header">
      <div>
        <h1>Products</h1>
        <p>Add, edit, delete products and manage stock</p>
      </div>
      <button class="admin-btn" id="add-product-btn">
        <i class="fas fa-plus"></i> Add Product
      </button>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <input type="text" class="admin-input" id="prod-search"
            placeholder="Search by name…" style="width:220px;" />
          <select class="admin-select admin-select-sm" id="prod-filter-cat">
            <option value="">All Categories</option>
          </select>
          <select class="admin-select admin-select-sm" id="prod-sort">
            <option value="">Sort: Default</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="stock-desc">Stock: Most</option>
            <option value="stock-asc">Stock: Least</option>
            <option value="on-sale">On Sale</option>
            <option value="featured">Featured</option>
          </select>
        </div>
        <span id="prod-count" style="font-size:13px;color:var(--admin-text-muted);"></span>
      </div>
      <div class="admin-table-wrap">
        <div id="prod-body"><div class="admin-loader"></div></div>
      </div>
    </div>

    <!-- ── Product Edit / Add Modal ── -->
    <div class="admin-modal-overlay" id="product-modal" hidden>
      <div class="admin-modal admin-modal-lg">
        <div class="admin-modal-header">
          <h3 id="prod-modal-title">Add Product</h3>
          <button class="admin-modal-close" id="prod-modal-close">&times;</button>
        </div>
        <div class="admin-modal-body">
          <form id="product-form" autocomplete="off">

            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Product Name *</label>
                <input type="text" name="name" required class="admin-input" style="width:100%;" />
              </div>
              <div class="admin-form-group">
                <label>Slug * <small style="color:var(--admin-text-muted);font-weight:400;">(URL-safe, unique)</small></label>
                <input type="text" name="slug" required class="admin-input" style="width:100%;" />
              </div>
            </div>

            <div class="admin-form-group">
              <label>Description</label>
              <textarea name="description" rows="3"
                style="width:100%;resize:vertical;padding:9px 12px;border:1px solid var(--admin-border);border-radius:6px;font:inherit;font-size:14px;"></textarea>
            </div>

            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Price (NT$) *</label>
                <input type="number" name="price" required min="0" step="1"
                  class="admin-input" style="width:100%;" />
              </div>
              <div class="admin-form-group">
                <label>Sale Price (NT$) <small style="color:var(--admin-text-muted);font-weight:400;">optional</small></label>
                <input type="number" name="sale_price" min="0" step="1"
                  class="admin-input" style="width:100%;" placeholder="Leave blank if no sale" />
              </div>
            </div>

            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Category</label>
                <select name="category_id" id="modal-cat-select"
                  class="admin-select" style="width:100%;"></select>
              </div>
              <div class="admin-form-group">
                <label>Stock</label>
                <input type="number" name="stock" min="0" step="1" value="0"
                  class="admin-input" style="width:100%;" />
              </div>
            </div>

            <div class="admin-form-group">
              <label>Image</label>
              <input type="file" name="image_file" id="modal-image-file"
                accept="image/png,image/jpeg,image/webp"
                class="admin-input" style="width:100%;cursor:pointer;" />
              <div style="text-align:center;color:var(--admin-text-muted);font-size:12px;margin:6px 0;">— or paste URL —</div>
              <input type="url" name="image_url" id="modal-image-url"
                class="admin-input" style="width:100%;" placeholder="https://…" />
              <div id="img-preview-wrap" style="margin-top:10px;display:none;">
                <img id="img-preview" src="" alt="Preview"
                  style="max-height:130px;border-radius:8px;border:1px solid var(--admin-border);" />
              </div>
            </div>

            <div style="display:flex;gap:28px;margin-top:6px;">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;">
                <input type="checkbox" name="is_on_sale" class="admin-checkbox" /> On Sale
              </label>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;">
                <input type="checkbox" name="is_featured" class="admin-checkbox" /> Featured
              </label>
            </div>

          </form>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-btn admin-btn-secondary" id="prod-modal-cancel">Cancel</button>
          <button class="admin-btn" id="prod-modal-save">
            <i class="fas fa-save"></i> Save Product
          </button>
        </div>
      </div>
    </div>

    <!-- ── Delete Confirm Modal ── -->
    <div class="admin-modal-overlay" id="delete-modal" hidden>
      <div class="admin-modal" style="max-width:440px;">
        <div class="admin-modal-header">
          <h3>Delete Product</h3>
          <button class="admin-modal-close" id="delete-modal-close">&times;</button>
        </div>
        <div class="admin-modal-body">
          <p style="font-size:15px;">Delete <strong id="delete-prod-name"></strong>?</p>
          <p style="font-size:13px;color:var(--admin-text-muted);margin-top:8px;">
            This cannot be undone. Existing order history will retain product info.
          </p>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-btn admin-btn-secondary" id="delete-cancel-btn">Cancel</button>
          <button class="admin-btn admin-btn-danger" id="delete-confirm-btn">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `;

  // Load categories once
  const { data: cats } = await supabase
    .from('categories').select('id,name,slug').order('name');
  allCategories = cats || [];

  // Populate category filter dropdown
  const filterCat = root.querySelector('#prod-filter-cat');
  allCategories.forEach(c => {
    const o = document.createElement('option');
    o.value = c.id; o.textContent = c.name;
    filterCat.appendChild(o);
  });

  // Populate modal category select
  populateModalCats(root);

  await loadProducts(root);
  bindModal(root);
  bindDeleteModal(root);
  bindSearch(root);

  root.querySelector('#add-product-btn').addEventListener('click', () => {
    openModal(root, null);
  });
};

// ─── Load & render table ────────────────────────────────────────────────────
const loadProducts = async (root) => {
  root.querySelector('#prod-body').innerHTML = '<div class="admin-loader"></div>';

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id,name)')
    .order('id');

  if (error) {
    root.querySelector('#prod-body').innerHTML =
      `<div class="admin-empty" style="color:var(--admin-danger);">Error: ${error.message}</div>`;
    return;
  }

  allProducts = data || [];
  renderTable(root, allProducts);
};

const renderTable = (root, products) => {
  root.querySelector('#prod-count').textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

  if (!products.length) {
    root.querySelector('#prod-body').innerHTML =
      '<div class="admin-empty">No products found.</div>';
    return;
  }

  root.querySelector('#prod-body').innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th style="width:36px;text-align:center;">#</th>
          <th style="width:52px;"></th>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Sale Price</th>
          <th>Stock</th>
          <th>On Sale</th>
          <th>Featured</th>
          <th class="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map((p, i) => `
          <tr data-id="${p.id}">
            <td style="text-align:center;color:var(--admin-text-muted);font-size:13px;">${i + 1}</td>
            <td>
              <img src="${p.image_url || ''}" alt="${p.name}"
                style="width:42px;height:42px;object-fit:cover;border-radius:6px;border:1px solid var(--admin-border);"
                onerror="this.src='https://placehold.co/42x42/f5f5f5/999?text=?'" />
            </td>
            <td><strong>${p.name}</strong></td>
            <td>${p.categories?.name || '—'}</td>
            <td>${fmt(p.price)}</td>
            <td>${p.sale_price ? fmt(p.sale_price) : '—'}</td>
            <td>
              <input type="number" min="0" value="${p.stock}"
                class="admin-input admin-input-sm" data-field="stock" style="width:72px;" />
              ${p.stock < 5 ? '<span class="badge-stock-low" style="margin-left:4px;">Low</span>' : ''}
            </td>
            <td>
              <input type="checkbox" class="admin-checkbox" data-field="is_on_sale"
                ${p.is_on_sale ? 'checked' : ''} />
            </td>
            <td>
              <input type="checkbox" class="admin-checkbox" data-field="is_featured"
                ${p.is_featured ? 'checked' : ''} />
            </td>
            <td class="col-actions" style="white-space:nowrap;">
              <button class="admin-btn admin-btn-sm" data-action="quick-save" title="Save stock / sale / featured">
                <i class="fas fa-save"></i>
              </button>
              <button class="admin-btn admin-btn-sm admin-btn-secondary" data-action="edit" title="Edit product" style="margin-left:4px;">
                <i class="fas fa-pen"></i>
              </button>
              <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="delete" title="Delete product" style="margin-left:4px;">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Bind row actions
  root.querySelectorAll('#prod-body tr[data-id]').forEach(tr => {
    const id = Number(tr.dataset.id);

    tr.querySelector('[data-action="quick-save"]').addEventListener('click', async (e) => {
      await quickSave(e.currentTarget, tr, id);
    });

    tr.querySelector('[data-action="edit"]').addEventListener('click', () => {
      const p = allProducts.find(x => x.id === id);
      if (p) openModal(root, p);
    });

    tr.querySelector('[data-action="delete"]').addEventListener('click', () => {
      const p = allProducts.find(x => x.id === id);
      if (p) openDeleteModal(root, p);
    });
  });
};

// ─── Quick save (stock + on_sale + featured) ────────────────────────────────
const quickSave = async (btn, tr, id) => {
  const stock      = Number(tr.querySelector('[data-field="stock"]').value);
  const is_on_sale = tr.querySelector('[data-field="is_on_sale"]').checked;
  const is_featured= tr.querySelector('[data-field="is_featured"]').checked;

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  const { error } = await supabase
    .from('products')
    .update({ stock, is_on_sale, is_featured })
    .eq('id', id);

  if (error) {
    showAdminToast(`Save failed: ${error.message}`, 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i>';
    return;
  }

  // Update local cache
  const p = allProducts.find(x => x.id === id);
  if (p) { p.stock = stock; p.is_on_sale = is_on_sale; p.is_featured = is_featured; }

  showAdminToast('Product updated', 'success');
  btn.innerHTML = '<i class="fas fa-check"></i>';
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i>';
  }, 1400);
};

// ─── Search / filter / sort ─────────────────────────────────────────────────
const bindSearch = (root) => {
  const searchInput = root.querySelector('#prod-search');
  const catSelect   = root.querySelector('#prod-filter-cat');
  const sortSelect  = root.querySelector('#prod-sort');

  const filter = () => {
    const q    = searchInput.value.trim().toLowerCase();
    const cat  = catSelect.value;
    const sort = sortSelect.value;

    let result = allProducts.filter(p => {
      const matchName = !q || p.name.toLowerCase().includes(q);
      const matchCat  = !cat || String(p.categories?.id) === cat ||
                        String(p.category_id) === cat;
      const matchSort = sort === 'on-sale' ? p.is_on_sale
                      : sort === 'featured' ? p.is_featured
                      : true;
      return matchName && matchCat && matchSort;
    });

    if (sort === 'price-desc')  result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'price-asc')   result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'stock-desc')  result = [...result].sort((a, b) => b.stock - a.stock);
    if (sort === 'stock-asc')   result = [...result].sort((a, b) => a.stock - b.stock);

    renderTable(root, result);
  };

  searchInput.addEventListener('input', filter);
  catSelect.addEventListener('change', filter);
  sortSelect.addEventListener('change', filter);
};

// ─── Populate modal category dropdown ──────────────────────────────────────
const populateModalCats = (root) => {
  const sel = root.querySelector('#modal-cat-select');
  sel.innerHTML = '<option value="">— No category —</option>';
  allCategories.forEach(c => {
    const o = document.createElement('option');
    o.value = c.id; o.textContent = c.name;
    sel.appendChild(o);
  });
};

// ─── Product Add / Edit Modal ───────────────────────────────────────────────
const openModal = (root, product) => {
  editingId = product ? product.id : null;
  const modal = root.querySelector('#product-modal');
  const form  = root.querySelector('#product-form');

  root.querySelector('#prod-modal-title').textContent =
    product ? 'Edit Product' : 'Add Product';

  form.reset();

  if (product) {
    form.name.value          = product.name          || '';
    form.slug.value          = product.slug          || '';
    form.description.value   = product.description   || '';
    form.price.value         = product.price         || '';
    form.sale_price.value    = product.sale_price    || '';
    form.stock.value         = product.stock         ?? 0;
    form.image_url.value     = product.image_url     || '';
    form.is_on_sale.checked  = product.is_on_sale    || false;
    form.is_featured.checked = product.is_featured   || false;

    // Set category
    const catSel = form.querySelector('[name="category_id"]');
    catSel.value = product.category_id ? String(product.category_id) : '';

    // Show image preview
    updatePreview(root, product.image_url);
  } else {
    updatePreview(root, '');
  }

  // Auto-generate slug from name
  form.name.addEventListener('input', () => {
    if (!editingId) { // only auto-fill on new products
      form.slug.value = form.name.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }, { once: false });

  // Image preview on URL change
  form.image_url.addEventListener('input', () => {
    updatePreview(root, form.image_url.value);
  });

  // File selected — show preview and clear URL field
  form.image_file.addEventListener('change', () => {
    const file = form.image_file.files[0];
    if (file) {
      form.image_url.value = '';
      updatePreview(root, URL.createObjectURL(file));
    }
  });

  modal.hidden = false;
};

const closeModal = (root) => {
  root.querySelector('#product-modal').hidden = true;
  root.querySelector('#modal-image-file').value = '';
  editingId = null;
};

const updatePreview = (root, url) => {
  const wrap = root.querySelector('#img-preview-wrap');
  const img  = root.querySelector('#img-preview');
  if (url) {
    img.src = url;
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
  }
};

const bindModal = (root) => {
  root.querySelector('#prod-modal-close').addEventListener('click', () => closeModal(root));
  root.querySelector('#prod-modal-cancel').addEventListener('click', () => closeModal(root));

  // Close on overlay click
  root.querySelector('#product-modal').addEventListener('click', (e) => {
    if (e.target === root.querySelector('#product-modal')) closeModal(root);
  });

  root.querySelector('#prod-modal-save').addEventListener('click', async () => {
    await saveProduct(root);
  });
};

const saveProduct = async (root) => {
  const form    = root.querySelector('#product-form');
  const saveBtn = root.querySelector('#prod-modal-save');

  if (!form.reportValidity()) return;

  const name        = form.name.value.trim();
  const slug        = form.slug.value.trim();
  const description = form.description.value.trim() || null;
  const price       = parseFloat(form.price.value);
  const sale_price  = form.sale_price.value ? parseFloat(form.sale_price.value) : null;
  const category_id = form.category_id.value ? Number(form.category_id.value) : null;
  const stock       = parseInt(form.stock.value, 10) || 0;
  const is_on_sale  = form.is_on_sale.checked;
  const is_featured = form.is_featured.checked;

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

  // Upload PNG/image file to Supabase Storage if one was selected
  let image_url = form.image_url.value.trim() || null;
  const imageFile = form.image_file?.files[0];
  if (imageFile) {
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading image…';
    const ext      = imageFile.name.split('.').pop();
    const fileName = `${slug}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile, { upsert: true, contentType: imageFile.type });
    if (uploadError) {
      showAdminToast(`Image upload failed: ${uploadError.message}`, 'error');
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Product';
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    image_url = publicUrl;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
  }

  const payload = { name, slug, description, price, sale_price, category_id,
                    stock, image_url, is_on_sale, is_featured };

  let savedProduct, error;
  if (editingId) {
    ({ data: savedProduct, error } = await supabase
      .from('products').update(payload).eq('id', editingId)
      .select('*, categories(id,name)').single());
  } else {
    ({ data: savedProduct, error } = await supabase
      .from('products').insert(payload)
      .select('*, categories(id,name)').single());
  }

  if (error) {
    showAdminToast(`Error: ${error.message}`, 'error');
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Product';
    return;
  }

  // Update local array without re-fetching all products
  if (editingId) {
    const idx = allProducts.findIndex(p => p.id === editingId);
    if (idx !== -1) allProducts[idx] = savedProduct;
  } else {
    allProducts.unshift(savedProduct);
  }

  showAdminToast(editingId ? 'Product updated' : 'Product added', 'success');
  closeModal(root);
  renderTable(root, allProducts);

  // Re-apply current search/filter
  root.querySelector('#prod-search').dispatchEvent(new Event('input'));
};

// ─── Delete Modal ───────────────────────────────────────────────────────────
const openDeleteModal = (root, product) => {
  deleteId = product.id;
  root.querySelector('#delete-prod-name').textContent = product.name;
  root.querySelector('#delete-modal').hidden = false;
};

const closeDeleteModal = (root) => {
  root.querySelector('#delete-modal').hidden = true;
  deleteId = null;
};

const bindDeleteModal = (root) => {
  root.querySelector('#delete-modal-close').addEventListener('click', () => closeDeleteModal(root));
  root.querySelector('#delete-cancel-btn').addEventListener('click', () => closeDeleteModal(root));

  root.querySelector('#delete-modal').addEventListener('click', (e) => {
    if (e.target === root.querySelector('#delete-modal')) closeDeleteModal(root);
  });

  root.querySelector('#delete-confirm-btn').addEventListener('click', async () => {
    if (!deleteId) return;
    const btn = root.querySelector('#delete-confirm-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting…';

    const { error } = await supabase.from('products').delete().eq('id', deleteId);

    if (error) {
      showAdminToast(`Delete failed: ${error.message}`, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-trash"></i> Delete';
      return;
    }

    showAdminToast('Product deleted', 'success');
    closeDeleteModal(root);

    // Remove from local array without re-fetching
    allProducts = allProducts.filter(p => p.id !== deleteId);
    renderTable(root, allProducts);
    root.querySelector('#prod-search').dispatchEvent(new Event('input'));
  });
};

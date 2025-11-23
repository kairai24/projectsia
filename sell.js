// sell.js - updated: shipping fixed to "Buyer Pays Shipping" and payment to "Cash on Delivery"

const MAX_FILES = 6;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const LOW_PRICE_THRESHOLD = 50.00; // USD
const DRAFT_KEY = 'nexus_sell_draft_v1';

const $ = id => document.getElementById(id);

// DOM refs
const form = $('sellForm');
const photoInput = $('photoInput');
const chooseFilesBtn = $('chooseFilesBtn');
const dropzone = $('dropzone');
const preview = $('preview');
const desc = $('description');
const descCount = $('descCount');
const saveDraftBtn = $('saveDraft');
const submitBtn = $('submitBtn');
const priceEl = $('price');

let files = []; // File objects
let currentRole = localStorage.getItem('role') || 'seller_individual';

/* seller label */
function updateSellerLabel() {
  const badge = $('sellerLabelBadge');
  const note = $('labelNote');
  if (!badge || !note) return;
  if (currentRole === 'seller_company') {
    badge.textContent = 'OFFICIAL STORE';
    badge.style.display = 'inline-block';
    note.textContent = 'This listing will be labeled Official Store (verified company).';
  } else {
    badge.textContent = 'PRE-LOVED';
    badge.style.display = 'inline-block';
    note.textContent = 'This listing will be labeled Pre-Loved (individual seller).';
  }
}
updateSellerLabel();

/* banner helper */
function showFormBanner(msg) {
  let banner = document.getElementById('formErrorBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'formErrorBanner';
    banner.style.background = 'linear-gradient(90deg,#ffefc7,#ffd9a8)';
    banner.style.color = '#422b00';
    banner.style.padding = '10px 14px';
    banner.style.borderRadius = '8px';
    banner.style.marginBottom = '12px';
    banner.style.fontWeight = '700';
    form.parentNode.insertBefore(banner, form);
  }
  banner.textContent = msg;
  clearTimeout(banner._hideTimer);
  banner._hideTimer = setTimeout(() => { if (banner) banner.remove(); }, 6000);
}

/* description counter */
if (desc) {
  desc.addEventListener('input', () => { descCount.textContent = `${desc.value.length} / 500`; });
  descCount.textContent = `${desc.value.length} / 500`;
}

/* file handlers */
function showError(id, msg) { const el = $(id); if (el) el.textContent = msg; }
function clearErrors() { document.querySelectorAll('.error').forEach(e => e.textContent = ''); }

if (chooseFilesBtn) chooseFilesBtn.addEventListener('click', () => photoInput.click());
if (photoInput) photoInput.addEventListener('change', (e) => { addFiles(Array.from(e.target.files)); e.target.value = ''; });
if (dropzone) {
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
  dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('drag'); addFiles(Array.from(e.dataTransfer.files)); });
}

function addFiles(selected) {
  clearErrors();
  const images = selected.filter(f => f && f.type && f.type.startsWith('image/'));
  if (images.length === 0) { showError('err-photos','Please select image files (jpg, png, gif).'); return; }
  if (files.length + images.length > MAX_FILES) { showError('err-photos', `You can upload up to ${MAX_FILES} photos.`); return; }
  for (const f of images) {
    if (f.size > MAX_SIZE) { showError('err-photos', `Each file must be ≤ 5MB. "${f.name}" is too large.`); return; }
    files.push(f);
  }
  renderPreviews();
}

function renderPreviews() {
  preview.innerHTML = '';
  files.forEach((f, idx) => {
    const url = URL.createObjectURL(f);
    const item = document.createElement('div');
    item.className = 'preview-item';
    item.innerHTML = `<img src="${url}" alt="${f.name}" /><button class="preview-remove" data-index="${idx}" title="Remove image">✕</button>`;
    preview.appendChild(item);
  });
  document.querySelectorAll('.preview-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = Number(e.currentTarget.getAttribute('data-index'));
      if (!Number.isNaN(i)) { files.splice(i, 1); renderPreviews(); }
    });
  });
}

/* draft save/restore */
function collectFormData() {
  return {
    title: $('title')?.value || '',
    category: $('category')?.value || '',
    condition: $('condition')?.value || '',
    brand: $('brand')?.value || '',
    model: $('model')?.value || '',
    year: $('year')?.value || '',
    description: $('description')?.value || '',
    price: $('price')?.value || '',
    warranty: $('warranty')?.value || '',
    location: $('location')?.value || '',
    paymentMethod: 'Cash on Delivery',
    shipping: 'Buyer Pays Shipping',
    filesMeta: files.map(f => ({ name: f.name, size: f.size }))
  };
}

function saveDraft() {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(collectFormData())); alert('Draft saved locally.'); }
  catch (err) { console.warn('Failed to save draft', err); alert('Failed to save draft (localStorage).'); }
}
if (saveDraftBtn) saveDraftBtn.addEventListener('click', saveDraft);

function restoreDraft() {
  const raw = localStorage.getItem(DRAFT_KEY); if (!raw) return;
  try {
    const data = JSON.parse(raw);
    Object.keys(data).forEach(k => {
      if (k === 'filesMeta') {
        if (Array.isArray(data.filesMeta) && data.filesMeta.length) {
          const note = document.createElement('div'); note.className = 'muted'; note.style.marginTop = '8px';
          note.textContent = `Saved file names: ${data.filesMeta.map(x => x.name).join(', ')}`; preview.appendChild(note);
        }
        return;
      }
      const el = $(k);
      if (el) el.value = data[k];
    });
    if (desc) descCount.textContent = `${desc.value.length} / 500`;
  } catch (err) { console.warn('Failed to restore draft', err); }
}
restoreDraft();

/* price warning */
function checkPriceWarning() {
  if (!priceEl) return;
  let warn = document.getElementById('priceWarningEl');
  if (!warn) { warn = document.createElement('div'); warn.id = 'priceWarningEl'; warn.className = 'price-warning'; priceEl.parentNode.appendChild(warn); }
  const pv = parseFloat(priceEl.value || 0);
  if (pv > 0 && pv < LOW_PRICE_THRESHOLD) { warn.textContent = `Warning: price below $${LOW_PRICE_THRESHOLD.toFixed(2)} — please confirm this is intended.`; warn.style.display = 'block'; }
  else { warn.style.display = 'none'; }
}
if (priceEl) priceEl.addEventListener('input', checkPriceWarning);
checkPriceWarning();

/* validation (shipping removed — now implicit) */
function validate() {
  clearErrors();
  let ok = true;
  const title = $('title')?.value.trim() || '';
  const category = $('category')?.value || '';
  const condition = $('condition')?.value || '';
  const brand = $('brand')?.value.trim() || '';
  const model = $('model')?.value.trim() || '';
  const year = $('year')?.value || '';
  const description = $('description')?.value.trim() || '';
  const price = parseFloat($('price')?.value || 0);
  const location = $('location')?.value.trim() || '';

  if (!title) { showError('err-title','Product title is required.'); ok = false; }
  if (!category) { showError('err-category','Please choose a category.'); ok = false; }
  if (!condition) { showError('err-condition','Please choose condition.'); ok = false; }
  if (!brand) { showError('err-model','Please enter brand.'); ok = false; }
  if (!model) { showError('err-model','Please enter model.'); ok = false; }
  if (!year) { showError('err-model','Please enter year.'); ok = false; }
  if (!description) { showError('err-description','Please provide a description.'); ok = false; }
  if (!Number.isFinite(price) || price <= 0) { showError('err-price','Please enter a valid price greater than 0.'); ok = false; }
  if (!location) { showError('err-location','Please enter a location.'); ok = false; }
  if (files.length === 0) { showError('err-photos','Please upload at least one photo.'); ok = false; }

  if (!ok) showFormBanner('Fill all required fields before submitting.');
  return ok;
}

/* submit */
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) { const firstErr = document.querySelector('.error:not(:empty)'); if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }

    const pv = parseFloat($('price')?.value || 0);
    if (pv > 0 && pv < LOW_PRICE_THRESHOLD) {
      const confirmLow = confirm(`The price you entered is below $${LOW_PRICE_THRESHOLD.toFixed(2)}. Continue?`);
      if (!confirmLow) return;
    }

    const fd = new FormData();
    fd.append('title', $('title')?.value || '');
    fd.append('category', $('category')?.value || '');
    fd.append('condition', $('condition')?.value || '');
    fd.append('brand', $('brand')?.value || '');
    fd.append('model', $('model')?.value || '');
    fd.append('year', $('year')?.value || '');
    fd.append('description', $('description')?.value || '');
    fd.append('price', $('price')?.value || '');
    fd.append('warranty', $('warranty')?.value || '');
    fd.append('location', $('location')?.value || '');
    fd.append('sellerRole', currentRole);
    fd.append('label', currentRole === 'seller_company' ? 'Official Store' : 'Pre-Loved');

    // fixed shipping + payment
    fd.append('shipping', $('shipping')?.value || 'Buyer Pays Shipping');
    fd.append('paymentMethod', $('paymentMethod')?.value || 'Cash on Delivery');

    files.forEach((f, i) => fd.append('photos[]', f, f.name));

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting…';
    setTimeout(() => {
      alert('Submitted for review (demo). Listing status: PENDING ADMIN APPROVAL.');
      localStorage.removeItem(DRAFT_KEY);
      form.reset();
      files = [];
      renderPreviews();
      if (desc) descCount.textContent = '0 / 500';
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      currentRole = localStorage.getItem('role') || 'seller_individual';
      updateSellerLabel();
    }, 900);
  });
}

/* init */
checkPriceWarning();

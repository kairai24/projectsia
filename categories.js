// categories.js
// Simple front-end rendering for categories page, filtering & cart demo

const productsData = [
  // Example items — swap image paths with your real images
  { id: 1, title: "iPhone 14 Pro Max 256GB", price: 899.99, oldPrice: 1099.99, category: "Smartphones", condition: "Excellent", location: "New York, NY", seller: "TechDeals Pro", img: "iPhone 14 Pro Max.jpg" },
  { id: 2, title: "MacBook Air M2 13-inch 512GB", price: 1199.99, oldPrice: 1499.99, category: "Laptops", condition: "Like New", location: "San Francisco, CA", seller: "Apple Expert", img: "MacBook Air M2 13-inch.jpg" },
  { id: 3, title: "Samsung Galaxy S23 Ultra 512GB", price: 749.99, oldPrice: 1199.99, category: "Smartphones", condition: "Good", location: "Los Angeles, CA", seller: "Mobile Master", img: "Samsung Galaxy S23 Ultra.jpg" },
  { id: 4, title: "iPad Pro 12.9-inch M2 256GB", price: 899.99, oldPrice: 1099.99, category: "Tablets", condition: "Excellent", location: "Chicago, IL", seller: "Tablet Zone", img: "iPad Pro 12.9-inch.jpg" },
  { id: 5, title: "Sony WH-1000XM5 Headphones", price: 299.99, oldPrice: 399.99, category: "Audio", condition: "Excellent", location: "Miami, FL", seller: "Audio Hub", img: "headphones.jpg" },
  { id: 6, title: "Dell XPS 13 Plus i7 16GB RAM 512GB SSD", price: 1399.99, oldPrice: 1799.99, category: "Laptops", condition: "Excellent", location: "Seattle, WA", seller: "Laptop Central", img: "Dell XPS 13 Plus i7.jpg" }
];

let displayed = 6;           // how many products to show initially
let cartCount = 0;
let currentFilters = {
  category: "All",
  condition: "All",
  price: "All",
  q: "",
  sort: "newest"
};

// DOM refs (guarded)
const productGrid = document.getElementById('productGrid');
const resultsText = document.getElementById('resultsText');
const categoryList = document.getElementById('categoryList');
const conditionSelect = document.getElementById('conditionSelect');
const priceSelect = document.getElementById('priceSelect');
const clearFilters = document.getElementById('clearFilters');
const loadMoreBtn = document.getElementById('loadMore');
const cartBadge = document.getElementById('cartBadge');
const globalSearch = document.getElementById('globalSearch');
const sortSelect = document.getElementById('sortSelect');

// populate categories in sidebar
function getUniqueCategories(){
  const cats = {};
  productsData.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
  return cats;
}

function renderCategories(){
  if (!categoryList) return;
  const cats = getUniqueCategories();
  categoryList.innerHTML = '';
  // "All Categories"
  const allItem = document.createElement('li');
  allItem.className = currentFilters.category === "All" ? 'active' : '';
  allItem.innerHTML = `All Categories <span class="count">(${productsData.length})</span>`;
  allItem.addEventListener('click', ()=> { currentFilters.category = "All"; renderCategories(); renderProducts(true); });
  categoryList.appendChild(allItem);

  Object.keys(cats).forEach(cat => {
    const li = document.createElement('li');
    li.className = currentFilters.category === cat ? 'active' : '';
    li.innerHTML = `${cat} <span class="count">(${cats[cat]})</span>`;
    li.addEventListener('click', ()=> { currentFilters.category = cat; renderCategories(); renderProducts(true); });
    categoryList.appendChild(li);
  });
}

// filter + sort logic
function applyFilters(data){
  return data.filter(p => {
    if (currentFilters.category !== "All" && p.category !== currentFilters.category) return false;
    if (currentFilters.condition !== "All" && p.condition !== currentFilters.condition) return false;

    // price range
    if (currentFilters.price !== "All") {
      const [min,max] = currentFilters.price.split('-').map(Number);
      if (p.price < min || p.price > max) return false;
    }

    // search query
    if (currentFilters.q) {
      const q = currentFilters.q.toLowerCase();
      if (!(`${p.title} ${p.seller} ${p.location}`).toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a,b)=>{
    if (currentFilters.sort === 'price-asc') return a.price - b.price;
    if (currentFilters.sort === 'price-desc') return b.price - a.price;
    return b.id - a.id; // newest by id
  });
}

function renderProducts(reset=false){
  if (!productGrid || !resultsText) return;
  if (reset) displayed = 6;
  const filtered = applyFilters(productsData);
  const toShow = filtered.slice(0, displayed);

  productGrid.innerHTML = '';
  toShow.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="thumb"><img src="${p.img}" alt="${escapeHtml(p.title)}"></div>
      <div class="body">
        <h4>${escapeHtml(p.title)}</h4>
        <div class="price">$${p.price.toFixed(2)} <span style="font-weight:400;color:var(--muted);font-size:12px;margin-left:8px;text-decoration:line-through;">$${p.oldPrice.toFixed(2)}</span></div>
        <div class="meta">${escapeHtml(p.seller)} · ${escapeHtml(p.location)}</div>
        <div class="actions">
          <button class="btn-secondary" data-id="${p.id}" onclick="viewDetails(${p.id})">View Details</button>
          <button class="btn-primary add-cart" data-id="${p.id}">Add to Cart</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });

  resultsText.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
  if (cartBadge) cartBadge.textContent = cartCount;

  // hide load more if all shown
  if (loadMoreBtn) loadMoreBtn.style.display = (displayed >= filtered.length) ? 'none' : 'inline-block';
}

// helper to escape HTML (small safety)
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

// attach global event listeners (delegation for add to cart)
document.addEventListener('click', (e)=>{
  // support clicking the button or inner elements
  const addBtn = e.target.closest && e.target.closest('.add-cart');
  if (addBtn) {
    const id = Number(addBtn.getAttribute('data-id'));
    addToCart(id);
  }
});

// cart function
function addToCart(id){
  cartCount += 1;
  if (cartBadge) cartBadge.textContent = cartCount;

  // small visual pulse on the pill
  const pill = document.getElementById('cartBtn') || document.querySelector('.cart-pill');
  if (pill){
    pill.animate([{ transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], { duration: 220 });
  }
}

// view details placeholder
function viewDetails(id){
  alert('View details for product id: ' + id + ' (demo)');
}

// Load more
if (loadMoreBtn) loadMoreBtn.addEventListener('click', ()=>{
  displayed += 6;
  renderProducts();
});

// filter controls
if (conditionSelect) conditionSelect.addEventListener('change', (e)=>{
  currentFilters.condition = e.target.value;
  renderProducts(true);
});
if (priceSelect) priceSelect.addEventListener('change', (e)=>{
  currentFilters.price = e.target.value;
  renderProducts(true);
});
if (clearFilters) clearFilters.addEventListener('click', ()=>{
  currentFilters = { category: "All", condition: "All", price: "All", q: "", sort: currentFilters.sort };
  renderCategories();
  if (conditionSelect) conditionSelect.value = 'All';
  if (priceSelect) priceSelect.value = 'All';
  if (globalSearch) globalSearch.value = '';
  renderProducts(true);
});

// search
if (globalSearch) {
  globalSearch.addEventListener('input', (e)=> {
    currentFilters.q = e.target.value.trim();
    renderProducts(true);
  });
}

// sort
if (sortSelect) sortSelect.addEventListener('change', (e)=>{
  currentFilters.sort = e.target.value;
  renderProducts(true);
});

// init (guarded)
renderCategories();
renderProducts(true);

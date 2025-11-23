/* cart.js
   Simple cart demo: quantity +/- , remove, totals, localStorage persistence
*/

const sampleProducts = [
  // sample items (adjust image filenames to match your assets)
  { id: 1, title: "iPhone 15 Pro Max", subtitle: "256GB, Titanium Blue", price: 1199.00, img: "iphone.jpg" },
  { id: 2, title: "MacBook Air M3", subtitle: "13-inch, 8GB RAM, 256GB SSD", price: 1099.00, img: "macbook.jpg" }
];

const CART_KEY = 'ng_cart_v1';

function $(id){ return document.getElementById(id); }

let cart = loadCart(); // { id: qty, ... }

// If no saved cart, pre-populate with sample items for demo
if (Object.keys(cart).length === 0) {
  cart = { 1: 1, 2: 1 };
  saveCart();
}

const cartListEl = $('cartList');
const subtotalText = $('subtotalText');
const totalText = $('totalText');
const shippingText = $('shippingText');
const cartBadge = $('cartBadge');
const cartCountText = $('cartCountText');

renderCart();

function getProduct(id){
  return sampleProducts.find(p=>p.id === Number(id));
}

function loadCart(){
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}
function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderCart(){
  cartListEl.innerHTML = '';
  const ids = Object.keys(cart).map(Number);
  if (!ids.length) {
    cartListEl.innerHTML = '<div class="muted">Your cart is empty.</div>';
    updateSummary(0);
    cartBadge.textContent = 0;
    cartCountText.textContent = '0 items in your cart';
    return;
  }

  let subtotal = 0;
  let totalItems = 0;

  ids.forEach(id => {
    const qty = cart[id];
    const p = getProduct(id);
    if (!p) return;
    subtotal += p.price * qty;
    totalItems += qty;

    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <div class="thumb"><img src="${p.img}" alt="${escapeHtml(p.title)}" /></div>
      <div class="item-info">
        <div class="item-title">${escapeHtml(p.title)}</div>
        <div class="item-sub">${escapeHtml(p.subtitle)}</div>
        <div class="item-price">$${p.price.toFixed(2)}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
        <div class="qty-controls">
          <button class="qty-btn" data-action="dec" data-id="${id}">−</button>
          <div class="qty-display">${qty}</div>
          <button class="qty-btn" data-action="inc" data-id="${id}">+</button>
          <button class="remove-btn" title="Remove" data-action="remove" data-id="${id}">🗑</button>
        </div>
      </div>
    `;
    cartListEl.appendChild(item);
  });

  attachCartHandlers();
  updateSummary(subtotal);
  cartBadge.textContent = totalItems;
  cartCountText.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`;
}

function attachCartHandlers(){
  cartListEl.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      if (action === 'inc') {
        cart[id] = (cart[id] || 0) + 1;
      } else if (action === 'dec') {
        cart[id] = Math.max(1, (cart[id] || 1) - 1);
      } else if (action === 'remove') {
        delete cart[id];
      }
      saveCart();
      renderCart();
    });
  });
}

function updateSummary(subtotal){
  // Shipping policy: always "Free" (as requested — buyers pays but design shows Free)
  const shipping = 0; // free
  const total = subtotal + shipping;
  subtotalText.textContent = `$${subtotal.toFixed(2)}`;
  shippingText.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
  totalText.textContent = `$${total.toFixed(2)}`;
}

/* Checkout: COD only, ask confirm for auto-login? (you asked earlier)
   We'll prompt user to confirm checkout, then show final COD confirmation.
*/
const checkoutBtn = $('checkoutBtn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    const ids = Object.keys(cart);
    if (!ids.length) {
      alert('Your cart is empty.');
      return;
    }

    const confirmCheckout = confirm('Proceed to checkout? Payment method: Cash on Delivery (COD). Continue?');
    if (!confirmCheckout) return;

    // Demo: "place order" -> clear cart and go to index or show message
    // Ask if user wants to be logged in automatically after checkout (from previous flow)
    const autoLogin = confirm('Do you want to login automatically after placing the order? (Demo)');
    if (autoLogin) {
      // in real app you'd set auth; here we simulate redirect to home
      alert('Order placed (demo). You will be redirected to home (auto-login simulated).');
      localStorage.removeItem(CART_KEY);
      window.location.href = 'index.html';
    } else {
      alert('Order placed (demo). Thank you!');
      localStorage.removeItem(CART_KEY);
      renderCart();
    }
  });
}

/* small helpers */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }


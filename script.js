/* ============ CONFIG ============ */
const WHATSAPP_NUMBER = "923102806901"; // Sulehri Mobiles

/* ============ PRODUCT DATA ============ */
const PRODUCTS = [
  { id:"p1", model:"iPhone 11", storage:"64 GB", color:"Black", hex:"#1c1c1e", price:35000, img:"iphone-11.png" },
  { id:"p2", model:"iPhone 16 Pro", storage:"512 GB", color:"Desert Titanium", hex:"#c8a98b", price:230000, img:"iphone-16-pro.png" },
  { id:"p3", model:"iPhone 16", storage:"256 GB", color:"Black", hex:"#1c1c1e", price:190000, img:"iphone-16.png" },
  { id:"p4", model:"iPhone Duo", storage:"1 TB", color:"Midnight Blue", hex:"#1f2d4d", price:1000000, img:"iphone-duo.png" },
  { id:"p5", model:"iPhone 18 Pro Max", storage:"2 TB", color:"Burgundy", hex:"#6d1d33", price:955000, img:"iphone-18-pro-max.png" },
  { id:"p6", model:"iPhone 13", storage:"128 GB", color:"Black", hex:"#1c1c1e", price:80000, img:"iphone-13.png" },
].map(p => ({ ...p, name: `${p.model} ${p.storage} ${p.color}`, tier: p.price < 100000 ? "low" : p.price < 500000 ? "mid" : "high" }));

/* ============ CART (localStorage) ============ */
const CART_KEY = "sulehriCart";

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 });
  saveCart(cart);
}

function updateQty(productId, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  renderCartPage();
}

function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  renderCartPage();
}

function cartTotalCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  const count = cartTotalCount();
  badge.textContent = count;
  badge.classList.remove("bump");
  badge.classList.add("bump");
}

/* ============ TOAST ============ */
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

/* ============ PRODUCT CARD RENDER ============ */
function productCardHTML(p) {
  const tierLabel = { low:"Value", mid:"Flagship", high:"Collector" }[p.tier];
  return `<article class="product-card" data-id="${p.id}" tabindex="0" aria-label="${p.name} details">
    <span class="pc-tag">${tierLabel}</span>
    <div class="product-img-wrap"><img class="product-img" src="${p.img}" alt="${p.name}" loading="lazy"></div>
    <div class="product-info">
      <h3 class="product-name">${p.model}</h3>
      <p class="product-spec"><i class="dot" style="background:${p.hex}"></i>${p.storage} · ${p.color}</p>
      <span class="product-price">Rs ${p.price.toLocaleString()}</span>
      <div class="pc-actions"><button class="view-btn" data-id="${p.id}">Details</button>
      <button class="add-cart-btn" data-id="${p.id}">Add to cart</button></div>
    </div></article>`;
}

function bindAddToCartButtons(container) {
  container.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      addToCart(id);
      btn.textContent = "Added ✓";
      btn.classList.add("added");
      showToast("Added to cart");
      setTimeout(() => {
        btn.textContent = "Add to cart";
        btn.classList.remove("added");
      }, 1000);
    });
  });
}

/* ============ HOMEPAGE: featured products ============ */
function renderFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  const featured = PRODUCTS;
  grid.innerHTML = featured.map(productCardHTML).join("");
  bindAddToCartButtons(grid); window.fxCards && fxCards(grid);
}

/* ============ PRODUCTS PAGE: grid + filter ============ */
function renderProductsPage() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  let activeCat = params.get("cat") || "all";

  function render(cat) {
    const filtered = cat === "all" ? PRODUCTS : PRODUCTS.filter(p => p.tier === cat);
    grid.innerHTML = filtered.map(productCardHTML).join("");
    bindAddToCartButtons(grid); window.fxCards && fxCards(grid);
  }

  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    if (btn.getAttribute("data-cat") === activeCat) {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCat = btn.getAttribute("data-cat");
      render(activeCat);
    });
  });

  render(activeCat);
}

/* ============ CART PAGE ============ */
function cartItemHTML(item) {
  return `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="name">${item.name}</div>
        <div class="price">Rs ${item.price.toLocaleString()} each</div>
      </div>
      <div class="qty-controls">
        <button class="qty-minus" data-id="${item.id}">−</button>
        <span>${item.qty}</span>
        <button class="qty-plus" data-id="${item.id}">+</button>
      </div>
      <button class="remove-btn" data-id="${item.id}">Remove</button>
    </div>
  `;
}

function renderCartPage() {
  const list = document.getElementById("cartList");
  if (!list) return; // not on cart page

  const cart = getCart();
  const emptyState = document.getElementById("cartEmpty");
  const summary = document.getElementById("cartSummary");

  if (cart.length === 0) {
    list.innerHTML = "";
    emptyState.style.display = "flex";
    summary.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  summary.style.display = "block";
  list.innerHTML = cart.map(cartItemHTML).join("");

  list.querySelectorAll(".qty-plus").forEach(btn =>
    btn.addEventListener("click", () => updateQty(btn.getAttribute("data-id"), 1))
  );
  list.querySelectorAll(".qty-minus").forEach(btn =>
    btn.addEventListener("click", () => updateQty(btn.getAttribute("data-id"), -1))
  );
  list.querySelectorAll(".remove-btn").forEach(btn =>
    btn.addEventListener("click", () => removeFromCart(btn.getAttribute("data-id")))
  );

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.qty * i.price, 0);
  document.getElementById("cartTotalItems").textContent = totalItems;
  document.getElementById("cartTotalPrice").textContent = "Rs " + totalPrice.toLocaleString();

  const orderBtn = document.getElementById("orderBtn");
  orderBtn.onclick = () => {
    const message = buildWhatsAppMessage(cart, totalPrice);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };
}

function buildWhatsAppMessage(cart, totalPrice) {
  let msg = "Hello Sulehri Mobiles! I'd like to order:\n\n";
  cart.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.name} — Rs ${item.price.toLocaleString()} x${item.qty} = Rs ${(item.price * item.qty).toLocaleString()}\n`;
  });
  msg += `\nTotal: Rs ${totalPrice.toLocaleString()}\n\nPlease confirm availability and delivery details. Thank you!`;
  return msg;
}

/* ============ SCROLL REVEAL ============ */
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  elements.forEach(el => observer.observe(el));
}

/* ============ INIT ============ */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderFeatured();
  renderProductsPage();
  renderCartPage();
  initScrollReveal();
});

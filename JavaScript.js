/* ============================================================
   IHEC STORE — JavaScript.js  (version pro)
   • localStorage panier persistant
   • Animation compteur badge
   • Validation formulaire
   • Navbar shadow au scroll
   ============================================================ */

// ── STORAGE HELPERS ──────────────────────────────────────
const CART_KEY = 'ihec_cart_v1';

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); }

// ── STATE ─────────────────────────────────────────────────
let cart = loadCart();

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  createCartDrawer();
  updateCartCount(false);
  initNavScroll();
  initScrollReveal();
  initFormValidation();
});

// ── NAVBAR SHADOW ─────────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── CART DRAWER ───────────────────────────────────────────
function createCartDrawer() {
  if (document.getElementById('cartDrawer')) return;

  const overlay = document.createElement('div');
  overlay.id = 'cartOverlay';
  overlay.onclick = closeCart;
  document.body.appendChild(overlay);

  const drawer = document.createElement('div');
  drawer.id = 'cartDrawer';
  drawer.innerHTML = `
    <div class="drawer-header">
      <h3>Votre panier</h3>
      <button class="drawer-close" onclick="closeCart()" aria-label="Fermer">✕</button>
    </div>
    <div class="drawer-items" id="drawerItems"></div>
    <div class="drawer-footer" id="drawerFooter">
      <div class="drawer-total">
        <span>Total</span>
        <span id="drawerTotal">0 DT</span>
      </div>
      <button class="btn-checkout" onclick="handleCheckout()">Commander →</button>
      <button class="btn-clear" onclick="clearCart()">Vider le panier</button>
    </div>
  `;
  document.body.appendChild(drawer);

  const navCartBtn = document.querySelector('.nav-cart');
  if (navCartBtn) navCartBtn.addEventListener('click', openCart);
}

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('show');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const container = document.getElementById('drawerItems');
  const footer    = document.getElementById('drawerFooter');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.3">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.63.63-.18 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <p>Votre panier est vide.</p>
        <button class="btn-ghost-sm" onclick="closeCart()">Continuer mes achats →</button>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  container.innerHTML = cart.map((item, i) => `
    <div class="cart-item" data-index="${i}">
      <div class="cart-item-icon">${item.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${(item.price * item.qty).toFixed(0)} DT
          <span class="cart-unit">(${item.price} × ${item.qty})</span>
        </div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty(${i}, -1)" aria-label="Diminuer">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${i}, +1)" aria-label="Augmenter">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeItem(${i})" aria-label="Supprimer">×</button>
    </div>
  `).join('');

  const total = cart.reduce((s, item) => s + item.price * item.qty, 0);
  const totalEl = document.getElementById('drawerTotal');
  if (totalEl) animateNumber(totalEl, total, ' DT');
}

function changeQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart(cart);
  updateCartCount(true);
  renderCartItems();
}

function removeItem(index) {
  const itemEl = document.querySelector(`.cart-item[data-index="${index}"]`);
  if (itemEl) {
    itemEl.style.transition = 'opacity .2s, transform .2s';
    itemEl.style.opacity = '0';
    itemEl.style.transform = 'translateX(20px)';
    setTimeout(() => {
      cart.splice(index, 1);
      saveCart(cart);
      updateCartCount(true);
      renderCartItems();
    }, 200);
  }
}

function clearCart() {
  if (!confirm('Vider le panier ?')) return;
  cart = [];
  saveCart(cart);
  updateCartCount(true);
  renderCartItems();
}

function handleCheckout() {
  showToast('📩 Commande envoyée ! Nous vous contacterons bientôt.');
  cart = [];
  saveCart(cart);
  updateCartCount(true);
  closeCart();
}

// ── CART COUNT ANIMATION ──────────────────────────────────
function updateCartCount(animate = true) {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const total = cart.reduce((s, i) => s + i.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'none';

  if (animate && total > 0) {
    badge.classList.remove('pop');
    void badge.offsetWidth; // reflow trigger
    badge.classList.add('pop');
  }
}

function animateNumber(el, target, suffix = '') {
  const start = parseInt(el.textContent) || 0;
  const diff  = target - start;
  const steps = 20;
  let step    = 0;
  const tick  = () => {
    step++;
    el.textContent = Math.round(start + diff * (step / steps)) + suffix;
    if (step < steps) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── ADD TO CART ───────────────────────────────────────────
function addToCart(btn) {
  const card = btn.closest('.card, .hero-card');
  if (!card) return;

  let name, priceText, iconHTML;

  if (card.classList.contains('hero-card')) {
    name      = card.querySelector('.hero-card-name')?.textContent.trim() || 'Article';
    priceText = card.querySelector('.hero-card-price')?.textContent || '0';
    iconHTML  = `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.3" width="26" height="26" stroke="rgba(255,255,255,.7)">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/>
    </svg>`;
  } else {
    name      = card.querySelector('.card-name')?.textContent.trim() || 'Article';
    priceText = card.querySelector('.card-price')?.textContent || '0';
    iconHTML  = card.querySelector('.card-icon')?.innerHTML || '';
  }

  const price    = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
  const existing = cart.find(i => i.name === name);

  if (existing) { existing.qty += 1; }
  else           { cart.push({ name, price, qty: 1, icon: iconHTML }); }

  saveCart(cart);
  updateCartCount(true);
  showToast(`✓ "${name}" ajouté au panier`);

  const orig = btn.textContent;
  btn.textContent = '✓ Ajouté';
  btn.classList.add('added');
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.classList.remove('added');
    btn.disabled = false;
  }, 1500);
}

// ── FILTER TABS ───────────────────────────────────────────
function filter(tabEl, cat) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');

  let delay = 0;
  document.querySelectorAll('.card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    if (show) {
      card.classList.remove('hidden');
      card.style.animationDelay = `${delay * 60}ms`;
      card.classList.remove('fade-in');
      void card.offsetWidth;
      card.classList.add('fade-in');
      delay++;
    } else {
      card.classList.add('hidden');
    }
  });
}

// ── FORM VALIDATION ───────────────────────────────────────
function initFormValidation() {
  const sendBtn = document.querySelector('.btn-send');
  if (!sendBtn) return;

  sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const section = sendBtn.closest('.contact-grid > div') || sendBtn.parentElement;

    const inputs = section.querySelectorAll('input[type="text"], input[type="email"]');
    const message = section.querySelector('.form-textarea');
    let valid = true;

    inputs.forEach(field => {
      clearError(field);
      if (!field.value.trim()) { showError(field, 'Ce champ est requis'); valid = false; }
    });

    const email = section.querySelector('input[type="email"]');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, 'Adresse email invalide'); valid = false;
    }

    if (message) {
      clearError(message);
      if (!message.value.trim()) { showError(message, 'Ce champ est requis'); valid = false; }
    }

    if (valid) {
      sendBtn.textContent = '✓ Message envoyé !';
      sendBtn.style.background = '#2e7d4f';
      sendBtn.disabled = true;
      showToast('📬 Message envoyé avec succès !');
      setTimeout(() => {
        inputs.forEach(f => f.value = '');
        if (message) message.value = '';
        sendBtn.textContent = 'Envoyer →';
        sendBtn.style.background = '';
        sendBtn.disabled = false;
      }, 3000);
    }
  });

  document.querySelectorAll('.form-input, .form-textarea').forEach(field => {
    field.addEventListener('blur',  () => { if (field.value.trim()) clearError(field); });
    field.addEventListener('input', () => { if (field.value.trim()) clearError(field); });
  });
}

function showError(field, msg) {
  field.classList.add('field-error');
  if (!field.parentElement.querySelector('.field-error-msg')) {
    const err = document.createElement('span');
    err.className = 'field-error-msg';
    err.textContent = msg;
    field.parentElement.appendChild(err);
  }
}
function clearError(field) {
  field.classList.remove('field-error');
  field.parentElement.querySelector('.field-error-msg')?.remove();
}

// ── SCROLL REVEAL ─────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.card, .step, .contact-item').forEach((el, i) => {
    el.classList.add('reveal-el');
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    observer.observe(el);
  });
}

// ── TOAST ─────────────────────────────────────────────────
let toastTimer;
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

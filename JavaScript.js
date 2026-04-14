/* ============================================================
   IHEC STORE — JavaScript.js  (version améliorée)
   • localStorage panier persistant
   • Menu hamburger mobile
   • Sélection de taille obligatoire pour vêtements
   • Modal de commande avec formulaire client
   • Animation compteur badge
   • Validation formulaire contact
   • Navbar shadow au scroll
   ============================================================ */

// ── STORAGE HELPERS ──────────────────────────────────────
const CART_KEY = 'ihec_cart_v2';

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
  initSizeSelectors();
  initHamburger();
  initOrderModal();
});

// ── NAVBAR SHADOW ─────────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── HAMBURGER MENU ────────────────────────────────────────
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  if (!hamburger) return;
  hamburger.addEventListener('click', toggleMobileMenu);
}

function toggleMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('mobileMenu');
  const overlay   = document.getElementById('mobileOverlay');
  if (!menu) return;
  const isOpen = menu.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    menu.classList.add('open');
    overlay.classList.add('show');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('mobileMenu');
  const overlay   = document.getElementById('mobileOverlay');
  if (!menu) return;
  menu.classList.remove('open');
  overlay.classList.remove('show');
  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';
}

// Close mobile menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu();
    closeCart();
    closeOrderModal();
  }
});

// ── SIZE SELECTORS ────────────────────────────────────────
function initSizeSelectors() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.size-selector');
      group.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      // Hide required error if shown
      const msg = group.querySelector('.size-required-msg');
      if (msg) msg.classList.remove('show');
    });
  });
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
      <button class="btn-checkout" onclick="openOrderModal()">Commander →</button>
      <button class="btn-clear" onclick="clearCart()">Vider le panier</button>
    </div>
  `;
  document.body.appendChild(drawer);

  const navCartBtn = document.getElementById('cartBtn');
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
      <div class="cart-item-icon">
        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.3" width="22" height="22" stroke="rgba(255,255,255,.7)">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/>
        </svg>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}${item.size ? ` <span style="font-weight:400;color:var(--text-muted)">· ${item.size}</span>` : ''}</div>
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

// ── ORDER MODAL ───────────────────────────────────────────
function initOrderModal() {
  const overlay = document.getElementById('orderOverlay');
  if (overlay) overlay.addEventListener('click', closeOrderModal);
}

function openOrderModal() {
  if (cart.length === 0) return;
  closeCart();

  // Populate summary
  const summaryEl = document.getElementById('modalCartSummary');
  if (summaryEl) {
    summaryEl.innerHTML = cart.map(item => `
      <div class="modal-cart-item">
        <span class="modal-cart-item-name">${item.name}${item.size ? ` · ${item.size}` : ''} <span style="color:var(--text-muted);font-weight:400">×${item.qty}</span></span>
        <span class="modal-cart-item-price">${(item.price * item.qty).toFixed(0)} DT</span>
      </div>
    `).join('');
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalEl = document.getElementById('modalTotal');
  if (totalEl) totalEl.textContent = total + ' DT';

  document.getElementById('orderOverlay').classList.add('show');
  document.getElementById('orderModal').classList.add('show');
  document.body.style.overflow = 'hidden';

  // Reset form fields
  ['orderPrenom','orderNom','orderTel','orderClasse','orderNote'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('field-error'); }
  });
  document.querySelectorAll('#orderModal .field-error-msg').forEach(e => e.remove());
}

function closeOrderModal() {
  document.getElementById('orderOverlay')?.classList.remove('show');
  document.getElementById('orderModal')?.classList.remove('show');
  document.body.style.overflow = '';
}

function submitOrder() {
  const prenom = document.getElementById('orderPrenom');
  const nom    = document.getElementById('orderNom');
  const tel    = document.getElementById('orderTel');
  let valid = true;

  [prenom, nom, tel].forEach(field => {
    clearError(field);
    if (!field.value.trim()) { showError(field, 'Ce champ est requis'); valid = false; }
  });

  if (tel && tel.value && !/^[0-9\s\+\-\.]{6,15}$/.test(tel.value.trim())) {
    showError(tel, 'Numéro invalide'); valid = false;
  }

  if (!valid) return;

  const btn = document.querySelector('.btn-checkout-modal');
  btn.disabled = true;
  btn.textContent = '⏳ Envoi en cours...';

  // Simulate sending
  setTimeout(() => {
    btn.textContent = '✓ Commande confirmée !';
    btn.style.background = 'var(--success)';
    showToast(`🎉 Commande confirmée ! Nous vous contacterons au ${tel.value.trim()}.`);

    setTimeout(() => {
      cart = [];
      saveCart(cart);
      updateCartCount(true);
      closeOrderModal();
      btn.textContent = 'Confirmer la commande →';
      btn.style.background = '';
      btn.disabled = false;
    }, 2000);
  }, 900);
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
    void badge.offsetWidth;
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
  const card = btn.closest('.card');
  if (!card) return;

  // Check size selection for clothing
  const sizeSelector = card.querySelector('.size-selector[data-required="true"]');
  if (sizeSelector) {
    const selectedSize = sizeSelector.querySelector('.size-btn.selected');
    if (!selectedSize) {
      let msg = sizeSelector.querySelector('.size-required-msg');
      if (!msg) {
        msg = document.createElement('div');
        msg.className = 'size-required-msg';
        msg.textContent = 'Veuillez choisir une taille';
        sizeSelector.appendChild(msg);
      }
      msg.classList.add('show');
      sizeSelector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
  }

  const name      = card.querySelector('.card-name')?.textContent.trim() || 'Article';
  const priceText = card.querySelector('.card-price')?.textContent || '0';
  const price     = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
  const size      = sizeSelector?.querySelector('.size-btn.selected')?.dataset.size || null;

  // Key includes size for same item with different sizes
  const cartKey = size ? `${name}__${size}` : name;
  const existing = cart.find(i => i.cartKey === cartKey);

  if (existing) { existing.qty += 1; }
  else          { cart.push({ cartKey, name, price, qty: 1, size }); }

  saveCart(cart);
  updateCartCount(true);
  const label = size ? `"${name}" (${size})` : `"${name}"`;
  showToast(`✓ ${label} ajouté au panier`);

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

// ── FORM VALIDATION (Contact) ─────────────────────────────
function initFormValidation() {
  const sendBtn = document.querySelector('.btn-send');
  if (!sendBtn) return;

  sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const section = sendBtn.closest('.contact-grid > div') || sendBtn.parentElement;

    const inputs  = section.querySelectorAll('input[type="text"], input[type="email"]');
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
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── FLIP CARD ─────────────────────────────────────────────
function flipCard(id) {
  const container = document.getElementById(id);
  if (!container) return;
  container.classList.toggle('flipped');
}

// ── CLASSE SCROLL SELECTOR ────────────────────────────────
function initClasseSelector() {
  const track = document.getElementById('classeTrack');
  if (!track) return;

  track.querySelectorAll('.classe-item').forEach(item => {
    item.addEventListener('click', () => {
      track.querySelectorAll('.classe-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      document.getElementById('orderClasse').value = item.dataset.val;
      // Smooth scroll to center the selected item
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });
}

// ── THANK YOU MODAL ───────────────────────────────────────
function showThankyou(tel) {
  const overlay = document.getElementById('thankyouOverlay');
  const modal   = document.getElementById('thankyouModal');
  if (!overlay || !modal) return;

  overlay.classList.add('show');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  launchConfetti();
}

function closeThankyou() {
  document.getElementById('thankyouOverlay')?.classList.remove('show');
  document.getElementById('thankyouModal')?.classList.remove('show');
  document.body.style.overflow = '';
}

function launchConfetti() {
  const container = document.getElementById('thankyouConfetti');
  if (!container) return;
  container.innerHTML = '';

  const colors = ['#c9a84c', '#e8c97a', '#0d1b3e', '#1e306a', '#ffffff', '#f5f0e8'];
  const shapes = ['2px', '4px', '6px'];

  for (let i = 0; i < 48; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size  = shapes[Math.floor(Math.random() * shapes.length)];
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}; height: ${size};
      background: ${color};
      border-radius: ${Math.random() > .5 ? '50%' : '2px'};
      --dur: ${0.8 + Math.random() * 1.4}s;
      --delay: ${Math.random() * 0.6}s;
    `;
    container.appendChild(piece);
  }
}

// ── OVERRIDE submitOrder to show thank you ────────────────
// Store original and replace
const _originalSubmitOrder = submitOrder;

// Redefine submitOrder entirely with thank-you support
window.submitOrder = function() {
  const prenom = document.getElementById('orderPrenom');
  const nom    = document.getElementById('orderNom');
  const tel    = document.getElementById('orderTel');
  let valid = true;

  [prenom, nom, tel].forEach(field => {
    clearError(field);
    if (!field.value.trim()) { showError(field, 'Ce champ est requis'); valid = false; }
  });

  if (tel && tel.value && !/^[0-9\s\+\-\.]{6,15}$/.test(tel.value.trim())) {
    showError(tel, 'Numéro invalide'); valid = false;
  }

  if (!valid) return;

  const btn = document.querySelector('.btn-checkout-modal');
  btn.disabled = true;
  btn.textContent = '⏳ Envoi en cours...';

  setTimeout(() => {
    // Clear cart
    cart = [];
    saveCart(cart);
    updateCartCount(true);

    // Close order modal
    closeOrderModal();

    // Reset button
    btn.textContent = 'Confirmer la commande →';
    btn.style.background = '';
    btn.disabled = false;

    // Show thank you modal
    showThankyou(tel.value.trim());
  }, 900);
};

// ── HOOK INTO DOMContentLoaded ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initClasseSelector();

  // Close thank you on overlay click
  const tyOverlay = document.getElementById('thankyouOverlay');
  if (tyOverlay) tyOverlay.addEventListener('click', closeThankyou);
});

// Close thank you modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeThankyou();
});

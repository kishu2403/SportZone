/* ============================================================
   SPORTZONE — Shared App Utilities
   Handles: auth state, navbar, toast, cart badge
   ============================================================ */

/* ── Toast ────────────────────────────────────────────────── */
function showToast(msg, isError = false) {
  const old = document.querySelector('.toast');
  if (old) old.remove();

  const t = document.createElement('div');
  t.className = 'toast' + (isError ? ' error' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
}

/* ── Auth State + Navbar ──────────────────────────────────── */
async function initNavbar() {
  try {
    const res  = await fetch('/api/auth/me');
    const data = await res.json();
    const nav  = document.getElementById('nav-auth');
    const cartBadge = document.getElementById('cart-badge');

    if (data.loggedIn) {
      const firstName = data.user.name.split(' ')[0];
      if (nav) {
        nav.innerHTML = `
          <span class="nav-user">👋 ${firstName}</span>
          <a class="nav-cart" href="/cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Cart
            <span class="badge" id="cart-badge">0</span>
          </a>
          <a class="btn btn-ghost" href="#" id="logout-btn">Logout</a>
        `;
        document.getElementById('logout-btn').addEventListener('click', async (e) => {
          e.preventDefault();
          await fetch('/api/auth/logout');
          window.location.href = '/login';
        });
      }
      // Update cart count
      updateCartBadge();
    } else {
      if (nav) {
        nav.innerHTML = `
          <a href="/login">Login</a>
          <a class="btn btn-primary" href="/signup">Sign Up</a>
        `;
      }
    }
  } catch (e) {
    console.warn('initNavbar failed:', e.message);
  }
}

/* ── Cart Badge Count ─────────────────────────────────────── */
async function updateCartBadge() {
  try {
    const res  = await fetch('/api/cart');
    if (!res.ok) return;
    const data = await res.json();
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = data.count || 0;
      badge.classList.add('pop');
      setTimeout(() => badge.classList.remove('pop'), 300);
    }
  } catch (e) { /* not logged in */ }
}

/* ── Add to Cart ──────────────────────────────────────────── */
async function addToCart(productId, quantity = 1) {
  try {
    const res  = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });
    const data = await res.json();
    if (res.status === 401) {
      showToast('Please login to add items to cart', true);
      setTimeout(() => window.location.href = '/login', 1500);
      return false;
    }
    if (data.success) {
      showToast('✓ Added to cart!');
      const badge = document.getElementById('cart-badge');
      if (badge) {
        badge.textContent = data.count;
        badge.classList.add('pop');
        setTimeout(() => badge.classList.remove('pop'), 300);
      }
      return true;
    }
  } catch (err) {
    showToast('Error adding to cart', true);
  }
  return false;
}

/* ── Init on every page ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initNavbar);

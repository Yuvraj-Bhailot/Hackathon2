/* ========== JS: Shared header/footer, router, storage, pages, interactivity ========== */

const App = (() => {
  /* ---------- Utilities ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmtDate = ts => new Date(ts).toLocaleString();
  const uid = () => Math.random().toString(36).slice(2, 9);

  /* ---------- Storage ---------- */
  const STORAGE_KEY = 'donations';
  const USER_KEY = 'currentUser'; // for signin

  const readDonations = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  };
  const writeDonations = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  const readUser = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch { return null; }
  };
  const writeUser = (obj) => localStorage.setItem(USER_KEY, JSON.stringify(obj));
  const clearUser = () => localStorage.removeItem(USER_KEY);

  /* ---------- Header + Footer Injection ---------- */
  const headerHTML = `
    <div class="header">
      <div class="container nav">
        <!-- Brand -->
        <a class="brand" href="index.html">
          <span class="logo">🍲</span><span>FoodCare</span>
        </a>

        <!-- Desktop nav -->
        <nav class="navlinks" role="navigation" aria-label="Main">
          <a href="index.html">Home</a>
          <a href="donate.html">Donate</a>
          <a href="track.html">Track</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
          <a href="signup.html">Signup</a>
        </nav>

        <!-- Burger for mobile -->
        <button class="burger" aria-label="Toggle menu" title="Menu">☰</button>

        <!-- Desktop CTA -->
        <div class="nav-auth">
          <a class="nav-cta signin-link" href="signin.html">
            <span class="sign-in-icon">🔒</span> Sign In
          </a>
          <a class="nav-cta profile-link" href="profile.html" style="display:none;">
            <span class="sign-in-icon">👤</span> Profile
          </a>
          <button class="nav-cta signout-btn" style="display:none;">🚪 Sign Out</button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div class="mobile-menu" id="mobileMenu">
        <a href="index.html">Home</a>
        <a href="donate.html">Donate</a>
        <a href="track.html">Track</a>
        <a href="about.html">About</a>
        <a href="contact.html">Contact</a>
        <a href="signup.html">Signup</a>
        <a href="signin.html" class="mobile-cta signin-link">Sign In</a>
        <a href="profile.html" class="mobile-cta profile-link" style="display:none;">Profile</a>
        <button class="mobile-cta signout-btn" style="display:none;">Sign Out</button>
      </div>
    </div>
  `;

  const footerHTML = `
    <footer class="footer">
      <div class="container inner">
        <div>© ${new Date().getFullYear()} FoodCare — Made with ❤️</div>
        <div><a href="about.html">About</a> · <a href="contact.html">Contact</a></div>
      </div>
    </footer>
  `;

  function injectChrome() {
    const headerMount = document.createElement('div');
    headerMount.innerHTML = headerHTML;
    document.body.prepend(headerMount);

    const footerMount = document.createElement('div');
    footerMount.innerHTML = footerHTML;
    document.body.append(footerMount);

    // Active nav link
    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.navlinks a, .mobile-menu a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path) a.classList.add('active');
    });

    // Mobile menu toggle
    const burger = $('.burger');
    const mobile = $('#mobileMenu');
    burger?.addEventListener('click', () => mobile?.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!mobile?.contains(e.target) && e.target !== burger) mobile?.classList.remove('open');
    });

    // Auth UI
    updateAuthUI();
    $$('.signout-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        clearUser();
        updateAuthUI();
        toast('Signed out');
        if (location.pathname.includes('profile.html')) {
          location.href = 'signin.html';
        }
      });
    });
  }

  function updateAuthUI() {
    const user = readUser();
    const signedIn = !!user;

    $$('.signin-link').forEach(el => el.style.display = signedIn ? 'none' : '');
    $$('.profile-link').forEach(el => el.style.display = signedIn ? '' : 'none');
    $$('.signout-btn').forEach(el => el.style.display = signedIn ? '' : 'none');
  }

  /* ---------- Toasts ---------- */
  let toastEl;
  function toast(msg = 'Saved!', ms = 2200) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), ms);
  }

  /* ---------- Profile Page ---------- */
  function initProfile() {
    const user = readUser();
    if (!user) {
      location.href = 'signin.html';
      return;
    }

    const nameEl = $('#profileName');
    const emailEl = $('#profileEmail');
    const roleEl = $('#profileRole');

    nameEl.textContent = user.name || '—';
    emailEl.textContent = user.email || '—';
    roleEl.textContent = user.role || '—';
  }

  /* ---------- Page Router ---------- */
  function initByPage() {
    const page = document.body.dataset.page;
    if (page === 'home') initHome();
    if (page === 'donate') initDonate();
    if (page === 'track') initTrack();
    if (page === 'about') initAbout();
    if (page === 'contact') initContact();
    if (page === 'profile') initProfile();
  }

  /* ---------- Boot ---------- */
  function boot() {
    injectChrome();
    initByPage();
  }

  return { boot, writeUser, readUser, clearUser };
})();

document.addEventListener('DOMContentLoaded', App.boot);

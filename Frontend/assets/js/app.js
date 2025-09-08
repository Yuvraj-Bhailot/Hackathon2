/* ========== JS: Shared header/footer, router, storage, pages, interactivity ========== */

const App = (() => {
  /* ---------- Utilities ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmtDate = ts => new Date(ts).toLocaleString();
  const uid = () => Math.random().toString(36).slice(2, 9);

  /* ---------- Storage (localStorage) ---------- */
  const STORAGE_KEY = 'donations';
  const readDonations = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  };
  const writeDonations = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  /* ---------- Header + Footer Injection ---------- */
  const headerHTML = `
    <div class="header">
      <div class="container nav">
        <a class="brand" href="index.html">
          <span class="logo">🍲</span><span>FoodCare</span>
        </a>
        <nav class="navlinks" role="navigation" aria-label="Main">
          <a href="index.html">Home</a>
          <a href="donate.html">Donate</a>
          <a href="track.html">Track</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </nav>
        <button class="burger" aria-label="Toggle menu" title="Menu">☰</button>
        
        <a class="nav-cta hidden" href="donate.html">Donate Now</a>
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

    // Mobile menu
    const burger = $('.burger');
    const mobile = $('#mobileMenu');
    burger?.addEventListener('click', () => mobile?.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!mobile?.contains(e.target) && e.target !== burger) mobile?.classList.remove('open');
    });
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

  /* ---------- Homepage ---------- */
  function initHome() {
    const weekEl = $('#donorWeek');
    const monthEl = $('#donorMonth');

    const donorsFromData = () => {
      const items = readDonations();
      const now = Date.now();
      const agg = { week: {}, month: {} };
      items.forEach(d => {
        const dt = new Date(d.createdAt).getTime();
        const name = d.donorName?.trim() || 'Anonymous';
        if (now - dt <= 7 * 24 * 3600 * 1000) { agg.week[name] = (agg.week[name] || 0) + (+d.qty || 1); }
        if (now - dt <= 30 * 24 * 3600 * 1000) { agg.month[name] = (agg.month[name] || 0) + (+d.qty || 1); }
      });
      const top = dict => {
        const entries = Object.entries(dict);
        if (!entries.length) return null;
        entries.sort((a,b)=> b[1]-a[1]);
        return entries[0][0];
      };
      return { week: top(agg.week), month: top(agg.month) };
    };

    const fallbackWeek = ['Amit Sharma','Riya Mehta','Food4All'];
    const fallbackMonth = ['Helping Hands NGO','Sakshi Verma','Generous Souls'];

    let i=0, j=0;
    function rotate() {
      const calc = donorsFromData();
      weekEl.textContent = calc.week || fallbackWeek[i % fallbackWeek.length];
      monthEl.textContent = calc.month || fallbackMonth[j % fallbackMonth.length];
      i++; j++;
    }
    rotate();
    setInterval(rotate, 3500);
  }

  /* ---------- Donate Page ---------- */
  function initDonate() {
    const form = $('#donationForm');
    const preview = $('#donationPreview');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      // Validation
      const required = ['donorName','title','qty','category','address'];
      for (const k of required) {
        if (!String(data[k] || '').trim()) {
          toast(`Please fill ${k}.`);
          return;
        }
      }
      const qty = parseInt(data.qty, 10);
      if (!(qty > 0 && qty <= 10000)) {
        toast('Quantity should be between 1 and 10,000.');
        return;
      }
      // Build donation
      const donation = {
        id: uid(),
        donorName: data.donorName.trim(),
        title: data.title.trim(),
        qty,
        category: data.category,
        expiry: data.expiry || '',
        address: data.address.trim(),
        notes: data.notes || '',
        status: 'available',
        createdAt: Date.now()
      };
      // Save
      const arr = readDonations();
      arr.unshift(donation);
      writeDonations(arr);

      // UI
      toast('Donation saved! 🎉');
      form.reset();
      preview.innerHTML = `
        <div class="card fade-in">
          <div><strong>${donation.title}</strong> · <span class="badge">${donation.qty}</span></div>
          <div class="text-muted mt-1">${donation.category}${donation.expiry ? ` • Expires: ${donation.expiry}` : ''}</div>
          <div class="mt-1">Pickup: ${donation.address}</div>
          <div class="text-muted mt-1">by ${donation.donorName} • ${fmtDate(donation.createdAt)}</div>
          <div class="mt-2">
            <a class="btn secondary" href="track.html">View in Tracker →</a>
          </div>
        </div>
      `;
    });
  }

  /* ---------- Track Page ---------- */
  function initTrack() {
    const tbody = $('#tblBody');
    const statusFilter = $('#filterStatus');
    const categoryFilter = $('#filterCategory');
    const searchInput = $('#search');
    const sortSelect = $('#sort');

    function render() {
      const q = (searchInput.value || '').toLowerCase();
      const st = statusFilter.value;
      const cat = categoryFilter.value;
      const sort = sortSelect.value;

      let items = readDonations();

      if (st) items = items.filter(d => d.status === st);
      if (cat) items = items.filter(d => d.category === cat);
      if (q) {
        items = items.filter(d =>
          d.title.toLowerCase().includes(q) ||
          d.donorName.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q)
        );
      }
      if (sort === 'new') items.sort((a,b)=> b.createdAt - a.createdAt);
      if (sort === 'old') items.sort((a,b)=> a.createdAt - b.createdAt);
      if (sort === 'qty') items.sort((a,b)=> b.qty - a.qty);

      tbody.innerHTML = items.map(d => `
        <tr data-id="${d.id}">
          <td><strong>${d.title}</strong><div class="text-muted">${d.donorName}</div></td>
          <td><span class="badge">${d.qty}</span></td>
          <td>${d.category}</td>
          <td>${d.expiry || '-'}</td>
          <td>${d.address}</td>
          <td>
            <select class="input input--sm statusSel">
              ${['available','reserved','picked'].map(s => `<option value="${s}" ${s===d.status?'selected':''}>${s}</option>`).join('')}
            </select>
          </td>
          <td class="text-muted">${fmtDate(d.createdAt)}</td>
          <td><button class="btn secondary btnDel">Delete</button></td>
        </tr>
      `).join('') || `
        <tr><td colspan="8" class="center" style="padding:1.5rem">No donations yet.</td></tr>
      `;
    }

    // Events
    [statusFilter, categoryFilter, searchInput, sortSelect].forEach(el => el?.addEventListener('input', render));

    // Delegated events for status change + delete
    $('#table').addEventListener('change', e => {
      if (e.target.classList.contains('statusSel')) {
        const tr = e.target.closest('tr');
        const id = tr.getAttribute('data-id');
        const items = readDonations();
        const idx = items.findIndex(x=>x.id===id);
        if (idx > -1) {
          items[idx].status = e.target.value;
          writeDonations(items);
          toast('Status updated');
        }
      }
    });
    $('#table').addEventListener('click', e => {
      if (e.target.classList.contains('btnDel')) {
        const tr = e.target.closest('tr');
        const id = tr.getAttribute('data-id');
        const items = readDonations().filter(x=>x.id!==id);
        writeDonations(items);
        toast('Donation deleted');
        render();
      }
    });

    render();
  }

  /* ---------- About Page ---------- */
  function initAbout() {
    const totalMealsEl = $('#statMeals');
    const donorsEl = $('#statDonors');
    const lastAtEl = $('#statLast');

    const items = readDonations();
    const totalMeals = items.reduce((a,c)=> a + (+c.qty||0), 0);
    const uniqueDonors = new Set(items.map(d=>d.donorName)).size;
    const last = items[0]?.createdAt ? fmtDate(items[0].createdAt) : '—';

    totalMealsEl.textContent = totalMeals;
    donorsEl.textContent = uniqueDonors;
    lastAtEl.textContent = last;
  }

  /* ---------- Contact Page ---------- */
  function initContact() {
    const form = $('#contactForm');
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.email || !data.message) {
        toast('Please fill all fields.'); return;
      }
      if (!/.+@.+\..+/.test(data.email)) { toast('Enter a valid email.'); return; }
      toast('Message sent! (demo)');
      form.reset();
    });
  }

  /* ---------- Page Router ---------- */
  function initByPage() {
    const page = document.body.dataset.page;
    if (page === 'home') initHome();
    if (page === 'donate') initDonate();
    if (page === 'track') initTrack();
    if (page === 'about') initAbout();
    if (page === 'contact') initContact();
  }

  /* ---------- Boot ---------- */
  function boot() {
    injectChrome();
    initByPage();
  }

  return { boot };
})();

document.addEventListener('DOMContentLoaded', App.boot);

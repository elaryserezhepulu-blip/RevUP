/* ============================================================
   RevUp — CONNECTED frontend (talks to the backend API)

   This is the prototype's UI with the localStorage data layer replaced by
   calls to the RevUp backend. Accounts, stores, sales and reports now live on
   the server. The rendering/markup is unchanged, so it looks identical.

   Multi-language: all visible text goes through t('key') from i18n.js
   (Russian / English / Kazakh). i18n.js loads before this file.

   Served by the backend at http://localhost:4000 (same origin → no CORS).
   ============================================================ */

const API_BASE = location.protocol === 'file:' ? 'http://localhost:4000/api' : '/api';
let TOKEN = localStorage.getItem('revup_token') || null;

// One place for every backend call. Attaches the auth token and unwraps errors.
async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && TOKEN) headers['Authorization'] = 'Bearer ' + TOKEN;
  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    const err = new Error(t('cannotReach'));
    err.status = 0;
    throw err;
  }
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* no body */
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || t('requestFailed', { status: res.status }));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/* ---------- formatting helpers (from the prototype) ---------- */
const tg = (n) => '₸' + Math.round(n).toLocaleString('ru-RU');
const sum = (a) => a.reduce((s, v) => s + v, 0);
const fmt = (n) => Math.round(n).toLocaleString('ru-RU');

// Status colours (labels are translated via t('status_' + key)).
const STATUS = {
  rising: { color: 'var(--blue)', soft: 'var(--blue-soft)' },
  falling: { color: 'var(--red)', soft: 'var(--red-soft)' },
  slow: { color: 'var(--amber)', soft: 'var(--amber-soft)' },
  expiry: { color: 'var(--red)', soft: 'var(--red-soft)' },
  steady: { color: 'var(--accent)', soft: 'var(--accent-soft)' },
};
const statusLabel = (s) => t('status_' + s);

function lineChart(values) {
  const w = 560, h = 150, pad = 6, max = Math.max(1, ...values), n = values.length;
  const x = (i) => pad + (i / (n - 1)) * (w - 2 * pad);
  const y = (v) => h - pad - (v / max) * (h - 2 * pad - 6);
  const pts = values.map((v, i) => [x(i), y(v)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L ${x(n - 1).toFixed(1)} ${h - pad} L ${x(0).toFixed(1)} ${h - pad} Z`;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="none" style="display:block;height:150px">
    <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--accent)" stop-opacity=".20"/>
      <stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#lg)"/>
    <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

/* ---------- icons (from the prototype) ---------- */
const ICON = {
  logo: '<svg width="18" height="18" viewBox="0 0 24 24"><g fill="#fff"><rect x="3.5" y="12" width="4.3" height="8.5" rx="1.6"/><rect x="9.85" y="7.5" width="4.3" height="13" rx="1.6"/><rect x="16.2" y="3" width="4.3" height="17.5" rx="1.6"/></g></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  grid: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  store: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/></svg>',
  store2: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/></svg>',
  logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
  plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  plug: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0V8zM12 16v6"/></svg>',
  sync: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/></svg>',
  spark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>',
  stats: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  back: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>',
  pdf: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>',
  upload: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></svg>',
  whatsapp: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.18-3.1.98.99-3-.2-.31A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.25-.13-1.5-.74-1.73-.82-.23-.09-.4-.13-.57.13-.17.25-.65.82-.8.99-.15.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.38-.79-1.89-.2-.49-.41-.42-.57-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.78 2.72 4.3 3.81.6.26 1.07.42 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.5-.61 1.71-1.21.21-.6.21-1.11.15-1.21-.06-.11-.23-.17-.48-.3z"/></svg>',
};
const logoMark = (lg) => `<span class="logo-mark${lg ? ' lg' : ''}">${ICON.logo}</span>`;

// Periods carry a translation key; the label is resolved with t(p.key).
const PERIODS = [{ k: 7, key: 'weekly' }, { k: 30, key: 'monthly' }, { k: 365, key: 'yearly' }];
const periodLabel = (k) => {
  const p = PERIODS.find((x) => x.k === k);
  return p ? t(p.key) : '';
};

/* ---------- app state ---------- */
const APP = { user: null, currentStore: null, history: [] };
const state = { view: 'landing', authMode: 'signup', storeId: null, period: 30, tab: 'stats', report: null };

const app = () => document.getElementById('app');
function navigate(view, extra = {}) {
  Object.assign(state, { view, ...extra });
  render();
}
function setLoading(msg) {
  app().innerHTML = `<div style="min-height:100vh;display:grid;place-items:center;color:var(--soft);font-size:14px">${msg || t('loading')}</div>`;
}
function renderError(e) {
  app().innerHTML = `<div style="min-height:100vh;display:grid;place-items:center;text-align:center;padding:24px">
    <div><div style="font-size:16px;font-weight:700;margin-bottom:6px">${t('somethingWrong')}</div>
    <div class="muted" style="font-size:14px;margin-bottom:16px">${e.message || t('unknownError')}</div>
    <button class="btn btn-ghost" onclick="location.reload()">${t('reload')}</button></div></div>`;
}

function render() {
  if (!APP.user) {
    state.view === 'auth' ? renderAuth() : renderLanding();
    return;
  }
  if (state.view === 'store') return renderStore();
  if (state.view === 'stores') return renderStores();
  return renderDashboard();
}

/* ============================================================ LANDING ============ */
function renderLanding() {
  app().innerHTML = `
  <div class="landing fade">
    <div class="land-nav">
      <span class="logo">${logoMark()} RevUp</span><span class="sp"></span>
      <span style="margin-right:12px">${langSwitcher()}</span>
      <button class="btn btn-ghost" id="l-signin" style="margin-right:10px">${t('signIn')}</button>
      <button class="btn btn-primary" id="l-start">${t('getStarted')}</button>
    </div>
    <div class="land-hero">
      <div>
        <h1>${t('heroTitle1')}<br><span class="g">${t('heroTitle2')}</span></h1>
        <p>${t('heroSubtitle')}</p>
        <div class="land-cta">
          <button class="btn btn-primary btn-lg" id="l-start2">${t('startFree')}</button>
          <button class="btn btn-ghost btn-lg" id="l-signin2">${t('haveAccount')}</button>
        </div>
        <div class="land-points">
          <div>${ICON.check} ${t('pointFreeReport')}</div>
          <div>${ICON.check} ${t('pointCashRegister')}</div>
          <div>${ICON.check} ${t('pointBuiltKz')}</div>
        </div>
      </div>
      <div class="land-art">
        <div class="mini-tile"><div class="l">${t('artRevenue30')}</div><div class="v">₸2 419 120</div></div>
        <div class="mini-tile"><div class="l">${t('artTopDemand')}</div><div class="v">White bread · Milk · Eggs</div></div>
        <div class="mini-tile"><div class="l">${t('artSalesTrend')}</div>
          <div class="bars"><span style="height:40%"></span><span style="height:55%"></span><span style="height:48%"></span><span style="height:70%"></span><span style="height:62%"></span><span style="height:85%"></span><span style="height:100%"></span></div>
        </div>
      </div>
    </div>
  </div>`;
  const go = (m) => navigate('auth', { authMode: m });
  document.getElementById('l-start').onclick = () => go('signup');
  document.getElementById('l-start2').onclick = () => go('signup');
  document.getElementById('l-signin').onclick = () => go('login');
  document.getElementById('l-signin2').onclick = () => go('login');
  wireLang();
}

/* ============================================================ AUTH ============ */
function renderAuth() {
  const signup = state.authMode === 'signup';
  app().innerHTML = `
  <div class="auth fade">
    <div class="auth-brand">
      <div class="logo">${logoMark()} RevUp</div>
      <div>
        <h1>${t('authBrandTitle')}</h1>
        <p>${t('authBrandSub')}</p>
        <ul class="auth-points">
          <li>${ICON.check} ${t('authPoint1')}</li>
          <li>${ICON.check} ${t('authPoint2')}</li>
          <li>${ICON.check} ${t('authPoint3')}</li>
        </ul>
      </div>
      <div style="color:rgba(255,255,255,.6);font-size:13px">© RevUp</div>
    </div>
    <div class="auth-form-wrap">
      <div class="auth-card">
        <div style="display:flex;justify-content:flex-end;margin-bottom:16px">${langSwitcher()}</div>
        <h2>${signup ? t('createAccountTitle') : t('welcomeBack')}</h2>
        <p class="sub">${signup ? t('signupSub') : t('loginSub')}</p>
        ${signup ? `<div class="field"><label>${t('businessName')}</label><input id="f-biz" placeholder="${t('businessPlaceholder')}" /></div>` : ``}
        <div class="field"><label>${t('email')}</label><input id="f-email" type="email" placeholder="you@business.kz" /></div>
        <div class="field"><label>${t('password')}</label><input id="f-pass" type="password" placeholder="••••••••" /></div>
        <div class="form-error" id="f-err"></div>
        <button class="btn btn-primary btn-block btn-lg" id="f-submit">${signup ? t('createAccountBtn') : t('signIn')}</button>
        <div class="auth-switch">${signup ? t('alreadyRegistered') : t('newToRevup')}
          <button id="f-toggle">${signup ? t('signIn') : t('createAccountLink')}</button></div>
        <div class="auth-back"><button id="f-home">${t('backHome')}</button></div>
      </div>
    </div>
  </div>`;
  document.getElementById('f-toggle').onclick = () => navigate('auth', { authMode: signup ? 'login' : 'signup' });
  document.getElementById('f-home').onclick = () => navigate('landing');
  document.getElementById('f-submit').onclick = signup ? doSignup : doLogin;
  app().querySelectorAll('input').forEach((i) =>
    i.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') (signup ? doSignup : doLogin)();
    })
  );
  wireLang();
}
const showErr = (m) => {
  const e = document.getElementById('f-err');
  if (e) e.textContent = m;
};
const val = (id) => (document.getElementById(id)?.value || '').trim();

async function doSignup() {
  const business = val('f-biz');
  const email = val('f-email').toLowerCase();
  const pass = document.getElementById('f-pass').value || '';
  if (!business) return showErr(t('errBusiness'));
  if (!/^\S+@\S+\.\S+$/.test(email)) return showErr(t('errEmail'));
  if (pass.length < 6) return showErr(t('errPassword'));
  const btn = document.getElementById('f-submit');
  btn.disabled = true;
  try {
    const r = await api('/auth/signup', { method: 'POST', auth: false, body: { business, email, password: pass } });
    TOKEN = r.token;
    localStorage.setItem('revup_token', TOKEN);
    APP.user = r.user;
    navigate('dashboard');
  } catch (e) {
    showErr(ts(e.message));
    btn.disabled = false;
  }
}
async function doLogin() {
  const email = val('f-email').toLowerCase();
  const pass = document.getElementById('f-pass').value || '';
  const btn = document.getElementById('f-submit');
  btn.disabled = true;
  try {
    const r = await api('/auth/login', { method: 'POST', auth: false, body: { email, password: pass } });
    TOKEN = r.token;
    localStorage.setItem('revup_token', TOKEN);
    APP.user = r.user;
    navigate('dashboard');
  } catch (e) {
    showErr(ts(e.message));
    btn.disabled = false;
  }
}
function logout() {
  TOKEN = null;
  localStorage.removeItem('revup_token');
  APP.user = null;
  navigate('landing');
}

/* ============================================================ APP SHELL ============ */
function shell(active, mainHTML) {
  const u = APP.user;
  const item = (k, label, icon) =>
    `<button class="side-link ${active === k ? 'active' : ''}" data-nav="${k}">${icon}<span>${label}</span></button>`;
  return `<div class="shell">
    <aside class="sidebar">
      <div class="side-logo">${logoMark()} RevUp</div>
      <nav class="side-nav">
        ${item('dashboard', t('dashboard'), ICON.grid)}
        ${item('stores', t('stores'), ICON.store2)}
      </nav>
      <div class="side-foot">
        ${langSwitcherSide()}
        <div class="side-user"><div class="side-avatar">${(u.business || '?').slice(0, 1).toUpperCase()}</div>
          <div style="min-width:0"><div class="side-biz">${u.business}${u.subscribed ? ' · Pro' : ''}</div><div class="side-mail">${u.email}</div></div></div>
        <button class="side-link" id="side-logout">${ICON.logout}<span>${t('logOut')}</span></button>
      </div>
    </aside>
    <main class="main"><div class="main-inner fade">${mainHTML}</div></main>
  </div>`;
}
function wireShell() {
  app().querySelectorAll('[data-nav]').forEach((b) => (b.onclick = () => navigate(b.getAttribute('data-nav'))));
  const lo = document.getElementById('side-logout');
  if (lo) lo.onclick = logout;
  wireLang();
}

/* ============================================================ DASHBOARD ============ */
async function renderDashboard() {
  setLoading();
  let d;
  try {
    d = await api('/dashboard?period=30');
  } catch (e) {
    if (e.status === 401) return logout();
    return renderError(e);
  }
  app().innerHTML = shell(
    'dashboard',
    `
    <div class="page-head"><div><h2>${t('dashboard')}</h2><p>${t('dashSubtitle')}</p></div></div>
    <div class="tiles">
      <div class="tile"><div class="label">${t('revenue')}</div><div class="value accent tnum">${tg(d.totals.revenue)}</div></div>
      <div class="tile"><div class="label">${t('unitsSold')}</div><div class="value tnum">${fmt(d.totals.units)}</div></div>
      <div class="tile"><div class="label">${t('stores')}</div><div class="value tnum">${d.totals.storeCount}</div></div>
      <div class="tile"><div class="label">${t('suggestedOrder')}</div><div class="value tnum">${tg(d.totals.orderValue)}</div></div>
    </div>
    <div class="panel" style="margin-bottom:18px">
      <div class="panel-head">${t('revenueTrend30')}</div>
      <div style="padding:18px 12px 10px">${lineChart(d.series)}</div>
    </div>
    <div class="page-head" style="margin-bottom:14px"><div><h2 style="font-size:18px">${t('yourStores')}</h2></div>
      <button class="btn btn-ghost" data-nav="stores">${t('viewAll')}</button></div>
    <div class="store-grid">${d.stores.map(storeCard).join('')}</div>`
  );
  wireShell();
  app().querySelectorAll('[data-store]').forEach(
    (el) => (el.onclick = () => navigate('store', { storeId: el.getAttribute('data-store'), period: 30, tab: 'stats', report: null }))
  );
}

/* ============================================================ STORES ============ */
async function renderStores() {
  setLoading();
  let d;
  try {
    d = await api('/dashboard?period=30');
  } catch (e) {
    if (e.status === 401) return logout();
    return renderError(e);
  }
  app().innerHTML = shell(
    'stores',
    `
    <div class="page-head">
      <div><h2>${t('yourStores')}</h2><p>${t('storesSubtitle')}</p></div>
      <button class="btn btn-primary" id="add-store">${ICON.plus} ${t('addStore')}</button>
    </div>
    <div class="store-grid">
      ${d.stores.map(storeCard).join('')}
      <button class="store-add" id="add-store-2">${ICON.plus}<span>${t('addStoreCard')}</span></button>
    </div>`
  );
  wireShell();
  document.getElementById('add-store').onclick = openAddStore;
  document.getElementById('add-store-2').onclick = openAddStore;
  app().querySelectorAll('[data-store]').forEach(
    (el) => (el.onclick = () => navigate('store', { storeId: el.getAttribute('data-store'), period: 30, tab: 'stats', report: null }))
  );
}

// `s` is a store summary from /api/dashboard (has revenue, units, hasData, source, connection)
function storeCard(s) {
  let status;
  if (s.connection)
    status = `<span style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--accent);font-weight:600"><span class="dot" style="background:var(--accent)"></span>${t('statusApi', { provider: s.connection.provider })}</span>`;
  else if (s.source && s.source.type === 'csv')
    status = `<span style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--blue);font-weight:600"><span class="dot" style="background:var(--blue)"></span>${t('statusFile')}</span>`;
  else
    status = `<span style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--faint);font-weight:600"><span class="dot" style="background:var(--faint)"></span>${t('statusNoData')}</span>`;
  return `<div class="store-card" data-store="${s.id}">
    <div class="ico">${ICON.store}</div>
    <h3>${s.name}</h3><div class="loc">${s.location || '—'}</div>
    <div style="margin-top:8px">${status}</div>
    <div class="meta"><div>${t('revenue30d')}<b class="tnum">${s.hasData ? tg(s.revenue) : '—'}</b></div><div>${t('unitsSold')}<b class="tnum">${s.hasData ? fmt(s.units) : '—'}</b></div></div>
  </div>`;
}

function openAddStore() {
  modal(
    `<h3>${t('addStoreCard')}</h3>
    <p class="muted" style="font-size:13.5px;margin:0 0 18px">${t('addStoreDesc')}</p>
    <div class="field"><label>${t('storeName')}</label><input id="ns-name" placeholder="${t('storeNamePlaceholder')}" /></div>
    <div class="field"><label>${t('location')}</label><input id="ns-loc" placeholder="${t('locationPlaceholder')}" /></div>
    <div class="form-error" id="ns-err"></div>
    <button class="btn btn-primary btn-block" id="ns-save" style="margin-top:6px">${t('addStore')}</button>`,
    (close) => {
      document.getElementById('ns-save').onclick = async () => {
        const name = val('ns-name');
        if (!name) return;
        try {
          await api('/stores', { method: 'POST', body: { name, location: val('ns-loc') } });
          close();
          renderStores();
        } catch (e) {
          document.getElementById('ns-err').textContent = ts(e.message);
        }
      };
    }
  );
}

/* ============================================================ STORE DETAIL ============ */
async function renderStore() {
  setLoading();
  let store, history;
  try {
    store = (await api('/stores/' + state.storeId)).store;
    history = (await api('/stores/' + state.storeId + '/reports')).reports;
  } catch (e) {
    if (e.status === 404) return navigate('stores');
    if (e.status === 401) return logout();
    return renderError(e);
  }
  APP.currentStore = store;
  APP.history = history;
  const hasReport = state.report && state.report.storeId === store.id && state.report.period === state.period;

  app().innerHTML = shell(
    'stores',
    `
    <a class="back-link" id="back">${ICON.back} ${t('allStores')}</a>
    <div class="page-head">
      <div><h2>${store.name}</h2><p>${store.location || '—'}</p></div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <div class="seg" id="seg">${PERIODS.map((p) => `<button data-p="${p.k}" class="${p.k === state.period ? 'active' : ''}">${t(p.key)}</button>`).join('')}</div>
        <button class="btn btn-primary" id="gen">${ICON.spark} ${t('takeReport')}</button>
      </div>
    </div>
    ${connBar(store)}
    ${
      hasReport
        ? reportShell(store)
        : `<div class="panel"><div class="empty">${store.hasData ? t('emptyHasData') : t('emptyNoData')}</div></div>`
    }
    ${historyPanel(store)}`
  );
  wireShell();
  document.getElementById('back').onclick = () => navigate('stores');
  document.getElementById('seg').querySelectorAll('button').forEach(
    (b) =>
      (b.onclick = () => {
        state.period = Number(b.getAttribute('data-p'));
        state.report = null;
        renderStore();
      })
  );
  document.getElementById('gen').onclick = () => takeReport(store);
  wireConn(store);
  if (hasReport) wireReport(store);
  app().querySelectorAll('[data-rep]').forEach((el) => (el.onclick = () => viewReport(store, el.getAttribute('data-rep'))));
}

function reloadStore() {
  state.report = null;
  renderStore();
}

function historyPanel(store) {
  const reps = APP.history || [];
  if (!reps.length) return '';
  const row = (r) => {
    const d = new Date(r.createdAt);
    const when = d.toLocaleDateString('ru-RU') + ' · ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const active = state.report && state.report.reportId === r.id;
    return `<div class="hist-row" data-rep="${r.id}">
      <div class="hist-main"><div class="hist-when">${when}</div>
        <div class="hist-sub">${t('histSub', { period: periodLabel(r.period), rev: tg(r.totalRevenue), units: fmt(r.totalUnits) })}</div></div>
      <span class="hist-view">${active ? t('viewing') : t('view')}</span></div>`;
  };
  return `<div class="panel" style="margin-top:18px">
    <div class="panel-head">${t('reportHistory')}</div>
    ${reps.map(row).join('')}</div>`;
}

async function takeReport(store) {
  const btn = document.getElementById('gen');
  if (btn) btn.disabled = true;
  try {
    const r = await api('/stores/' + store.id + '/reports', { method: 'POST', body: { period: state.period } });
    if (r.user) APP.user = r.user;
    const e = r.report;
    state.report = { storeId: store.id, reportId: e.id, period: e.period, data: e.data, series: e.series, at: e.createdAt };
    state.tab = 'stats';
    renderStore();
  } catch (err) {
    if (btn) btn.disabled = false;
    if (err.status === 402) return showPaywall(store);
    toast(ts(err.message) || t('couldNotReport'));
  }
}

async function viewReport(store, id) {
  try {
    const e = (await api('/stores/' + store.id + '/reports/' + id)).report;
    state.report = { storeId: store.id, reportId: e.id, period: e.period, data: e.data, series: e.series, at: e.createdAt };
    state.period = e.period;
    state.tab = 'stats';
    renderStore();
  } catch (e) {
    toast(t('couldNotOpenReport'));
  }
}

function reportShell(store) {
  return `<div class="tabs" id="tabs">
      <button data-tab="stats" class="${state.tab === 'stats' ? 'active' : ''}">${ICON.stats} ${t('statistics')}</button>
      <button data-tab="recs" class="${state.tab === 'recs' ? 'active' : ''}">${ICON.spark} ${t('recommendations')}</button>
    </div>
    <div id="tab-body">${state.tab === 'stats' ? statsPage(store) : recsPage(store)}</div>`;
}
function wireReport(store) {
  document.getElementById('tabs').querySelectorAll('button').forEach(
    (b) =>
      (b.onclick = () => {
        state.tab = b.getAttribute('data-tab');
        renderStore();
      })
  );
  if (state.tab === 'stats') {
    wireSearch('stat-search', 'rank-row');
    wireProductChart();
  }
  else {
    wireSearch('rec-search', 'rec-row');
    const p = document.getElementById('pdf');
    if (p) p.onclick = () => printReport(store);
    const wa = document.getElementById('wa');
    if (wa) wa.onclick = () => sendWhatsApp(store);
  }
}

/* ---------- Statistics page ---------- */
function statsPage(store) {
  const a = state.report.data;
  const period = periodLabel(state.period).toLowerCase();
  const series = state.report.series || [];
  return `
    <div class="tiles">
      <div class="tile"><div class="label">${t('revenuePeriod', { period })}</div><div class="value accent tnum">${tg(a.totalRevenue)}</div></div>
      <div class="tile"><div class="label">${t('unitsSold')}</div><div class="value tnum">${fmt(a.totalUnits)}</div></div>
      <div class="tile"><div class="label">${t('productsSold')}</div><div class="value tnum">${a.products}</div></div>
      <div class="tile"><div class="label">${t('avgItemPrice')}</div><div class="value tnum">${tg(a.totalRevenue / Math.max(1, a.totalUnits))}</div></div>
    </div>
    <div class="panel" style="margin-bottom:18px">
      <div class="panel-head">${t('revenueTrend')}</div>
      <div style="padding:18px 12px 10px">${lineChart(series)}</div>
    </div>
    ${productChartPanel()}
    <div class="panel">
      <div class="panel-head">${t('topGoods')}
        <span class="search">${ICON.search}<input id="stat-search" placeholder="${t('searchProduct')}" /></span></div>
      <div id="rank-list">
        ${a.ranking
          .map(
            (x, i) => `
          <div class="rank-row" data-name="${x.product.toLowerCase()}">
            <div class="rank-no">${i + 1}</div>
            <div class="rank-main"><div class="rank-name">${x.product}</div>
              <div class="rank-bar"><span style="width:${Math.round((x.qty / a.maxQty) * 100)}%"></span></div></div>
            <div class="rank-qty tnum">${fmt(x.qty)}<small>${tg(x.revenue)}</small></div>
          </div>`
          )
          .join('')}
      </div>
    </div>`;
}

/* ---------- Revenue-by-product interactive chart ---------- */
// Products with revenue > 0, sorted by revenue, with share % and average price.
function productRevItems() {
  const items = [...state.report.data.ranking].filter((x) => x.revenue > 0).sort((a, b) => b.revenue - a.revenue);
  const total = items.reduce((s, x) => s + x.revenue, 0) || 1;
  return items.map((x) => ({
    product: x.product,
    revenue: x.revenue,
    qty: x.qty,
    avg: x.revenue / Math.max(1, x.qty),
    share: Math.round((x.revenue / total) * 1000) / 10,
  }));
}

// Builds the panel: interactive SVG bar chart + a detailed data table below it.
function productChartPanel() {
  const items = productRevItems();
  if (!items.length) return '';
  const W = 720, H = 240, padT = 18, padB = 46, padX = 12;
  const plotH = H - padT - padB;
  const n = items.length;
  const slot = (W - 2 * padX) / n;
  const bw = Math.min(48, slot * 0.58);
  const max = Math.max(1, ...items.map((x) => x.revenue));

  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => {
      const y = (padT + plotH * f).toFixed(1);
      return `<line class="pc-grid" x1="${padX}" y1="${y}" x2="${W - padX}" y2="${y}" opacity="${f === 1 ? 0.9 : 0.5}"/>`;
    })
    .join('');

  const bars = items
    .map((x, i) => {
      const h = (x.revenue / max) * plotH;
      const cx = padX + slot * i + slot / 2;
      const bx = cx - bw / 2;
      const by = H - padB - h;
      const nm = x.product.length > 12 ? x.product.slice(0, 11) + '…' : x.product;
      return `<g class="pc-bar" data-i="${i}">
        <rect class="pc-hit" x="${(padX + slot * i).toFixed(1)}" y="${padT}" width="${slot.toFixed(1)}" height="${plotH.toFixed(1)}"/>
        <rect class="pc-rect" x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" rx="6" style="animation-delay:${(i * 0.04).toFixed(2)}s"/>
        <circle class="pc-dot" cx="${cx.toFixed(1)}" cy="${by.toFixed(1)}" r="4.5"/>
        <text class="pc-xlabel" x="${cx.toFixed(1)}" y="${(H - padB + 18).toFixed(1)}" text-anchor="middle">${nm}</text>
      </g>`;
    })
    .join('');

  const rows = items
    .map(
      (x, i) =>
        `<tr><td>${i + 1}</td><td>${x.product}</td><td class="r">${fmt(x.qty)}</td><td class="r">${tg(x.revenue)}</td><td class="r">${x.share}%</td><td class="r">${tg(x.avg)}</td></tr>`
    )
    .join('');

  return `<div class="panel" style="margin-bottom:18px">
    <div class="panel-head">${t('revenueByProduct')}<span class="pc-hint">${t('chartHint')}</span></div>
    <div class="pc-wrap" id="pc-wrap">
      <div class="pc-tip" id="pc-tip"></div>
      <svg class="pc-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${t('revenueByProduct')}">
        <defs><linearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#18AC72"/><stop offset="1" stop-color="#0B8A5B"/></linearGradient></defs>
        ${grid}${bars}
      </svg>
    </div>
    <table class="pc-table">
      <thead><tr><th>#</th><th>${t('pdfProduct')}</th><th class="r">${t('unitsSold')}</th><th class="r">${t('revenue')}</th><th class="r">${t('shareOfRevenue')}</th><th class="r">${t('avgItemPrice')}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// Hover/touch interactivity: highlight the bar, show a tooltip near the pointer.
function wireProductChart() {
  const wrap = document.getElementById('pc-wrap');
  if (!wrap) return;
  const tip = document.getElementById('pc-tip');
  const items = productRevItems();
  const bars = [...wrap.querySelectorAll('.pc-bar')];

  const show = (i, clientX, clientY) => {
    const it = items[i];
    if (!it) return;
    bars.forEach((b) => {
      const bi = +b.dataset.i;
      b.classList.toggle('active', bi === i);
      b.classList.toggle('dim', bi !== i);
    });
    tip.innerHTML =
      `<div class="pc-tip-name">${it.product}</div>` +
      `<div class="pc-tip-row"><span>${t('revenue')}</span><b>${tg(it.revenue)}</b></div>` +
      `<div class="pc-tip-row"><span>${t('unitsSold')}</span><b>${fmt(it.qty)}</b></div>` +
      `<div class="pc-tip-row"><span>${t('shareOfRevenue')}</span><b>${it.share}%</b></div>`;
    tip.style.display = 'block';
    const r = wrap.getBoundingClientRect();
    let x = clientX - r.left - tip.offsetWidth / 2;
    let y = clientY - r.top - tip.offsetHeight - 16;
    x = Math.max(6, Math.min(r.width - tip.offsetWidth - 6, x));
    if (y < 6) y = clientY - r.top + 18;
    tip.style.left = x.toFixed(0) + 'px';
    tip.style.top = y.toFixed(0) + 'px';
  };
  const hide = () => {
    tip.style.display = 'none';
    bars.forEach((b) => b.classList.remove('active', 'dim'));
  };

  bars.forEach((b) => {
    const i = +b.dataset.i;
    b.addEventListener('mouseenter', (e) => show(i, e.clientX, e.clientY));
    b.addEventListener('mousemove', (e) => show(i, e.clientX, e.clientY));
  });
  wrap.addEventListener('mouseleave', hide);

  const at = (pt) => {
    const el = document.elementFromPoint(pt.clientX, pt.clientY);
    const g = el && el.closest && el.closest('.pc-bar');
    if (g) show(+g.dataset.i, pt.clientX, pt.clientY);
  };
  wrap.addEventListener('touchstart', (e) => { if (e.touches[0]) at(e.touches[0]); }, { passive: true });
  wrap.addEventListener('touchmove', (e) => { if (e.touches[0]) at(e.touches[0]); }, { passive: true });
  wrap.addEventListener('touchend', hide);
}

/* ---------- Recommendations page ---------- */
function recsPage(store) {
  const a = state.report.data;
  return `
    <div class="tiles">
      <div class="tile"><div class="label">${t('suggestedOrderValue')}</div><div class="value accent tnum">${tg(a.orderValue)}</div><div class="delta">${t('productsToOrder', { n: a.recs.filter((r) => r.order > 0).length })}</div></div>
      <div class="tile"><div class="label">${t('wasteAtRisk')}</div><div class="value tnum" style="color:var(--amber)">${tg(a.wasteValue)}</div><div class="delta">${t('flaggedToReduce')}</div></div>
    </div>
    <div class="panel">
      <div class="panel-head">${t('reorderRecs')}
        <span style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <span class="tag-ai">${ICON.spark} AI</span>
          <span class="search">${ICON.search}<input id="rec-search" placeholder="${t('searchProduct')}" /></span>
          <button class="btn btn-ghost" id="wa" style="padding:7px 12px;font-size:13px"><span style="color:#25D366">${ICON.whatsapp}</span> WhatsApp</button>
          <button class="btn btn-ghost" id="pdf" style="padding:7px 12px;font-size:13px">${ICON.pdf} PDF</button>
        </span></div>
      <div id="rec-list">
        ${a.recs
          .map((x) => {
            const s = STATUS[x.status];
            return `<div class="rec-row" data-name="${x.product.toLowerCase()}" style="border-left-color:${s.color}">
            <div class="rec-main"><div class="rec-name">${x.product}</div>
              <span class="pill" style="color:${s.color};background:${s.soft}">${statusLabel(x.status)}</span>
              ${x.trimmed && !x.expiryRisk ? `<span style="font-size:11px;color:var(--amber);margin-left:6px">${t('trimmedNote')}</span>` : ''}</div>
            <div class="rec-order"><div class="n tnum" style="color:${x.order ? 'var(--ink)' : 'var(--amber)'}">${x.order}</div>
              <div class="u">${t('orderLabel')}</div>${x.order ? `<div class="v tnum">${tg(x.orderValue)}</div>` : ''}</div>
          </div>`;
          })
          .join('')}
      </div>
    </div>`;
}

/* ---------- search filter (no re-render, keeps focus) ---------- */
function wireSearch(inputId, rowClass) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  inp.oninput = () => {
    const q = inp.value.trim().toLowerCase();
    app().querySelectorAll('.' + rowClass).forEach((r) => {
      r.style.display = r.getAttribute('data-name').includes(q) ? '' : 'none';
    });
  };
}

/* ---------- PDF (browser print → Save as PDF) ---------- */
function printReport(store) {
  const r = state.report;
  if (!r) return;
  const a = r.data;
  const period = periodLabel(r.period);
  const rows = (arr, fn) => arr.map(fn).join('');
  const html = `<html><head><meta charset="utf-8"><title>RevUp — ${store.name}</title>
    <style>
      body{font-family:Inter,Arial,sans-serif;color:#14181C;margin:32px;}
      h1{font-size:22px;margin:0 0 2px} .sub{color:#687078;font-size:13px;margin:0 0 18px}
      h2{font-size:14px;margin:24px 0 8px;border-bottom:1px solid #E8EAE7;padding-bottom:6px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      td,th{text-align:left;padding:6px 4px;border-bottom:1px solid #F0F1EF}
      th{color:#687078;font-weight:600} .r{text-align:right}
      .tot{display:flex;gap:30px;font-size:13px;margin-bottom:6px}
      .tot b{font-size:18px;display:block}
    </style></head><body>
    <h1>${t('pdfReportTitle', { store: store.name })}</h1>
    <div class="sub">${store.location || ''} · ${period} · ${new Date().toLocaleDateString('ru-RU')}</div>
    <div class="tot"><div>${t('revenue')}<b>${tg(a.totalRevenue)}</b></div><div>${t('unitsSold')}<b>${fmt(a.totalUnits)}</b></div><div>${t('suggestedOrder')}<b>${tg(a.orderValue)}</b></div></div>
    <h2>${t('pdfOrderThese')}</h2>
    <table><tr><th>${t('pdfProduct')}</th><th class="r">${t('pdfOrder')}</th><th class="r">${t('pdfValue')}</th></tr>
      ${rows(
        a.recs.filter((x) => x.order > 0 && x.status !== 'falling' && x.status !== 'slow' && !x.expiryRisk),
        (x) => `<tr><td>${x.product}</td><td class="r">${x.order}</td><td class="r">${tg(x.orderValue)}</td></tr>`
      )}
    </table>
    <h2>${t('pdfOrderLess')}</h2>
    <table>${rows(
      a.recs.filter((x) => x.expiryRisk || x.status === 'falling' || x.status === 'slow'),
      (x) => `<tr><td>${x.product}</td><td class="r">${statusLabel(x.status)}</td><td class="r">${t('orderLabel')} ${x.order}</td></tr>`
    )}</table>
    <h2>${t('topGoods')}</h2>
    <table><tr><th>#</th><th>${t('pdfProduct')}</th><th class="r">${t('pdfUnits')}</th><th class="r">${t('revenue')}</th></tr>
      ${rows(a.ranking.slice(0, 10), (x, i) => `<tr><td>${i + 1}</td><td>${x.product}</td><td class="r">${fmt(x.qty)}</td><td class="r">${tg(x.revenue)}</td></tr>`)}
    </table>
    <p style="color:#9AA2A8;font-size:11px;margin-top:24px">${t('pdfGeneratedBy')}</p>
    </body></html>`;
  const win = window.open('', '_blank');
  if (!win) {
    toast(t('allowPopups'));
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}

/* ---------- Send reorder list to WhatsApp ---------- */
// Builds a plain-text reorder message (product · quantity · value · total) in the
// current language — ready to send to a supplier.
function buildOrderText(store) {
  const a = state.report.data;
  const items = a.recs.filter((x) => x.order > 0 && x.status !== 'falling' && x.status !== 'slow' && !x.expiryRisk);
  const lines = [];
  lines.push(t('waHeader'));
  lines.push(store.name + (store.location ? ' · ' + store.location : ''));
  lines.push(periodLabel(state.period) + ' · ' + new Date().toLocaleDateString('ru-RU'));
  lines.push('');
  if (!items.length) {
    lines.push(t('waNothing'));
  } else {
    items.forEach((x) => lines.push('• ' + x.product + ' — ' + x.order + ' (' + tg(x.orderValue) + ')'));
    const total = items.reduce((s, x) => s + x.orderValue, 0);
    lines.push('');
    lines.push(t('suggestedOrder') + ': ' + tg(total));
  }
  return lines.join('\n');
}
// Opens WhatsApp (app or web) with the message pre-filled; the owner picks the supplier.
function sendWhatsApp(store) {
  const url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(buildOrderText(store));
  window.open(url, '_blank');
}

/* ============================================================ POS CONNECTION ============ */
const POS_PROVIDERS = ['Kaspi', 'Webkassa', 'SYNTERRA', 'X2 POS', '1C', 'Other'];

function connBar(store) {
  const c = store.connection;
  if (c) {
    const last = c.lastSync ? new Date(c.lastSync).toLocaleString('ru-RU') : t('lastSyncNotYet');
    return `<div class="conn-bar"><span class="dot" style="background:var(--accent)"></span>
      <span class="conn-text">${t('connectedTo', { provider: c.provider, last })}</span>
      <span class="conn-actions">
        <button class="btn btn-ghost" id="sync" style="padding:8px 14px">${ICON.sync} ${t('syncSalesBtn')}</button>
        <button class="btn btn-ghost" id="disconnect" style="padding:8px 13px">${t('disconnect')}</button></span></div>`;
  }
  if (store.source && store.source.type === 'csv') {
    return `<div class="conn-bar"><span class="dot" style="background:var(--blue)"></span>
      <span class="conn-text">${t('fileLoaded', { filename: store.source.filename, count: fmt(store.source.count) })}</span>
      <span class="conn-actions">
        <button class="btn btn-ghost" id="replace" style="padding:8px 14px">${t('replaceFile')}</button>
        <button class="btn btn-ghost" id="clear" style="padding:8px 13px">${t('clear')}</button></span></div>`;
  }
  return `<div class="conn-bar"><span class="dot" style="background:var(--faint)"></span>
    <span class="conn-text muted">${t('loadSalesPrompt')}</span>
    <span class="conn-actions">
      <button class="btn btn-ghost" id="upload" style="padding:8px 14px">${ICON.upload} ${t('uploadCsv')}</button>
      <button class="btn btn-primary" id="connect" style="padding:8px 14px">${ICON.plug} ${t('connectApi')}</button></span></div>`;
}
function wireConn(store) {
  const c = document.getElementById('connect');
  if (c) c.onclick = () => openConnectModal(store);
  const sy = document.getElementById('sync');
  if (sy) sy.onclick = () => syncSales(store);
  const d = document.getElementById('disconnect');
  if (d) d.onclick = () => clearData(store, t('disconnectedCleared'));
  const up = document.getElementById('upload');
  if (up) up.onclick = () => openUploadModal(store);
  const rp = document.getElementById('replace');
  if (rp) rp.onclick = () => openUploadModal(store);
  const cl = document.getElementById('clear');
  if (cl) cl.onclick = () => clearData(store, t('clearedRemoved'));
}

async function clearData(store, msg) {
  try {
    await api('/stores/' + store.id + '/sales', { method: 'DELETE' });
    toast(msg);
    reloadStore();
  } catch (e) {
    toast(ts(e.message));
  }
}

/* ---------- manual option: CSV import (server parses + maps) ---------- */
function openUploadModal(store) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal"><button class="modal-x" data-close>&times;</button><div class="modal-body" id="up-body"></div></div>`;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('[data-close]').onclick = close;
  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };
  const body = overlay.querySelector('#up-body');
  let csvText = '';

  function stepChoose() {
    body.innerHTML = `<h3>${t('uploadTitle')}</h3>
      <p class="muted" style="font-size:13.5px;margin:0 0 16px;line-height:1.55">${t('uploadDesc')}</p>
      <button class="btn btn-ghost btn-block" id="pick">${ICON.upload} ${t('chooseCsv')}</button>
      <input type="file" id="csv-file" accept=".csv" style="display:none" />
      <div class="form-error" id="csv-err" style="margin-top:10px"></div>`;
    const inp = body.querySelector('#csv-file');
    body.querySelector('#pick').onclick = () => inp.click();
    inp.onchange = () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = async () => {
        csvText = String(rd.result);
        try {
          const det = await api('/stores/' + store.id + '/sales/detect', { method: 'POST', body: { csv: csvText } });
          stepMap(f.name, det);
        } catch (e) {
          body.querySelector('#csv-err').textContent = ts(e.message);
        }
      };
      rd.onerror = () => {
        body.querySelector('#csv-err').textContent = t('fileReadErr');
      };
      rd.readAsText(f);
    };
  }

  function stepMap(filename, det) {
    const fields = det.fields;
    const guess = det.suggested || {};
    const optionList = (sel) => `<option value="">—</option>` + fields.map((f) => `<option ${f === sel ? 'selected' : ''}>${f}</option>`).join('');
    const fieldRow = (key, label, req) =>
      `<div class="field" style="margin-bottom:10px"><label>${label}${req ? ' *' : ''}</label><select data-map="${key}">${optionList(guess[key])}</select></div>`;
    body.innerHTML = `<h3>${t('matchColumns')}</h3>
      <p class="muted" style="font-size:13px;margin:0 0 14px;line-height:1.5">${t('matchDesc', { filename })}</p>
      ${fieldRow('product', t('colProduct'), true)}
      ${fieldRow('quantity', t('colQuantity'), true)}
      ${fieldRow('price', t('colPrice'), false)}
      ${fieldRow('date', t('colDate'), false)}
      ${fieldRow('stock', t('colStock'), false)}
      <div class="form-error" id="map-err"></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-ghost" id="map-back">${t('back')}</button>
        <button class="btn btn-primary" id="map-load" style="flex:1">${t('loadRows', { n: fmt(det.rowCount) })}</button>
      </div>`;
    body.querySelector('#map-back').onclick = stepChoose;
    body.querySelector('#map-load').onclick = async () => {
      const map = {};
      body.querySelectorAll('[data-map]').forEach((s) => (map[s.getAttribute('data-map')] = s.value || undefined));
      if (!map.product || !map.quantity) {
        body.querySelector('#map-err').textContent = t('chooseProductQuantity');
        return;
      }
      try {
        const res = await api('/stores/' + store.id + '/sales/csv', {
          method: 'POST',
          body: { csv: csvText, filename, mapping: map },
        });
        close();
        reloadStore();
        toast(t('loadedRows', { n: res.count }));
      } catch (e) {
        body.querySelector('#map-err').textContent = ts(e.message);
      }
    };
  }
  stepChoose();
}

function openConnectModal(store) {
  modal(
    `<h3>${t('connectTitle')}</h3>
    <p class="muted" style="font-size:13.5px;margin:0 0 18px">${t('connectDesc')}</p>
    <div class="field"><label>${t('cashSystem')}</label><select id="c-provider">${POS_PROVIDERS.map((p) => `<option>${p}</option>`).join('')}</select></div>
    <div class="field"><label>${t('apiKey')}</label><input id="c-key" type="password" placeholder="${t('apiKeyPlaceholder')}" /></div>
    <div class="field"><label>${t('merchantId')}</label><input id="c-mid" placeholder="${t('merchantPlaceholder')}" /></div>
    <div class="form-error" id="c-err"></div>
    <button class="btn btn-primary btn-block" id="c-save">${ICON.plug} ${t('connectBtn')}</button>
    <p class="note" style="text-align:left">${t('connectNote')}</p>`,
    (close) => {
      document.getElementById('c-save').onclick = async () => {
        const key = (document.getElementById('c-key').value || '').trim();
        if (!key) {
          document.getElementById('c-err').textContent = t('errApiKey');
          return;
        }
        try {
          const r = await api('/stores/' + store.id + '/sales/connect', {
            method: 'POST',
            body: {
              provider: document.getElementById('c-provider').value,
              apiKey: key,
              merchantId: val('c-mid'),
            },
          });
          close();
          reloadStore();
          toast(t('connectedSynced', { n: r.count }));
        } catch (e) {
          document.getElementById('c-err').textContent = ts(e.message);
        }
      };
    }
  );
}

async function syncSales(store) {
  toast(t('syncing'));
  try {
    const r = await api('/stores/' + store.id + '/sales/sync', { method: 'POST' });
    reloadStore();
    toast(t('syncedRows', { n: r.count, provider: store.connection ? store.connection.provider : 'POS' }));
  } catch (e) {
    toast(ts(e.message));
  }
}

/* ============================================================ PAYWALL ============ */
function showPaywall(store) {
  modal(
    `<span class="tag-ai" style="background:var(--accent-soft)">RevUp Pro</span>
    <h3 style="margin-top:14px">${t('freeReportUsed')}</h3>
    <p class="muted" style="font-size:14px;margin:4px 0 0">${t('paywallDesc')}</p>
    <div class="price">₸40 000 <span>${t('perYear')}</span></div>
    <ul>
      <li>${ICON.check} ${t('proFeature1')}</li>
      <li>${ICON.check} ${t('proFeature2')}</li>
      <li>${ICON.check} ${t('proFeature3')}</li>
    </ul>
    <div class="form-error" id="sub-err"></div>
    <button class="btn btn-primary btn-block btn-lg" id="subscribe">${t('subscribeBtn')}</button>
    <p class="note">${t('paywallNote')}</p>`,
    (close) => {
      document.getElementById('subscribe').onclick = async () => {
        try {
          const r = await api('/billing/subscribe', { method: 'POST' });
          if (r.user) APP.user = r.user;
          close();
          takeReport(store);
        } catch (e) {
          document.getElementById('sub-err').textContent = ts(e.message);
        }
      };
    }
  );
}

/* ============================================================ shared modal + toast ============ */
function modal(innerHTML, wire) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal"><button class="modal-x" data-close>&times;</button><div class="modal-body">${innerHTML}</div></div>`;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('[data-close]').onclick = close;
  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };
  if (wire) wire(close);
}
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 260);
  }, 2200);
}

/* ---------- boot ---------- */
async function boot() {
  // Play the one-time intro splash before whatever screen loads (landing OR dashboard).
  if (!window.__introPlayed && typeof window.playIntro === 'function') {
    window.__introPlayed = true;
    try { window.playIntro(); } catch (e) {}
  }
  if (TOKEN) {
    try {
      const me = await api('/auth/me');
      APP.user = me.user;
      navigate('dashboard');
      return;
    } catch (e) {
      TOKEN = null;
      localStorage.removeItem('revup_token');
    }
  }
  renderLanding();
}
boot();

// =========================
// THEME MANAGER
// =========================
class ThemeManager {
  constructor() {
    this.apiBase     = 'http://localhost:5000/api';
    this.themeGrid   = null;
    this.searchInput = null;
    this.themes      = [];
    this.STORAGE_KEY = 'wedease_saved_themes';
    this.init();
  }

  /* ── Auth ─────────────────────────────────────────────── */
  getToken() {
    return localStorage.getItem('wedease_auth_token') ||
           sessionStorage.getItem('wedease_auth_token') || null;
  }
  isLoggedIn() { return !!this.getToken(); }
  authHeaders() {
    return { 'Content-Type': 'application/json',
             'Authorization': `Bearer ${this.getToken()}` };
  }

  /* ── localStorage ─────────────────────────────────────── */
  getSaved()          { try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; } catch { return []; } }
  isSaved(key)        { return this.getSaved().some(t => t.key === key); }
  lsSave(theme) {
    const arr = this.getSaved();
    if (!arr.some(t => t.key === theme.key)) {
      arr.push({ key: theme.key, title: theme.title,
                 description: theme.description || '',
                 images: theme.images || [], link: theme.link || '#' });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(arr));
    }
  }
  lsRemove(key) {
    localStorage.setItem(this.STORAGE_KEY,
      JSON.stringify(this.getSaved().filter(t => t.key !== key)));
  }

  /* ── DB calls ─────────────────────────────────────────── */
  async dbSave(theme) {
    const res = await fetch(`${this.apiBase}/saved-themes`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({
        themeKey:    theme.key,
        title:       theme.title,
        description: theme.description || '',
        images:      theme.images      || [],
        link:        theme.link        || '#',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async dbRemove(key) {
    const res = await fetch(`${this.apiBase}/saved-themes/${encodeURIComponent(key)}`,
      { method: 'DELETE', headers: this.authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }

  async dbGetAll() {
    const res = await fetch(`${this.apiBase}/saved-themes`, { headers: this.authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  /* ── Toggle save ──────────────────────────────────────── */
  async toggleSave(theme) {
    const saving = !this.isSaved(theme.key);

    if (saving) {
      // optimistic local update first
      this.lsSave(theme);
      this.updateNavBadge();
      if (this.isLoggedIn()) {
        try {
          await this.dbSave(theme);
          console.log(`✅ "${theme.title}" saved to DB`);
        } catch (e) {
          console.error('DB save failed:', e.message);
          this.toast(`⚠️ Saved locally only (DB error: ${e.message})`);
        }
      }
    } else {
      this.lsRemove(theme.key);
      this.updateNavBadge();
      if (this.isLoggedIn()) {
        try {
          await this.dbRemove(theme.key);
          console.log(`✅ "${theme.title}" removed from DB`);
        } catch (e) {
          console.error('DB remove failed:', e.message);
        }
      }
    }
    return saving;
  }

  /* ── Sync from DB on page load ────────────────────────── */
  async syncFromDB() {
    if (!this.isLoggedIn()) return;
    try {
      const data = await this.dbGetAll();
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map(t => ({
          key: t.themeKey, title: t.title,
          description: t.description, images: t.images, link: t.link,
        }));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mapped));
        console.log(`✅ Synced ${mapped.length} saved themes from DB`);
      }
    } catch (e) { console.warn('DB sync failed, using localStorage:', e.message); }
  }

  /* ── Nav badge ────────────────────────────────────────── */
  updateNavBadge() {
    const count = this.getSaved().length;
    const badge = document.getElementById('fav-nav-count');
    if (!badge) return;
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
  }

  /* ── Init ─────────────────────────────────────────────── */
  async init() {
    this.themeGrid   = document.getElementById('main-theme-grid');
    this.searchInput = document.getElementById('theme-search');
    if (!this.themeGrid) { console.error('No #main-theme-grid found'); return; }

    await this.syncFromDB();
    this.updateNavBadge();

    this.showLoading(true);
    this.renderPlaceholders();

    try {
      await this.fetchFromBackend();
      this.renderThemes();
    } catch (e) {
      console.warn('Backend unavailable, using placeholders');
      this.showError('Could not load Unsplash images. Showing placeholders.');
    } finally {
      this.showLoading(false);
    }

    this.bindEvents();
  }

  /* ── Theme data ───────────────────────────────────────── */
  getCuratedList() {
    return [
      { key:'romantic',   title:'Romantic',           desc:'Soft colors, candles, and florals for a dreamy atmosphere.' },
      { key:'fairytale',  title:'Fairytale',           desc:'Whimsical decor, pastel tones, and magical lighting.' },
      { key:'garden',     title:'Garden Wedding',      desc:'Fresh greenery, outdoor florals, and nature-inspired elegance.' },
      { key:'pastel',     title:'Pastel Theme',        desc:'Soft blush, baby blue, lavender tones for a gentle vibe.' },
      { key:'boho',       title:'Boho',                desc:'Macrame, earthy tones, and free-spirited artistic styling.' },
      { key:'barn',       title:'Barn Wedding',        desc:'Warm lights, wooden textures, and cozy barn details.' },
      { key:'forest',     title:'Forest Wedding',      desc:'Leafy backdrops, natural textures, and woodland vibes.' },
      { key:'elegant',    title:'Elegant',             desc:'Clean design, premium fabrics, and timeless style.' },
      { key:'classic',    title:'Classic',             desc:'Neutral palettes and sophisticated traditional decor.' },
      { key:'luxury',     title:'Luxury Wedding',      desc:'Gold accents, crystal decor, and premium styling.' },
      { key:'modern',     title:'Modern',              desc:'Bold accents, geometric shapes, and contemporary design.' },
      { key:'industrial', title:'Industrial',          desc:'Metallics, exposed brick, and chic warehouse aesthetics.' },
      { key:'chinese',    title:'Chinese Traditional', desc:'Red and gold tones, lanterns, and cultural symbolism.' },
      { key:'indian',     title:'Indian Wedding',      desc:'Vibrant colors, rich fabrics, and celebratory traditions.' },
      { key:'beach',      title:'Beach Wedding',       desc:'Soft sands, ocean breeze, and tropical styling.' },
      { key:'sunset',     title:'Sunset Wedding',      desc:'Warm glowing tones and dreamy golden-hour aesthetics.' },
      { key:'vintage',    title:'Vintage',             desc:'Old-fashioned decor and timeless visual charm.' },
      { key:'french',     title:'French Romantic',     desc:'Soft elegance, pastel florals and vintage French decor.' },
    ];
  }

  ph(key, i) {
    const c = { romantic:'FFB6C1',fairytale:'DDA0DD',garden:'98FB98',pastel:'FFD1DC',
      boho:'DEB887',barn:'CD853F',forest:'228B22',elegant:'D3D3D3',classic:'F5F5DC',
      luxury:'FFD700',modern:'808080',industrial:'A9A9A9',chinese:'FF4500',indian:'FF8C00',
      beach:'87CEEB',sunset:'FF7F50',vintage:'8B4513',french:'FF69B4' };
    return `https://via.placeholder.com/400x300/${c[key]||'CCCCCC'}/FFFFFF?text=${key}+${i+1}`;
  }

  async fetchFromBackend() {
    const res  = await fetch(`${this.apiBase}/themes/fetch-all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && data.data?.length) {
      this.themes = data.data;
    } else {
      this.themes = this.getCuratedList().map(t =>
        ({ key:t.key, title:t.title, description:t.desc, images:[null,null,null], link:'#' }));
      throw new Error('No data');
    }
  }

  renderPlaceholders() {
    this.themeGrid.innerHTML = '';
    this.getCuratedList().forEach(t =>
      this.themeGrid.appendChild(this.makeCard(
        { key:t.key, title:t.title, description:t.desc, images:[null,null,null], link:'#' }, true)));
  }

  /* ── Card ─────────────────────────────────────────────── */
  makeCard(theme, isPlaceholder = false) {
    const card = document.createElement('div');
    card.className = 'theme-card';
    card.dataset.themeKey = theme.key;

    let imgs = '';
    for (let i = 0; i < 3; i++) {
      const src = (!isPlaceholder && theme.images?.[i]) ? theme.images[i] : this.ph(theme.key, i);
      imgs += `<img src="${this.esc(src)}" alt="${this.esc(theme.title)}" loading="lazy"
                    onerror="this.src='${this.ph(theme.key,i)}'">`;
    }

    const saved = this.isSaved(theme.key);
    card.innerHTML = `
      <div class="theme-image-grid">${imgs}</div>
      <div class="theme-body">
        <h3>${this.esc(theme.title)}</h3>
        <p class="theme-desc">${this.esc(theme.description)}</p>
        <div class="theme-actions">
          <a class="inspo-btn" href="${theme.link||'#'}" target="_blank" rel="noopener noreferrer">View Inspiration</a>
          <button class="save-theme-btn${saved?' saved':''}" type="button" data-key="${this.esc(theme.key)}">
            <svg viewBox="0 0 24 24" width="15" height="15"
                 fill="${saved?'currentColor':'none'}"
                 stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>${saved?'Saved':'Save'}</span>
          </button>
        </div>
      </div>`;

    const btn = card.querySelector('.save-theme-btn');
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      btn.disabled = true;
      const nowSaved = await this.toggleSave(theme);
      btn.classList.toggle('saved', nowSaved);
      btn.querySelector('svg').setAttribute('fill', nowSaved ? 'currentColor' : 'none');
      btn.querySelector('span').textContent = nowSaved ? 'Saved' : 'Save';
      this.toast(nowSaved
        ? `♥ "${theme.title}" saved to favourites!`
        : `"${theme.title}" removed from favourites.`);
      btn.disabled = false;
    });

    return card;
  }

  /* ── Render / filter ──────────────────────────────────── */
  renderThemes(filter = '') {
    if (!this.themes?.length) { this.renderPlaceholders(); return; }
    const list = filter
      ? this.themes.filter(t => t.title.toLowerCase().includes(filter.toLowerCase()))
      : this.themes;
    if (!list.length) {
      this.themeGrid.innerHTML = '<p style="text-align:center;padding:3rem;color:#999">No themes found.</p>';
      return;
    }
    this.themeGrid.innerHTML = '';
    list.forEach(t => this.themeGrid.appendChild(this.makeCard(t, false)));
  }

  /* ── Toast ────────────────────────────────────────────── */
  toast(msg) {
    document.querySelector('.theme-toast')?.remove();
    const el = document.createElement('div');
    el.className = 'theme-toast'; el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
    setTimeout(() => { el.classList.remove('visible'); setTimeout(() => el.remove(), 400); }, 2800);
  }

  /* ── Loading / Error ──────────────────────────────────── */
  showLoading(on) {
    const el = document.querySelector('.theme-loading');
    if (on && !el && this.themeGrid?.parentNode) {
      const d = document.createElement('div'); d.className = 'theme-loading';
      d.innerHTML = '<div class="spinner"></div><p>Loading inspiration from Unsplash…</p>';
      this.themeGrid.parentNode.insertBefore(d, this.themeGrid);
    } else if (!on && el) el.remove();
  }
  showError(msg) {
    const d = document.createElement('div'); d.className = 'theme-error'; d.textContent = msg;
    this.themeGrid?.parentNode?.insertBefore(d, this.themeGrid);
    setTimeout(() => d.remove(), 5000);
  }

  esc(s) {
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')
                  .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  bindEvents() {
    this.searchInput?.addEventListener('input', e => this.renderThemes(e.target.value.trim()));
  }
}

/* ── Boot ─────────────────────────────────────────────────────── */
function bootThemeManager() {
  if (document.getElementById('main-theme-grid') && !window.themeManager) {
    window.themeManager = new ThemeManager();
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootThemeManager);
} else {
  bootThemeManager();
}
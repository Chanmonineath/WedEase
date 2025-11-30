// =========================
// THEME MANAGER (Unsplash API + search)
// =========================
  class ThemeManager {
    constructor() {
      this.accessKey = 'i65VqX1kxQVuEwSEABbxMRtA_rufIZ7_DuQWG1W_EBQ';
      this.themeGrid = null;
      this.searchInput = null;
      this.themes = [];
      this.init();
    }

    async init() {
      this.themeGrid = document.querySelector('.theme-grid');
      this.searchInput = document.getElementById('theme-search');
      if (!this.themeGrid) return;

      // Use a curated list of wedding theme recommendations (title + short blurb)
      await this.fetchCuratedThemes();
      this.renderThemes();
      this.bindEvents();
    }

    // Curated themes with short recommendation descriptions
    getCuratedList() {
      return [
        { key: 'romantic', title: 'Romantic', desc: 'Soft colors, lots of candles and florals for an intimate, dreamy atmosphere.' },
        { key: 'rustic', title: 'Rustic', desc: 'Barn venues, wooden details and wildflowers for a cozy, down-to-earth feel.' },
        { key: 'vintage', title: 'Vintage', desc: 'Antique decor, lace, and timeless accents for nostalgic charm.' },
        { key: 'boho', title: 'Boho', desc: 'Free-spirited decor, macramé, and eclectic florals for a relaxed vibe.' },
        { key: 'elegant', title: 'Elegant', desc: 'Clean lines, luxe fabrics, and refined details for a sophisticated day.' },
        { key: 'classic', title: 'Classic', desc: 'Traditional styling, neutral palettes, and timeless design choices.' },
        { key: 'modern', title: 'Modern', desc: 'Minimalist design, bold accents, and contemporary touches.' },
        { key: 'fairytale', title: 'Fairytale', desc: 'Whimsical decor, pastel tones, and magical lighting for a storybook wedding.' }
      ];
    }

    async fetchCuratedThemes() {
      const curated = this.getCuratedList();
      const results = [];
      for (const item of curated) {
        try {
          // Fetch 3 images with varied queries to get more visual diversity
          const queries = [
            `${item.key} wedding decoration`,
            `${item.key} wedding ceremony`,
            `${item.key} wedding reception`
          ];
          const seenIds = new Set();
          const images = [];
          
          for (const q of queries) {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1&client_id=${this.accessKey}`;
            try {
              const resp = await fetch(url);
              if (!resp.ok) continue;
              const json = await resp.json();
              const photo = (json.results || [])[0];
              if (photo && photo.id && !seenIds.has(photo.id)) {
                seenIds.add(photo.id);
                images.push(photo.urls.small);
              }
            } catch (e) {
              // continue to next query if this one fails
            }
          }

          const firstPhotoUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(`${item.key} wedding`)}&per_page=1&client_id=${this.accessKey}`;
          let link = '#';
          try {
            const resp = await fetch(firstPhotoUrl);
            if (resp.ok) {
              const json = await resp.json();
              const photo = (json.results || [])[0];
              if (photo) link = photo.links.html;
            }
          } catch (e) {
            // fallback link stays '#'
          }

          console.log(`Theme "${item.key}" fetched ${images.length} unique images:`, images);
          results.push({
            key: item.key,
            title: item.title,
            description: item.desc,
            images: images.length ? images : ['assets/img/placeholder.jpg'],
            link: link
          });
        } catch (err) {
          console.warn('Curated theme fetch failed for', item.key, err);
          results.push({
            key: item.key,
            title: item.title,
            description: item.desc,
            images: ['assets/img/placeholder.jpg'],
            link: '#'
          });
        }
      }
      this.themes = results;
    }

    // fetchThemes removed — we use curated themes instead

    renderThemes(filter = "") {
      this.themeGrid.innerHTML = '';

      const themesToShow = this.themes.filter(t =>
        t.title.toLowerCase().includes(filter.toLowerCase()) || t.key.toLowerCase().includes(filter.toLowerCase())
      );

      if (themesToShow.length === 0) {
        this.themeGrid.innerHTML = '<p>No themes found.</p>';
        return;
      }

      themesToShow.forEach(theme => {
        const card = document.createElement('div');
        card.className = 'theme-card';
        const imagesHtml = (theme.images || []).map(src => `<img src="${src}" alt="${theme.title}">`).join('');
        card.innerHTML = `
            <div class="theme-image-grid">${imagesHtml}</div>
            <div class="theme-body">
              <h3>${theme.title}</h3>
              <p class="theme-desc">${theme.description}</p>
              <div class="theme-actions"><a class="inspo-btn" href="${theme.link}" target="_blank" rel="noopener noreferrer">View Inspiration</a></div>
            </div>
          `;

        card.addEventListener('click', () => {
          // Open an in-page explorer so the user can browse more inspiration
          this.showThemeExplorer(theme);
          localStorage.setItem('wedease_selected_theme', theme.title);
        });

        this.themeGrid.appendChild(card);
      });
    }

    // Open a modal to explore a theme's images in larger view
    showThemeExplorer(theme) {
      try {
        // remove existing modal if any
        const existing = document.getElementById('theme-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'theme-modal-overlay';
        overlay.className = 'theme-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'theme-modal';

        const header = document.createElement('div');
        header.className = 'theme-modal-header';
        header.innerHTML = `<h2>${theme.title}</h2>`;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'theme-modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => overlay.remove());
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.className = 'theme-modal-body';

        // Large main image area
        const mainWrap = document.createElement('div');
        mainWrap.className = 'theme-modal-main';
        const mainImg = document.createElement('img');
        mainImg.className = 'theme-modal-main-img';
        mainImg.src = theme.images && theme.images[0] ? theme.images[0] : 'assets/img/placeholder.jpg';
        mainImg.alt = theme.title;
        mainWrap.appendChild(mainImg);

        // Thumbnails
        const thumbs = document.createElement('div');
        thumbs.className = 'theme-modal-thumbs';
        (theme.images || []).forEach((src, idx) => {
          const t = document.createElement('img');
          t.src = src;
          t.alt = `${theme.title} ${idx+1}`;
          t.className = 'theme-modal-thumb';
          t.addEventListener('click', (e) => {
            e.stopPropagation();
            mainImg.src = src;
          });
          thumbs.appendChild(t);
        });

        // External link
        const actions = document.createElement('div');
        actions.className = 'theme-modal-actions';
        const viewBtn = document.createElement('a');
        viewBtn.href = theme.link || '#';
        viewBtn.target = '_blank';
        viewBtn.rel = 'noopener noreferrer';
        viewBtn.className = 'inspo-btn';
        viewBtn.innerText = 'Open on Unsplash';
        actions.appendChild(viewBtn);

        body.appendChild(mainWrap);
        body.appendChild(thumbs);
        body.appendChild(actions);

        modal.appendChild(header);
        modal.appendChild(body);
        overlay.appendChild(modal);

        // close on overlay click (but not when clicking modal)
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) overlay.remove();
        });

        document.body.appendChild(overlay);
      } catch (err) {
        console.error('Error opening theme explorer:', err);
        alert('Unable to open explorer. Please try again.');
      }
    }

    bindEvents() {
      if (!this.searchInput) return;
      this.searchInput.addEventListener('input', async (e) => {
        const q = e.target.value.trim();
        if (q === '') {
          this.renderThemes();
        } else {
          await this.fetchThemes(q);
          this.renderThemes();
        }
      });
    }
}
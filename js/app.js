// =========================
// INCLUDE HTML COMPONENTS
// =========================
function includeHTML() {
  const elements = document.querySelectorAll('[data-include]');
  const promises = [];

  elements.forEach(element => {
    const file = element.getAttribute('data-include');
    const p = fetch(file)
      .then(response => {
        if (!response.ok) throw new Error(`Could not load ${file}`);
        return response.text();
      })
      .then(data => {
        element.innerHTML = data;
      })
      .catch(error => {
        console.error('Error including HTML:', error);
        element.innerHTML = '<p>Component loading error</p>';
      });
    promises.push(p);
  });

  return Promise.all(promises);
}

// =========================
// GLOBAL UTILITIES
// =========================
class WedEASEUtils {
  static formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  }

  static setupHeaderScroll() {
    const header = document.getElementById("header");
    if (!header) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          header.classList.toggle("is-fixed", window.scrollY > 0);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  static setupHoverEffects() {
    const interactiveElements = document.querySelectorAll(".feature-card, .category-card, .theme-card, .feature-box");
    interactiveElements.forEach(el => {
      el.addEventListener("mouseenter", () => { el.style.transition = "all 0.3s ease"; });
    });
  }

  static updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (
        linkHref === currentPage ||
        (currentPage === 'index.html' && linkHref === '../index.html')
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
}

// =========================
// HERO MANAGER
// =========================
class HeroManager {
  constructor() {
    this.images = [
      "assets/img/bride and groom.png",
      "assets/img/wedding car.png",
      "assets/img/ring hand.png"
    ];
    this.ctaIcons = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`,
      `<img src="assets/img/twin ring icon.png" alt="Wedding Rings" width="32" height="32" style="filter: brightness(0) invert(1);">`
    ];
    this.ctaTexts = ["Find Your Partner","Plan Your Journey","Start Your Story"];
    this.currentIndex = 0;
    this.init();
  }

  init() {
    const heroImage = document.getElementById('hero-image');
    const ctaButton = document.getElementById('hero-cta-button');
    if (!heroImage || !ctaButton) return;

    this.updateHeroContent();
    this.startAutoRotation();

    heroImage.addEventListener('click', () => this.nextImage());
  }
  }

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

// =========================
// MAIN APP INITIALIZATION
// =========================
let heroManager, themeManager;
document.addEventListener("DOMContentLoaded", () => {
  includeHTML().then(() => {
    // Only initialize HeroManager on landing page
    const heroImage = document.getElementById('hero-image');
    if (heroImage) {
      heroManager = new HeroManager();
    }
    
    // Only initialize ThemeManager on theme page
    const themeGrid = document.querySelector('.theme-grid');
    const themeSearch = document.getElementById('theme-search');
    if (themeGrid && themeSearch) {
      themeManager = new ThemeManager();
    }
    
    // Initialize other managers if they exist
    if (typeof WedEASEApp !== 'undefined') {
      new WedEASEApp();
    }
  });
});

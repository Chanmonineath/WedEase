// =========================
// THEME MANAGER - WITH UNSPLASH API VIA BACKEND
// =========================
class ThemeManager {
  constructor() {
    this.apiBase = 'http://localhost:5000/api';
    this.themeGrid = null;
    this.searchInput = null;
    this.themes = [];
    this.isLoading = false;
    this.init();
  }

  async init() {
    this.themeGrid = document.querySelector(".theme-grid");
    this.searchInput = document.getElementById("theme-search");

    if (!this.themeGrid) {
      console.error("Theme grid not found!");
      return;
    }

    console.log("ThemeManager initializing...");
    
    // Show loading state
    this.showLoading(true);
    
    // Render placeholders immediately
    this.renderPlaceholderThemes();
    
    // Fetch real images from backend
    try {
      await this.fetchThemesFromBackend();
      this.renderThemes();
    } catch (error) {
      console.error("Failed to fetch themes:", error);
      this.showError("Failed to load images from Unsplash. Showing placeholders.");
    } finally {
      this.showLoading(false);
    }
    
    this.bindEvents();
  }

  getCuratedList() {
    return [
      { key: "romantic", title: "Romantic", desc: "Soft colors, candles, and florals for a dreamy atmosphere." },
      { key: "fairytale", title: "Fairytale", desc: "Whimsical decor, pastel tones, and magical lighting." },
      { key: "garden", title: "Garden Wedding", desc: "Fresh greenery, outdoor florals, and nature-inspired elegance." },
      { key: "pastel", title: "Pastel Theme", desc: "Soft blush, baby blue, lavender tones for a gentle vibe." },
      { key: "boho", title: "Boho", desc: "Macrame, earthy tones, and free-spirited artistic styling." },
      { key: "barn", title: "Barn Wedding", desc: "Warm lights, wooden textures, and cozy barn details." },
      { key: "forest", title: "Forest Wedding", desc: "Leafy backdrops, natural textures, and woodland vibes." },
      { key: "elegant", title: "Elegant", desc: "Clean design, premium fabrics, and timeless style." },
      { key: "classic", title: "Classic", desc: "Neutral palettes and sophisticated traditional decor." },
      { key: "luxury", title: "Luxury Wedding", desc: "Gold accents, crystal decor, and premium styling." },
      { key: "modern", title: "Modern", desc: "Bold accents, geometric shapes, and contemporary design." },
      { key: "industrial", title: "Industrial", desc: "Metallics, exposed brick, and chic warehouse aesthetics." },
      { key: "chinese", title: "Chinese Traditional", desc: "Red and gold tones, lanterns, and cultural symbolism." },
      { key: "indian", title: "Indian Wedding", desc: "Vibrant colors, rich fabrics, and celebratory traditions." },
      { key: "beach", title: "Beach Wedding", desc: "Soft sands, ocean breeze, and tropical styling." },
      { key: "sunset", title: "Sunset Wedding", desc: "Warm glowing tones and dreamy golden-hour aesthetics." },
      { key: "vintage", title: "Vintage", desc: "Old-fashioned decor and timeless visual charm." },
      { key: "french", title: "French Romantic", desc: "Soft elegance, pastel florals and vintage French décor." }
    ];
  }

  getPlaceholderImage(key, index) {
    const colors = {
      romantic: 'FFB6C1', fairytale: 'DDA0DD', garden: '98FB98', pastel: 'FFD1DC',
      boho: 'DEB887', barn: 'CD853F', forest: '228B22', elegant: 'D3D3D3',
      classic: 'F5F5DC', luxury: 'FFD700', modern: '808080', industrial: 'A9A9A9',
      chinese: 'FF4500', indian: 'FF8C00', beach: '87CEEB', sunset: 'FF7F50',
      vintage: '8B4513', french: 'FF69B4'
    };
    const color = colors[key] || 'CCCCCC';
    return `https://via.placeholder.com/400x300/${color}/FFFFFF?text=${key}+${index+1}`;
  }

  renderPlaceholderThemes() {
    const themes = this.getCuratedList();
    this.themeGrid.innerHTML = "";

    themes.forEach((theme) => {
      const card = this.createThemeCard({
        key: theme.key,
        title: theme.title,
        description: theme.desc,
        images: [null, null, null],
        link: '#'
      }, true);
      this.themeGrid.appendChild(card);
    });
    console.log("Placeholder themes rendered");
  }

  async fetchThemesFromBackend() {
    try {
      console.log("Fetching themes from backend API...");
      const response = await fetch(`${this.apiBase}/themes/fetch-all`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Backend response:", data);
      
      if (data.success && data.data && data.data.length > 0) {
        this.themes = data.data;
        console.log(`✅ Loaded ${this.themes.length} themes with images from Unsplash`);
        
        // Log first theme to verify images
        if (this.themes[0]) {
          console.log("First theme images:", this.themes[0].images);
        }
      } else {
        throw new Error("No data received from backend");
      }
    } catch (error) {
      console.error("Error fetching from backend:", error);
      // Create fallback themes with placeholders
      const themes = this.getCuratedList();
      this.themes = themes.map(theme => ({
        key: theme.key,
        title: theme.title,
        description: theme.desc,
        images: [null, null, null],
        link: '#'
      }));
      throw error;
    }
  }

  createThemeCard(theme, isPlaceholder = false) {
    const card = document.createElement("div");
    card.className = "theme-card";

    let imagesHtml = '';
    
    for (let i = 0; i < 3; i++) {
      let src;
      if (!isPlaceholder && theme.images && theme.images[i] && theme.images[i] !== null) {
        src = theme.images[i];
      } else {
        src = this.getPlaceholderImage(theme.key, i);
      }
      imagesHtml += `<img class="theme-img" src="${src}" alt="${this.escapeHtml(theme.title)}" loading="lazy" onerror="this.src='${this.getPlaceholderImage(theme.key, i)}'">`;
    }

    card.innerHTML = `
      <div class="theme-image-grid">${imagesHtml}</div>
      <div class="theme-body">
        <h3>${this.escapeHtml(theme.title)}</h3>
        <p class="theme-desc">${this.escapeHtml(theme.description)}</p>
        <div class="theme-actions">
          <a class="inspo-btn" href="${theme.link || '#'}" target="_blank" rel="noopener noreferrer">View Inspiration</a>
        </div>
      </div>
    `;

    return card;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  renderThemes(filter = "") {
    if (!this.themes || this.themes.length === 0) {
      this.renderPlaceholderThemes();
      return;
    }

    let themesToShow = this.themes;
    if (filter) {
      themesToShow = this.themes.filter(
        (t) => t.title.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (themesToShow.length === 0) {
      this.themeGrid.innerHTML = '<div class="no-results" style="text-align: center; padding: 3rem; color: #999;">No themes found matching your search.</div>';
      return;
    }

    this.themeGrid.innerHTML = "";
    themesToShow.forEach((theme) => {
      const card = this.createThemeCard(theme, false);
      this.themeGrid.appendChild(card);
    });
    
    console.log(`Rendered ${themesToShow.length} themes with real images`);
  }

  showLoading(show) {
    const existingLoader = document.querySelector('.theme-loading');
    if (show) {
      if (!existingLoader && this.themeGrid && this.themeGrid.parentNode) {
        const loader = document.createElement('div');
        loader.className = 'theme-loading';
        loader.innerHTML = '<div class="spinner"></div><p>Loading beautiful inspiration from Unsplash...</p>';
        this.themeGrid.parentNode.insertBefore(loader, this.themeGrid);
      }
    } else {
      if (existingLoader) existingLoader.remove();
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'theme-error';
    errorDiv.textContent = message;
    if (this.themeGrid && this.themeGrid.parentNode) {
      this.themeGrid.parentNode.insertBefore(errorDiv, this.themeGrid);
    }
    setTimeout(() => errorDiv.remove(), 5000);
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.renderThemes(e.target.value.trim());
      });
    }
  }
}

// Add styles for loading spinner
if (!document.querySelector('#theme-spinner-style')) {
  const style = document.createElement('style');
  style.id = 'theme-spinner-style';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .theme-loading {
      text-align: center;
      padding: 3rem;
      color: #a2437c;
    }
    .theme-loading .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #a2437c;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    .theme-error {
      text-align: center;
      padding: 1rem;
      color: #e53e3e;
      background: #fff5f5;
      border-radius: 8px;
      margin: 1rem 0;
      border: 1px solid #feb2b2;
    }
  `;
  document.head.appendChild(style);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".theme-grid")) {
      window.themeManager = new ThemeManager();
    }
  });
} else {
  if (document.querySelector(".theme-grid")) {
    window.themeManager = new ThemeManager();
  }
}

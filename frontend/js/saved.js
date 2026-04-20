// =========================
// SAVED THEMES MANAGER 
// =========================
class SavedThemesManager {
  constructor() {
    this.apiBase = 'http://localhost:5000/api';
    this.container = document.getElementById('savedThemesContainer');
    this.savedThemes = [];
    this.init();
  }

  isUserLoggedIn() {
    const token = localStorage.getItem('wedease_token');
    return token !== null && token !== '';
  }

  getAuthToken() {
    return localStorage.getItem('wedease_token') || '';
  }

  async init() {
    if (!this.isUserLoggedIn()) {
      this.render();
      return;
    }

    // Load saved themes from backend
    await this.loadSavedThemes();
    this.render();

    // Listen for updates to saved themes from other parts of the app
    window.dispatchEvent(new Event('savedThemesUpdated'));
  }

  // =========================
  // STORAGE
  // =========================
  async loadSavedThemes() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        this.savedThemes = [];
        return;
      }

      const response = await fetch(`${this.apiBase}/saved-themes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.savedThemes = data.data || [];
        console.log('Loaded saved themes from backend:', this.savedThemes.length);
      } else {
        console.error('Error loading saved themes:', response.statusText);
        this.savedThemes = [];
      }
    } catch (error) {
      console.error('Error loading saved themes:', error);
      this.savedThemes = [];
    }
  }

  // =========================
  // REMOVE
  // =========================
  async removeTheme(themeKey) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`${this.apiBase}/saved-themes/${themeKey}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to remove theme: ${response.statusText}`);
      }

      console.log(`❌ Removed theme: ${themeKey}`);
      
      // Reload saved themes
      await this.loadSavedThemes();
      this.render();

      // Notify entire app
      window.dispatchEvent(new Event('savedThemesUpdated'));
    } catch (error) {
      console.error('Error removing theme:', error);
      alert('Failed to remove theme. Please try again.');
    }
  }

  // =========================
  // UTIL
  // =========================
  getPlaceholderImage(key, index) {
  const colors = {
    romantic: 'FFB6C1', fairytale: 'DDA0DD', garden: '98FB98', pastel: 'FFD1DC',
    boho: 'DEB887', barn: 'CD853F', forest: '228B22', elegant: 'D3D3D3',
    classic: 'F5F5DC', luxury: 'FFD700', modern: '808080', industrial: 'A9A9A9',
    chinese: 'FF4500', indian: 'FF8C00', beach: '87CEEB', sunset: 'FF7F50',
    vintage: '8B4513', french: 'FF69B4'
  };
  const color = colors[key] || 'CCCCCC';
  return `https://placehold.co/400x300/${color}/FFFFFF?text=${key}`;
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

  escapeUrl(str) {
    if (!str) return '#';
    const sanitized = str.trim();
    if (!sanitized.match(/^(https?:\/\/|mailto:|\/)/i)) {
      return '#';
    }
    return this.escapeHtml(sanitized);
  }

  // =========================
  // CARD
  // =========================
  createThemeCard(theme) {
    const card = document.createElement('div');
    card.className = 'theme-card';

    const images = theme.images || [null, null, null];
    let imagesHtml = '';

    for (let i = 0; i < 3; i++) {
      const src = images[i] || this.getPlaceholderImage(theme.key, i);
      imagesHtml += `
        <img class="theme-img"
          src="${this.escapeUrl(src)}"
          alt="${this.escapeHtml(theme.title)}"
          loading="lazy"
          onerror="this.src='${this.getPlaceholderImage(theme.key, i)}'">
      `;
    }

    card.innerHTML = `
      <div class="close-btn" data-id="${theme.id || theme.key}">×</div>
      
      <div class="theme-image-grid">${imagesHtml}</div>

      <div class="theme-body">
        <h3>${this.escapeHtml(theme.title)}</h3>
        <p class="theme-desc">
          ${this.escapeHtml(theme.description || 'Your saved wedding inspiration')}
        </p>

        <div class="theme-actions">
          <a class="inspo-btn" href="${theme.link || '#'}" target="_blank" rel="noopener noreferrer">View Inspiration</a>
        </div>
      </div>
    `;

    const closeBtn = card.querySelector('.close-btn');
    closeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();

      if (confirm(`Remove "${theme.title}" from saved themes?`)) {
        await this.removeTheme(theme.key || theme.id);
      }
    });

    return card;
  }

  // =========================
  // RENDER
  // =========================
  render() {
    if (!this.container) return;

    // Check if user is logged in
    if (!this.isUserLoggedIn()) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔐</div>
          <h3>Please log in to view your saved themes</h3>
          <p>You need to create an account or log in to save and view your favorite themes.</p>
          <a href="login.html" class="browse-themes-btn">🔑 Log In or Sign Up</a>
        </div>
      `;
      return;
    }

    if (this.savedThemes.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💭</div>
          <h3>You have not saved any theme yet.</h3>
          <p>Start exploring and save your favorites!</p>
          <a href="theme.html" class="browse-themes-btn">🎨 Explore Themes</a>
        </div>
      `;
      return;
    }

    this.container.innerHTML = '';

    this.savedThemes.forEach(theme => {
      this.container.appendChild(this.createThemeCard(theme));
    });
  }
}

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
  window.savedManager = new SavedThemesManager();
});
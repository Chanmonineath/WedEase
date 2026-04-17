// =========================
// THEME MANAGER — Instant placeholders + async Unsplash loading
// =========================
class ThemeManager {
  constructor() {
    this.accessKey = "i65VqX1kxQVuEwSEABbxMRtA_rufIZ7_DuQWG1W_EBQ";
    this.themeGrid = null;
    this.searchInput = null;
    this.themes = []; // will hold API results later
    this.init();
  }

  // =========================
  // INIT — show placeholders first, then load API in background
  // =========================
  async init() {
    this.themeGrid = document.querySelector(".theme-grid");
    this.searchInput = document.getElementById("theme-search");

    // Step 1: render local placeholder images immediately
    this.renderPlaceholderThemes();

    // Step 2: load real images asynchronously (does NOT block UI)
    this.fetchCuratedThemes().then(() => {
      this.renderThemes(); // replaces placeholders if API returns
    });

    this.bindEvents();
  }

  // =========================
  // Curated themes
  // =========================
  getCuratedList() {
    return [
      {
        key: "romantic",
        title: "Romantic",
        desc: "Soft colors, candles, and florals for a dreamy atmosphere.",
      },
      {
        key: "fairytale",
        title: "Fairytale",
        desc: "Whimsical decor, pastel tones, and magical lighting.",
      },
      {
        key: "garden",
        title: "Garden Wedding",
        desc: "Fresh greenery, outdoor florals, and nature-inspired elegance.",
      },
      {
        key: "pastel",
        title: "Pastel Theme",
        desc: "Soft blush, baby blue, lavender tones for a gentle vibe.",
      },

      {
        key: "boho",
        title: "Boho",
        desc: "Macrame, earthy tones, and free-spirited artistic styling.",
      },
      {
        key: "barn",
        title: "Barn Wedding",
        desc: "Warm lights, wooden textures, and cozy barn details.",
      },
      {
        key: "forest",
        title: "Forest Wedding",
        desc: "Leafy backdrops, natural textures, and woodland vibes.",
      },

      {
        key: "elegant",
        title: "Elegant",
        desc: "Clean design, premium fabrics, and timeless style.",
      },
      {
        key: "classic",
        title: "Classic",
        desc: "Neutral palettes and sophisticated traditional decor.",
      },
      {
        key: "luxury",
        title: "Luxury Wedding",
        desc: "Gold accents, crystal decor, and premium styling.",
      },

      {
        key: "modern",
        title: "Modern",
        desc: "Bold accents, geometric shapes, and contemporary design.",
      },
      {
        key: "industrial",
        title: "Industrial",
        desc: "Metallics, exposed brick, and chic warehouse aesthetics.",
      },

      {
        key: "chinese",
        title: "Chinese Traditional",
        desc: "Red and gold tones, lanterns, and cultural symbolism.",
      },
      {
        key: "indian",
        title: "Indian Wedding",
        desc: "Vibrant colors, rich fabrics, and celebratory traditions.",
      },

      {
        key: "beach",
        title: "Beach Wedding",
        desc: "Soft sands, ocean breeze, and tropical styling.",
      },
      {
        key: "sunset",
        title: "Sunset Wedding",
        desc: "Warm glowing tones and dreamy golden-hour aesthetics.",
      },

      {
        key: "vintage",
        title: "Vintage",
        desc: "Old-fashioned decor and timeless visual charm.",
      },
      {
        key: "french",
        title: "French Romantic",
        desc: "Soft elegance, pastel florals and vintage French décor.",
      },
    ];
  }

  // =========================
  // Local placeholder images: 3 per theme
  // =========================
  getLocalPlaceholderImages(key) {
    return [
      `../../../assets/img/theme-placeholders/${key}-1.png`,
      `../../../assets/img/theme-placeholders/${key}-2.png`,
      `../../../assets/img/theme-placeholders/${key}-3.png`,
    ];
  }

  // =========================
  // 1️⃣ Render placeholders instantly (no API wait)
  // =========================
  renderPlaceholderThemes() {
    const themes = this.getCuratedList();
    this.themeGrid.innerHTML = "";

    themes.forEach((theme) => {
      const placeholders = this.getLocalPlaceholderImages(theme.key);

      const card = document.createElement("div");
      card.className = "theme-card";

      const imagesHtml = placeholders
        .map(
          (src) => `<img class="theme-img" src="${src}" alt="${theme.title}">`
        )
        .join("");

      card.innerHTML = `
        <div class="theme-image-grid">${imagesHtml}</div>
        <div class="theme-body">
          <h3>${theme.title}</h3>
          <p class="theme-desc">${theme.desc}</p>
        </div>
      `;

      this.themeGrid.appendChild(card);
    });
  }

  // =========================
  // 2️⃣ Load real Unsplash images asynchronously
  // =========================
  async fetchCuratedThemes() {
    const curated = this.getCuratedList();
    const results = [];

    for (const item of curated) {
      const fallback = this.getLocalPlaceholderImages(item.key);
      const images = [];
      let link = "#"; // default link

      // Fetch 3 small images
      const queries = [
        `${item.key} wedding decoration`,
        `${item.key} wedding ceremony`,
        `${item.key} wedding reception`,
      ];

      for (const q of queries) {
        try {
          const resp = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
              q
            )}&per_page=1&client_id=${this.accessKey}`
          );

          if (resp.ok) {
            const json = await resp.json();
            const photo = json?.results?.[0];

            if (photo) {
              images.push(photo.urls.small);

              // grab a link if we don't have one yet
              if (link === "#" && photo.links?.html) {
                link = photo.links.html;
              }
            } else {
              images.push(null);
            }
          } else {
            images.push(null);
          }
        } catch {
          images.push(null);
        }
      }

      const finalImages = images.map((img, idx) => img || fallback[idx]);

      results.push({
        key: item.key,
        title: item.title,
        description: item.desc,
        images: finalImages,
        link: link,
      });
    }

    this.themes = results;
  }

  // =========================
  // 3️⃣ Replace placeholders with API images (if available)
  // =========================
  renderThemes(filter = "") {
    this.themeGrid.innerHTML = "";

    const themesToShow = this.themes.filter(
      (t) =>
        t.title.toLowerCase().includes(filter.toLowerCase()) ||
        t.key.toLowerCase().includes(filter.toLowerCase())
    );

    themesToShow.forEach((theme) => {
      const card = document.createElement("div");
      card.className = "theme-card";

      const imagesHtml = theme.images
        .map(
          (src) => `<img class="theme-img" src="${src}" alt="${theme.title}">`
        )
        .join("");

      card.innerHTML = `
        <div class="theme-image-grid">${imagesHtml}</div>
        <div class="theme-body">
          <h3>${theme.title}</h3>
          <p class="theme-desc">${theme.description}</p>
          <div class="theme-actions"><a class="inspo-btn" style="" href="${theme.link}" target="_blank" rel="noopener noreferrer">View Inspiration</a></div>
        </div>
      `;

      this.themeGrid.appendChild(card);
    });
  }

  // =========================
  // Search handling
  // =========================
  bindEvents() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener("input", (e) => {
      this.renderThemes(e.target.value.trim());
    });
  }
}

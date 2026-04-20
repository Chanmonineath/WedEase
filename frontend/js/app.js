// ===============================================
// GLOBAL UTILITIES & SHARED FUNCTIONALITY
// ===============================================

class WedEASEUtils {
  static formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  static setupHeaderScroll() {
    const header = document.getElementById("header");
    if (!header) return;

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (window.scrollY > 0) {
              header.classList.add("is-fixed");
            } else {
              header.classList.remove("is-fixed");
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  static setupHoverEffects() {
    const interactiveElements = document.querySelectorAll(
      ".feature-card, .category-card, .theme-card, .feature-box"
    );
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", function () {
        this.style.transition = "all 0.3s ease";
      });
    });
  }

  static updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      const linkHref = link.getAttribute('href');
      if (linkHref === currentPage ||
          (currentPage === 'index.html' && linkHref === '../index.html') ||
          (linkHref && linkHref.includes(currentPage.replace('.html', '')))) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
}


// ===============================================
// HERO IMAGE ROTATOR & CTA MANAGER
// ===============================================

class HeroManager {
  constructor() {
    this.images = [
      "assets/img/bride and groom.png",
      "assets/img/wedding car.png",
      "assets/img/ring hand.png"
    ];

    this.ctaIcons = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>`,
      `<img src="assets/img/twin ring icon.png" alt="Wedding Rings" width="32" height="32" style="filter: brightness(0) invert(1);">`
    ];

    this.ctaTexts = [
      "Find Your Partner",
      "Plan Your Journey",
      "Start Your Story"
    ];

    this.currentIndex = 0;
    this.rotationInterval = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) {
      console.log("Hero Manager: Already initialized");
      return;
    }

    const heroImage = document.getElementById('hero-image');
    const ctaButton = document.getElementById('hero-cta-button');

    if (!heroImage || !ctaButton) {
      console.log("Hero Manager: required elements not found");
      return;
    }

    heroImage.src = this.images[this.currentIndex];
    heroImage.alt = this.getAltText();
    this.updateCtaContent();
    this.startAutoRotation();

    heroImage.addEventListener('click', () => this.nextImage());

    this.initialized = true;
    console.log("Hero Manager: initialized and running");
  }

  startAutoRotation() {
    if (this.rotationInterval) clearInterval(this.rotationInterval);
    this.rotationInterval = setInterval(() => this.nextImage(), 3000);
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateHeroContent();
  }

  updateHeroContent() {
    const heroImage = document.getElementById('hero-image');
    const ctaButton = document.getElementById('hero-cta-button');
    if (!heroImage || !ctaButton) return;

    heroImage.style.transition = 'opacity 0.3s ease-in-out';
    heroImage.style.opacity = '0.1';

    setTimeout(() => {
      heroImage.src = this.images[this.currentIndex];
      heroImage.alt = this.getAltText();
      heroImage.style.opacity = '1';
    }, 300);

    this.updateCtaContent();
  }

  updateCtaContent() {
    const ctaButton = document.getElementById('hero-cta-button');
    if (!ctaButton) return;
    ctaButton.innerHTML = `
      ${this.ctaIcons[this.currentIndex]}
      <span style="color: white;">${this.ctaTexts[this.currentIndex]}</span>
    `;
  }

  getAltText() {
    return ["Bride and Groom", "Wedding Car", "Ring Hand"][this.currentIndex];
  }
}

// ===============================================
// SAVED THEMES FUNCTIONALITY (CLEAN FINAL)
// ===============================================

function updateSavedUI() {
  try {
    // ===== COUNT =====
    let count = 0;
    try {
      const saved = JSON.parse(localStorage.getItem('wedease_saved_themes') || '[]');
      count = saved.length;
    } catch {}

    const savedCount = document.getElementById('savedCount');
    if (savedCount) {
      savedCount.textContent = count > 0 ? count : '';
    }

    // ===== LOGIN VISIBILITY =====
    const savedBtn = document.getElementById('savedBtn');
    const user = sessionStorage.getItem('wedease_current');

    if (savedBtn) {
      if (user) {
        savedBtn.classList.remove('hidden');
      } else {
        savedBtn.classList.add('hidden');
      }
    }

  } catch (error) {
    console.error('Error updating saved UI:', error);
  }
}

// ===== INIT ON LOAD =====
document.addEventListener("DOMContentLoaded", () => {
  updateSavedUI();

  window.addEventListener('storage', (e) => {
    if (e.key === 'wedease_saved_themes') {
      updateSavedUI();
    }
  });

 document.addEventListener("DOMContentLoaded", () => {
  updateSavedUI();

  window.addEventListener('storage', (e) => {
    if (e.key === 'wedease_saved_themes') {
      updateSavedUI();
    }
  });

  window.addEventListener('focus', updateSavedUI);
  window.addEventListener('savedThemesUpdated', updateSavedUI); 
});
  
  // Listen for custom event
  window.addEventListener('savedThemesUpdated', updateSavedCountDisplay);
});


// ===============================================
// WEDDING COUNTDOWN MANAGER
// ===============================================

class CountdownManager {
  constructor() {
    this.weddingDate = null;
    this.countdownInterval = null;
    this.init();
  }

  init() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('weddingDateInput');
    if (dateInput) dateInput.min = today;

    const setDateBtn = document.getElementById('setDateBtn');
    const clearDateBtn = document.getElementById('clearDateBtn');
    const exploreBtn = document.getElementById('exploreMoreBtn');

    if (setDateBtn) setDateBtn.addEventListener('click', () => this.setWeddingDate());
    if (clearDateBtn) clearDateBtn.addEventListener('click', () => this.clearWeddingDate());
    if (exploreBtn) exploreBtn.addEventListener('click', () => { window.location.href = 'src/pages/about.html'; });
    if (dateInput) dateInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.setWeddingDate(); });

    this.loadSavedData();
  }

  loadSavedData() {
    const savedDate = localStorage.getItem('wedease_wedding_date');
    if (savedDate) {
      this.weddingDate = new Date(savedDate);
      const dateInput = document.getElementById('weddingDateInput');
      if (dateInput) dateInput.value = savedDate.split('T')[0];
      this.startCountdown();
    }
  }

  setWeddingDate() {
    const dateInput = document.getElementById('weddingDateInput');
    if (!dateInput || !dateInput.value) { this.showError('Please select your wedding date'); return; }

    const btn = document.getElementById('setDateBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Starting...'; }

    try {
      this.weddingDate = new Date(dateInput.value + 'T00:00:00');
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (this.weddingDate <= now) throw new Error('Please select a future date');
      localStorage.setItem('wedease_wedding_date', this.weddingDate.toISOString());
      this.startCountdown();
    } catch (error) {
      this.showError('Failed to set wedding date: ' + error.message);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Start Countdown'; }
    }
  }

  clearWeddingDate() {
    localStorage.removeItem('wedease_wedding_date');
    this.weddingDate = null;
    if (this.countdownInterval) { clearInterval(this.countdownInterval); this.countdownInterval = null; }

    const els = {
      dateInput: document.getElementById('weddingDateInput'),
      countdownDisplay: document.getElementById('countdownDisplay'),
      weddingDateDisplay: document.getElementById('weddingDateDisplay'),
      setDateBtn: document.getElementById('setDateBtn'),
      clearDateBtn: document.getElementById('clearDateBtn'),
      exploreBtn: document.getElementById('exploreMoreBtn'),
    };

    if (els.dateInput) els.dateInput.value = '';
    if (els.countdownDisplay) els.countdownDisplay.style.display = 'none';
    if (els.weddingDateDisplay) els.weddingDateDisplay.style.display = 'none';
    if (els.setDateBtn) els.setDateBtn.style.display = 'block';
    if (els.clearDateBtn) els.clearDateBtn.style.display = 'none';
    if (els.exploreBtn) els.exploreBtn.style.display = 'none';
  }

  startCountdown() {
    if (!this.weddingDate) return;

    const show = (id, display) => { const el = document.getElementById(id); if (el) el.style.display = display; };
    show('countdownDisplay', 'block');
    show('weddingDateDisplay', 'block');
    show('setDateBtn', 'none');
    show('clearDateBtn', 'inline-block');
    show('exploreMoreBtn', 'block');

    this.updateWeddingDateDisplay();
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  updateWeddingDateDisplay() {
    const el = document.getElementById('weddingDateText');
    if (!el || !this.weddingDate) return;
    el.textContent = this.weddingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  updateCountdown() {
    if (!this.weddingDate) return;
    const distance = this.weddingDate.getTime() - new Date().getTime();
    if (distance < 0) { this.handleWeddingPassed(); return; }

    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('days', days);
    set('hours', String(hours).padStart(2, '0'));
    set('minutes', String(minutes).padStart(2, '0'));
    set('seconds', String(seconds).padStart(2, '0'));

    const msgEl = document.getElementById('countdownMessage');
    if (msgEl) {
      if (days === 0) msgEl.textContent = " It's your wedding day! Congratulations!";
      else if (days === 1) msgEl.textContent = " Just one more day until your special day! ";
      else if (days < 7) msgEl.textContent = " Less than a week to go! So exciting! ";
      else if (days < 30) msgEl.textContent = " The big day is getting closer! ";
      else if (days < 90) msgEl.textContent = " Your wedding is just around the corner! ";
      else msgEl.textContent = " Counting down to your beautiful wedding day! ";
    }
  }

  handleWeddingPassed() {
    clearInterval(this.countdownInterval);
    const display = document.getElementById('countdownDisplay');
    if (display) {
      display.innerHTML = `
        <div class="countdown-completed">
          <div class="countdown-message">
             Congratulations on your wedding! <br>
            Wishing you a lifetime of happiness and love! 
          </div>
          <button class="explore-more-btn" onclick="window.location.href='src/pages/about.html'">Explore More</button>
        </div>`;
    }
  }

  showError(message) {
    const existing = document.querySelector('.countdown-error');
    if (existing) existing.remove();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'countdown-error';
    errorDiv.textContent = message;
    const inputSection = document.querySelector('.countdown-input-section');
    if (inputSection) inputSection.appendChild(errorDiv);
    setTimeout(() => { if (errorDiv.parentNode) errorDiv.parentNode.removeChild(errorDiv); }, 5000);
  }
}


// ===============================================
// AUTHENTICATION SYSTEM
// ===============================================

class AuthManager {
  constructor() { this.init(); }

  init() {
    this.bindAuthEvents();
    this.checkCurrentUser();
  }

  encode(str) { return new TextEncoder().encode(str); }

  async hashPassword(password) {
    const buf = await crypto.subtle.digest("SHA-256", this.encode(password));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  getUsers() { return JSON.parse(localStorage.getItem("wedease_users") || "{}"); }
  setUsers(obj) { localStorage.setItem("wedease_users", JSON.stringify(obj)); }

  setCurrentUser(email) { 
    sessionStorage.setItem("wedease_current", email); 
    this.updateHeaderUser(email); 
  }
  clearCurrentUser() { 
    localStorage.removeItem('wedease_token');
    localStorage.removeItem('wedease_current');
    sessionStorage.removeItem("wedease_current");
    this.updateHeaderUser(null); 
  }

  updateHeaderUser(email) {
    const headerRight = document.querySelector(".header-right");
    if (!headerRight) return;

    const existing = document.getElementById("user-label");
    if (existing) existing.remove();

    const existingMobileUser = document.getElementById("mobile-user-label");
    if (existingMobileUser) existingMobileUser.remove();

    const loginBtn = headerRight.querySelector(".login-btn");
    if (!email) {
      if (loginBtn) loginBtn.style.display = "flex";
      return;
    }

    if (loginBtn) loginBtn.style.display = "none";

    const btn = document.createElement("button");
    btn.id = "user-label";
    btn.className = "login-btn";
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      ${email.split("@")[0]}
    `;
    btn.addEventListener("click", () => {
      if (confirm("Sign out?")) {
        this.clearCurrentUser();
        const isSubpage = window.location.pathname.includes('/src/pages/');
        const loginPath = isSubpage ? "login.html" : "src/pages/login.html";
        window.location.href = loginPath;
      }
    });
    headerRight.appendChild(btn);

    // Add user button to mobile nav
    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav) {
      const mobileBtn = document.createElement("button");
      mobileBtn.id = "mobile-user-label";
      mobileBtn.className = "mobile-user-btn";
      mobileBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        ${email.split("@")[0]}
      `;
      mobileBtn.addEventListener("click", () => {
        if (confirm("Sign out?")) {
          this.clearCurrentUser();
          const isSubpage = window.location.pathname.includes('/src/pages/');
          const loginPath = isSubpage ? "login.html" : "src/pages/login.html";
          window.location.href = loginPath;
        }
      });
      // Insert at the top after the close button
      const closeBtn = mobileNav.querySelector(".mobile-close-btn");
      if (closeBtn) {
        closeBtn.insertAdjacentElement("afterend", mobileBtn);
      } else {
        mobileNav.insertBefore(mobileBtn, mobileNav.firstChild);
      }
    }
  }

  showStatus(msg, isError = false) {
    const el = document.getElementById("auth-status");
    if (!el) return;
    el.textContent = msg;
    el.className = isError ? "error" : "success";
  }

  bindAuthEvents() {
    const get = (id) => document.getElementById(id);

    get('show-signup')?.addEventListener("click", () => {
      get('signin-card').classList.add("hidden");
      get('signup-card').classList.remove("hidden");
    });
    get('show-signin')?.addEventListener("click", () => {
      get('signup-card').classList.add("hidden");
      get('signin-card').classList.remove("hidden");
    });
    get('signup-btn')?.addEventListener("click", async () => await this.handleSignup());
    get('signin-btn')?.addEventListener("click", async () => await this.handleSignin());
  }

  async handleSignup() {
    const name = document.getElementById("signup-name")?.value.trim() || "User";
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const pw = document.getElementById("signup-password").value;
    const pw2 = document.getElementById("signup-password2").value;

    if (!email.includes("@")) return this.showStatus("Invalid email", true);
    if (pw.length < 8) return this.showStatus("Password must be at least 8 characters", true);
    if (pw !== pw2) return this.showStatus("Passwords do not match", true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pw })
      });

      const data = await response.json();

      if (!response.ok) {
        return this.showStatus(data.message || "Signup failed", true);
      }

      // Store token and user info
      localStorage.setItem('wedease_token', data.token);
      localStorage.setItem('wedease_current', data.user.email);
      sessionStorage.setItem('wedease_current', data.user.email);

      this.showStatus("Account created successfully!");
      setTimeout(() => { window.location.href = "../../index.html"; }, 1500);
    } catch (error) {
      this.showStatus("Signup error: " + error.message, true);
    }
  }

  async handleSignin() {
    const email = document.getElementById("signin-email").value.trim().toLowerCase();
    const pw = document.getElementById("signin-password").value;

    if (!email) return this.showStatus("Email is required", true);
    if (!pw) return this.showStatus("Password is required", true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw })
      });

      const data = await response.json();

      if (!response.ok) {
        return this.showStatus(data.message || "Login failed", true);
      }

      // Store token and user info
      localStorage.setItem('wedease_token', data.token);
      localStorage.setItem('wedease_current', data.user.email);
      sessionStorage.setItem('wedease_current', data.user.email);

      this.showStatus("Login successful!");
      setTimeout(() => { window.location.href = "../../index.html"; }, 1500);
    } catch (error) {
      this.showStatus("Login error: " + error.message, true);
    }
  }

  checkCurrentUser() {
    const token = localStorage.getItem('wedease_token');
    const email = localStorage.getItem('wedease_current');
    
    if (token && email) {
      sessionStorage.setItem('wedease_current', email);
      this.updateHeaderUser(email);
    }
  }
}

// ===============================================
// MAIN ENTRY POINT — single, clean init
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("WedEASE Starting...");

  // Auth runs on every page
  window.authManager = new AuthManager();

  // Hero — only on pages that have the hero image
  if (document.getElementById('hero-image')) {
    window.heroManager = new HeroManager();
    window.heroManager.init();
  }

  // Countdown — only on pages that have the date input
  if (document.getElementById('weddingDateInput')) {
    window.countdownManager = new CountdownManager();
  }

  // Shared utilities
  WedEASEUtils.setupHeaderScroll();
  WedEASEUtils.setupHoverEffects();
  WedEASEUtils.updateActiveNavLink();

  // Generic CTA buttons
  document.querySelectorAll(".cta-button").forEach((btn) => {
    if (btn.getAttribute('href')) return;
    btn.addEventListener("click", () => { window.location.href = "src/pages/about.html"; });
  });
});

// Expose classes globally
window.WedEASEUtils = WedEASEUtils;
window.CountdownManager = CountdownManager;
window.AuthManager = AuthManager;
window.HeroManager = HeroManager;

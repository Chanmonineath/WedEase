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
// HERO IMAGE ROTATOR & CTA MANAGER - FIXED VERSION
// ===============================================

class HeroManager {
  constructor() {
    this.images = [
      "assets/img/bride and groom.png",
      "assets/img/wedding car.png", 
      "assets/img/ring hand.png"
    ];
    
    this.ctaIcons = [
      // Heart icon
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>`,
      
      // Car icon
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>`,
      
      // Ring icon  
      `<img src="assets/img/twin ring icon.png" alt="Wedding Rings" width="32" height="32" style="filter: brightness(0) invert(1);">`
    ];
    
    this.ctaTexts = [
      "Find Your Partner",
      "Plan Your Journey", 
      "Start Your Story"
    ];
    
    this.currentIndex = 0;
    this.init();
  }

  init() {
    console.log("Hero Manager: Checking for elements...");
    
    // Only initialize if we're on the home page
    const heroImage = document.getElementById('hero-image');
    const ctaButton = document.getElementById('hero-cta-button');
    
    if (!heroImage) {
      console.log("Hero Manager: hero-image element not found");
      return;
    }
    
    if (!ctaButton) {
      console.log("Hero Manager: hero-cta-button element not found");
      return;
    }
    
    console.log("Hero Manager: Elements found, initializing...");
    
    // Set initial content first
    this.updateHeroContent();
    
    // Set up auto rotation
    this.startAutoRotation();
    
    // Set up click handler
    heroImage.addEventListener('click', () => {
      console.log("Hero image clicked, switching to next image");
      this.nextImage();
    });
    
    console.log("Hero Manager fully initialized");
  }

  startAutoRotation() {
    // Clear any existing interval
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
    
    // Start new interval - rotate every 2 seconds (was 5 seconds)
    this.rotationInterval = setInterval(() => {
      console.log("Auto-rotating to next image");
      this.nextImage();
    }, 3000); 
    
    console.log("Auto-rotation started (2 second intervals)");
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    console.log("Switching to image index:", this.currentIndex, " - ", this.images[this.currentIndex]);
    this.updateHeroContent();
  }

  updateHeroContent() {
    const heroImage = document.getElementById('hero-image');
    const ctaButton = document.getElementById('hero-cta-button');
    
    if (!heroImage || !ctaButton) {
      console.log("Hero Manager: Elements missing in updateHeroContent");
      return;
    }

    console.log("Updating hero content to:", this.images[this.currentIndex]);

    // Update image with fade effect
    heroImage.style.transition = 'opacity 0.5s ease-in-out';
    heroImage.style.opacity = '0.3';
    
    setTimeout(() => {
      heroImage.src = this.images[this.currentIndex];
      heroImage.alt = this.getAltText();
      heroImage.style.opacity = '1';
      console.log("Image updated to:", this.images[this.currentIndex]);
    }, 300);

    // Update CTA button
    ctaButton.innerHTML = `
      ${this.ctaIcons[this.currentIndex]}
      <span style="color: white;">${this.ctaTexts[this.currentIndex]}</span>
    `;
    console.log("CTA button updated");
  }

  getAltText() {
    const altTexts = ["Bride and Groom", "Wedding Car", "Ring Hand"];
    return altTexts[this.currentIndex];
  }

  // Method to manually set specific image
  setHeroContent(index) {
    if (index >= 0 && index < this.images.length) {
      this.currentIndex = index;
      this.updateHeroContent();
    }
  }
}

// ===============================================
// AUTHENTICATION SYSTEM
// ===============================================

class AuthManager {
  constructor() {
    this.init();
  }

  init() {
    if (!document.getElementById('auth-status')) return;
    this.bindAuthEvents();
    this.checkCurrentUser();
  }

  encode(str) {
    return new TextEncoder().encode(str);
  }

  async hashPassword(password) {
    const buf = await crypto.subtle.digest("SHA-256", this.encode(password));
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  getUsers() {
    return JSON.parse(localStorage.getItem("wedease_users") || "{}");
  }

  setUsers(obj) {
    localStorage.setItem("wedease_users", JSON.stringify(obj));
  }

  setCurrentUser(email) {
    localStorage.setItem("wedease_current", email);
    this.updateHeaderUser(email);
  }

  clearCurrentUser() {
    localStorage.removeItem("wedease_current");
    this.updateHeaderUser(null);
  }

  updateHeaderUser(email) {
    const headerRight = document.querySelector(".header-right");
    if (!headerRight) return;

    const existing = document.getElementById("user-label");
    if (existing) existing.remove();

    if (email) {
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
          window.location.reload();
        }
      });
      headerRight.appendChild(btn);
    }
  }

  showStatus(msg, isError = false) {
    const el = document.getElementById("auth-status");
    if (!el) return;
    el.textContent = msg;
    el.className = isError ? 'error' : 'success';
  }

  bindAuthEvents() {
    const signinBtn = document.getElementById("signin-btn");
    const signupBtn = document.getElementById("signup-btn");
    const showSignup = document.getElementById("show-signup");
    const showSignin = document.getElementById("show-signin");

    if (showSignup) {
      showSignup.addEventListener("click", () => {
        document.getElementById("signin-card").classList.add("hidden");
        document.getElementById("signup-card").classList.remove("hidden");
      });
    }

    if (showSignin) {
      showSignin.addEventListener("click", () => {
        document.getElementById("signup-card").classList.add("hidden");
        document.getElementById("signin-card").classList.remove("hidden");
      });
    }

    if (signupBtn) {
      signupBtn.addEventListener("click", async () => {
        await this.handleSignup();
      });
    }

    if (signinBtn) {
      signinBtn.addEventListener("click", async () => {
        await this.handleSignin();
      });
    }
  }

  async handleSignup() {
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const pw = document.getElementById("signup-password").value;
    const pw2 = document.getElementById("signup-password2").value;

    if (!email.includes("@")) {
      this.showStatus("Invalid email", true);
      return;
    }
    if (pw.length < 8) {
      this.showStatus("Password must be at least 8 characters", true);
      return;
    }
    if (pw !== pw2) {
      this.showStatus("Passwords do not match", true);
      return;
    }

    const users = this.getUsers();
    if (users[email]) {
      this.showStatus("Account already exists", true);
      return;
    }

    users[email] = { hash: await this.hashPassword(pw), created: Date.now() };
    this.setUsers(users);
    this.setCurrentUser(email);
    this.showStatus("Account created successfully!");

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  }

  async handleSignin() {
    const email = document.getElementById("signin-email").value.trim().toLowerCase();
    const pw = document.getElementById("signin-password").value;

    const users = this.getUsers();
    if (!users[email]) {
      this.showStatus("Account not found", true);
      return;
    }

    const hashed = await this.hashPassword(pw);
    if (hashed !== users[email].hash) {
      this.showStatus("Incorrect password", true);
      return;
    }

    this.setCurrentUser(email);
    this.showStatus("Login successful!");

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  }

  checkCurrentUser() {
    const current = localStorage.getItem("wedease_current");
    if (current) this.updateHeaderUser(current);
  }
}

// ===============================================
// THEME PAGE FUNCTIONALITY
// ===============================================

class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    if (!document.querySelector('.theme-grid')) return;
    this.bindThemeEvents();
  }

  bindThemeEvents() {
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
      card.addEventListener('click', () => {
        // Remove selected class from all cards
        themeCards.forEach(c => c.classList.remove('selected'));
        // Add selected class to clicked card
        card.classList.add('selected');
        
        const themeName = card.querySelector('h3').textContent;
        localStorage.setItem('wedease_selected_theme', themeName);
        
        // Show confirmation
        alert(`"${themeName}" theme selected!`);
      });
    });

    // Check for previously selected theme
    const savedTheme = localStorage.getItem('wedease_selected_theme');
    if (savedTheme) {
      themeCards.forEach(card => {
        if (card.querySelector('h3').textContent === savedTheme) {
          card.classList.add('selected');
        }
      });
    }
  }
}

// ===============================================
// MAIN APP INITIALIZATION
// ===============================================

class WedEASEApp {
  constructor() {
    this.init();
  }

  init() {
    console.log("WedEASE App initialized");
    
    // Initialize all managers
    this.utils = WedEASEUtils;
    this.budgetManager = new BudgetManager();
    this.authManager = new AuthManager();
    this.themeManager = new ThemeManager();

    // Setup global functionality
    this.utils.setupHeaderScroll();
    this.utils.setupHoverEffects();
    this.utils.updateActiveNavLink();

    // Additional interactive elements
    this.setupInteractiveElements();
  }

  setupInteractiveElements() {
    // CTA buttons navigation
    const ctaButtons = document.querySelectorAll(".cta-button");
    ctaButtons.forEach((btn) => {
      if (btn.getAttribute('href')) return; // Skip if already has href
      btn.addEventListener("click", () => {
        window.location.href = "src/pages/about.html";
      });
    });

    // Category card interactions
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        const categoryName = card.querySelector('span').textContent;
        alert(`Opening ${categoryName} budget category`);
      });
    });
  }
}

// ===============================================
// GLOBAL INSTANCES (for inline event handlers)
// ===============================================

let budgetManager;
let heroManager; // ← ADD THIS LINE

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  budgetManager = new BudgetManager();
  heroManager = new HeroManager(); // ← ADD THIS LINE - THIS IS CRITICAL!
  new WedEASEApp();
});

// Make utils available globally
window.WedEASEUtils = WedEASEUtils;
window.heroManager = heroManager; // ← ADD THIS LINE





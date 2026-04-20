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
      { passive: true },
    );
  }

  static setupHoverEffects() {
    const interactiveElements = document.querySelectorAll(
      ".feature-card, .category-card, .theme-card, .feature-box",
    );
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", function () {
        this.style.transition = "all 0.3s ease";
      });
    });
  }

  static updateActiveNavLink() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      const linkHref = link.getAttribute("href");
      if (
        linkHref === currentPage ||
        (currentPage === "index.html" && linkHref === "../index.html") ||
        (linkHref && linkHref.includes(currentPage.replace(".html", "")))
      ) {
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
      "assets/img/ring hand.png",
    ];

    this.ctaIcons = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>`,
      `<img src="assets/img/twin ring icon.png" alt="Wedding Rings" width="32" height="32" style="filter: brightness(0) invert(1);">`,
    ];

    this.ctaTexts = [
      "Schedule Your Day",
      "Plan Your Journey",
      "Start Your Story",
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

    const heroImage = document.getElementById("hero-image");
    const ctaButton = document.getElementById("hero-cta-button");

    if (!heroImage || !ctaButton) {
      console.log("Hero Manager: required elements not found");
      return;
    }

    heroImage.src = this.images[this.currentIndex];
    heroImage.alt = this.getAltText();
    this.updateCtaContent();
    this.startAutoRotation();

    heroImage.addEventListener("click", () => this.nextImage());

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
    const heroImage = document.getElementById("hero-image");
    const ctaButton = document.getElementById("hero-cta-button");
    if (!heroImage || !ctaButton) return;

    heroImage.style.transition = "opacity 0.3s ease-in-out";
    heroImage.style.opacity = "0.1";

    setTimeout(() => {
      heroImage.src = this.images[this.currentIndex];
      heroImage.alt = this.getAltText();
      heroImage.style.opacity = "1";
    }, 300);

    this.updateCtaContent();
  }

  updateCtaContent() {
    const ctaButton = document.getElementById("hero-cta-button");
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
// WEDDING COUNTDOWN MANAGER
// ===============================================

class CountdownManager {
  constructor() {
    this.weddingDate = null;
    this.countdownInterval = null;
    this.init();
  }

  init() {
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("weddingDateInput");
    if (dateInput) dateInput.min = today;

    const setDateBtn = document.getElementById("setDateBtn");
    const clearDateBtn = document.getElementById("clearDateBtn");
    const exploreBtn = document.getElementById("exploreMoreBtn");

    if (setDateBtn)
      setDateBtn.addEventListener("click", () => this.setWeddingDate());
    if (clearDateBtn)
      clearDateBtn.addEventListener("click", () => this.clearWeddingDate());
    if (exploreBtn)
      exploreBtn.addEventListener("click", () => {
        window.location.href = "src/pages/about.html";
      });
    if (dateInput)
      dateInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.setWeddingDate();
      });

    this.loadSavedData();
  }

  loadSavedData() {
    const savedDate = localStorage.getItem("wedease_wedding_date");
    if (savedDate) {
      this.weddingDate = new Date(savedDate);
      const dateInput = document.getElementById("weddingDateInput");
      if (dateInput) dateInput.value = savedDate.split("T")[0];
      this.startCountdown();
    }
  }

  setWeddingDate() {
    const dateInput = document.getElementById("weddingDateInput");
    if (!dateInput || !dateInput.value) {
      this.showError("Please select your wedding date");
      return;
    }

    const btn = document.getElementById("setDateBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Starting...";
    }

    try {
      this.weddingDate = new Date(dateInput.value + "T00:00:00");
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (this.weddingDate <= now)
        throw new Error("Please select a future date");
      localStorage.setItem(
        "wedease_wedding_date",
        this.weddingDate.toISOString(),
      );
      this.startCountdown();
    } catch (error) {
      this.showError("Failed to set wedding date: " + error.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Start Countdown";
      }
    }
  }

  clearWeddingDate() {
    localStorage.removeItem("wedease_wedding_date");
    this.weddingDate = null;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    const els = {
      dateInput: document.getElementById("weddingDateInput"),
      countdownDisplay: document.getElementById("countdownDisplay"),
      weddingDateDisplay: document.getElementById("weddingDateDisplay"),
      setDateBtn: document.getElementById("setDateBtn"),
      clearDateBtn: document.getElementById("clearDateBtn"),
      exploreBtn: document.getElementById("exploreMoreBtn"),
    };

    if (els.dateInput) els.dateInput.value = "";
    if (els.countdownDisplay) els.countdownDisplay.style.display = "none";
    if (els.weddingDateDisplay) els.weddingDateDisplay.style.display = "none";
    if (els.setDateBtn) els.setDateBtn.style.display = "block";
    if (els.clearDateBtn) els.clearDateBtn.style.display = "none";
    if (els.exploreBtn) els.exploreBtn.style.display = "none";
  }

  startCountdown() {
    if (!this.weddingDate) return;

    const show = (id, display) => {
      const el = document.getElementById(id);
      if (el) el.style.display = display;
    };
    show("countdownDisplay", "block");
    show("weddingDateDisplay", "block");
    show("setDateBtn", "none");
    show("clearDateBtn", "inline-block");
    show("exploreMoreBtn", "block");

    this.updateWeddingDateDisplay();
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  updateWeddingDateDisplay() {
    const el = document.getElementById("weddingDateText");
    if (!el || !this.weddingDate) return;
    el.textContent = this.weddingDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  updateCountdown() {
    if (!this.weddingDate) return;
    const distance = this.weddingDate.getTime() - new Date().getTime();
    if (distance < 0) {
      this.handleWeddingPassed();
      return;
    }

    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("days", days);
    set("hours", String(hours).padStart(2, "0"));
    set("minutes", String(minutes).padStart(2, "0"));
    set("seconds", String(seconds).padStart(2, "0"));

    const msgEl = document.getElementById("countdownMessage");
    if (msgEl) {
      if (days === 0)
        msgEl.textContent = " It's your wedding day! Congratulations!";
      else if (days === 1)
        msgEl.textContent = " Just one more day until your special day! ";
      else if (days < 7)
        msgEl.textContent = " Less than a week to go! So exciting! ";
      else if (days < 30)
        msgEl.textContent = " The big day is getting closer! ";
      else if (days < 90)
        msgEl.textContent = " Your wedding is just around the corner! ";
      else msgEl.textContent = " Counting down to your beautiful wedding day! ";
    }
  }

  handleWeddingPassed() {
    clearInterval(this.countdownInterval);
    const display = document.getElementById("countdownDisplay");
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
    const existing = document.querySelector(".countdown-error");
    if (existing) existing.remove();
    const errorDiv = document.createElement("div");
    errorDiv.className = "countdown-error";
    errorDiv.textContent = message;
    const inputSection = document.querySelector(".countdown-input-section");
    if (inputSection) inputSection.appendChild(errorDiv);
    setTimeout(() => {
      if (errorDiv.parentNode) errorDiv.parentNode.removeChild(errorDiv);
    }, 5000);
  }
}

// ===============================================
// AUTHENTICATION SYSTEM WITH DATABASE
// ===============================================

class AuthManager {
  constructor() {
    this.API_BASE = "http://127.0.0.1:5000";
    this._authToken = null;
    this._currentUser = null;
    this.storage = null;
    this.handleDocumentClick = this.handleDocumentClick.bind(this);

    this.init();
  }

  init() {
    this.bindAuthEvents();
    this.restoreSession();
  }

  getStoredValue(key) {
    try {
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  getLoginPath() {
    return window.location.pathname.includes("/src/pages/")
      ? "login.html"
      : "src/pages/login.html";
  }

  getHomePath() {
    return window.location.pathname.includes("/src/pages/")
      ? "../../index.html"
      : "index.html";
  }

  getSettingsPath() {
    return window.location.pathname.includes("/src/pages/")
      ? "user-settings.html"
      : "src/pages/user-settings.html";
  }

  getAuthToken() {
    return this._authToken || null;
  }

  setAuthToken(token, remember = false) {
    this._authToken = token || null;
    this.storage = remember ? localStorage : sessionStorage;
    this.persistSession();
  }

  clearAuthToken() {
    this._authToken = null;
    this.persistSession();
  }

  setCurrentUser(user, remember = false) {
    const userData = {
      id: user._id || user.id,
      name:
        user.username ||
        user.name ||
        (user.email ? user.email.split("@")[0] : ""),
      email: user.email,
      role: user.role || "user",
      avatarUrl: user.avatarUrl || null,
    };
    this._currentUser = userData;
    this.storage = remember ? localStorage : this.storage || sessionStorage;
    this.persistSession();
    this.updateHeaderUser(userData);
  }

  getCurrentUser() {
    return this._currentUser || null;
  }

  clearCurrentUser() {
    this._currentUser = null;
    this.clearAuthToken();
    this.storage = null;
    this.clearPersistedSession();
    this.updateHeaderUser(null);
  }

  persistSession() {
    [localStorage, sessionStorage].forEach((store) => {
      try {
        if (store === this.storage && this._authToken && this._currentUser) {
          store.setItem("wedease_auth_token", this._authToken);
          store.setItem(
            "wedease_current_user",
            JSON.stringify(this._currentUser),
          );
        } else {
          store.removeItem("wedease_auth_token");
          store.removeItem("wedease_current_user");
        }
      } catch (error) {}
    });
  }

  clearPersistedSession() {
    [localStorage, sessionStorage].forEach((store) => {
      try {
        store.removeItem("wedease_auth_token");
        store.removeItem("wedease_current_user");
      } catch (error) {}
    });
  }

  async restoreSession() {
    const savedToken = this.getStoredValue("wedease_auth_token");
    const savedUser = this.getStoredValue("wedease_current_user");

    if (savedToken) {
      this._authToken = savedToken;
      this.storage = localStorage.getItem("wedease_auth_token")
        ? localStorage
        : sessionStorage;
    }

    if (savedUser) {
      try {
        this._currentUser = JSON.parse(savedUser);
      } catch (error) {
        this._currentUser = null;
      }
    }

    this.updateHeaderUser(this._currentUser);
    await this.fetchCurrentUser();
  }

  async fetchCurrentUser() {
    const headers = {};
    if (this._authToken) {
      headers.Authorization = `Bearer ${this._authToken}`;
    }

    try {
      const response = await fetch(`${this.API_BASE}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearCurrentUser();
        }
        return null;
      }

      const data = await response.json();
      if (data?.user) {
        this.setCurrentUser(data.user, this.storage === localStorage);
      }
      return data?.user || null;
    } catch (error) {
      console.warn("Could not restore user session", error);
      return null;
    }
  }

  createAvatarMarkup(user) {
    return `
      <span class="account-avatar-fallback" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </span>
    `;
  }

  updateHeaderUser(user) {
    const headerRight = document.querySelector(".header-right");
    if (!headerRight) return;

    const existing = document.getElementById("user-label");
    if (existing) existing.remove();

    const loginBtn = headerRight.querySelector(".login-btn");
    if (!user) {
      if (loginBtn) loginBtn.style.display = "flex";
      return;
    }

    if (loginBtn) loginBtn.style.display = "none";
    // create wrapper
    const wrapper = document.createElement("div");
    wrapper.id = "user-label";
    wrapper.style.position = "relative";

    // profile pill
    const pill = document.createElement("button");
    pill.className = "profile-pill";
    pill.type = "button";

    // avatar: use avatarUrl or initials
    const avatarEl = document.createElement("div");
    avatarEl.style.width = "36px";
    avatarEl.style.height = "36px";
    avatarEl.style.borderRadius = "999px";
    avatarEl.style.display = "flex";
    avatarEl.style.alignItems = "center";
    avatarEl.style.justifyContent = "center";
    avatarEl.style.marginLeft = "8px";
    avatarEl.style.background = "#f3eaf0";
    avatarEl.style.border = "1px solid #f3e4ec";

    if (user.avatarUrl) {
      const img = document.createElement("img");
      img.src = user.avatarUrl;
      img.alt = user.name || user.email || "avatar";
      img.style.width = "32px";
      img.style.height = "32px";
      img.style.borderRadius = "999px";
      img.style.objectFit = "cover";
      avatarEl.appendChild(img);
    } else {
      const initials = (user.name || user.email || "U")
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      const txt = document.createElement("span");
      txt.textContent = initials;
      txt.style.color = "var(--primary-purple)";
      txt.style.fontWeight = "700";
      avatarEl.appendChild(txt);
    }

    const nameSpan = document.createElement("span");
    nameSpan.className = "text-sm user-name";
    nameSpan.textContent =
      user.name || (user.email || "").split("@")[0] || "User";

    pill.appendChild(nameSpan);
    pill.appendChild(avatarEl);

    // dropdown menu
    const menu = document.createElement("div");
    menu.className = "dropdown-menu";
    menu.style.right = "0";
    menu.style.top = "calc(100% + 8px)";
    menu.style.display = "none";
    menu.style.position = "absolute";
    menu.style.minWidth = "200px";
    menu.style.background = "#fff";
    menu.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
    menu.style.borderRadius = "8px";
    menu.style.overflow = "hidden";
    menu.innerHTML = `
      <div style="padding:10px 12px">
        <p style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin:0">Account</p>
        <p style="font-size:13px;margin:6px 0 0;color:#444;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:220px">${user.email || "—"}</p>
      </div>
      <div style="height:1px;background:#f3f4f6;margin:8px 0"></div>
      <button id="menuSettings" class="menu-item" style="border:none;background:none;width:100%;text-align:left">Settings</button>
      <button id="menuLogout" class="menu-item" style="border:none;background:none;width:100%;text-align:left;color:#ef4444">Logout</button>
    `;

    // toggle
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      if (menu.style.display === "none") menu.style.display = "block";
      else menu.style.display = "none";
    });
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !pill.contains(e.target))
        menu.style.display = "none";
    });
    menu.querySelector("#menuSettings").addEventListener("click", () => {
      menu.classList.remove("active");
      window.location.href = "src/pages/user-settings.html";
    });
    menu.querySelector("#menuLogout").addEventListener("click", async () => {
      menu.classList.remove("active");
      await this.logout();
    });

    wrapper.appendChild(pill);
    wrapper.appendChild(menu);
    headerRight.appendChild(wrapper);
  }

  async logout() {
    const token = this.getAuthToken();
    if (token) {
      try {
        await fetch(`${this.API_BASE}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    this.clearCurrentUser();
    // Fix: Use correct path based on current location
    const currentPath = window.location.pathname;
    if (currentPath.includes("/src/pages/")) {
      window.location.href = "login.html";
    } else {
      window.location.href = "src/pages/login.html";
    }
  }

  showStatus(msg, isError = false) {
    const el = document.getElementById("auth-status");
    if (!el) return;
    el.textContent = msg;
    el.className = isError ? "error" : "success";
    if (!isError) {
      setTimeout(() => {
        if (el.className === "success") {
          el.textContent = "";
          el.className = "";
        }
      }, 3000);
    }
  }

  bindAuthEvents() {
    const get = (id) => document.getElementById(id);

    document.querySelectorAll(".auth-eye-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);
        if (!input) return;
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        button.textContent = isPassword ? "Hide" : "Show";
      });
    });

    get("show-signup")?.addEventListener("click", () => {
      get("signin-card").classList.add("hidden");
      get("signup-card").classList.remove("hidden");
    });
    get("show-signin")?.addEventListener("click", () => {
      get("signup-card").classList.add("hidden");
      get("signin-card").classList.remove("hidden");
    });
    get("signup-btn")?.addEventListener(
      "click",
      async () => await this.handleSignup(),
    );
    get("signin-btn")?.addEventListener(
      "click",
      async () => await this.handleSignin(),
    );
  }

  async handleSignup() {
    const username = document.getElementById("signup-username").value.trim();
    const email = document
      .getElementById("signup-email")
      .value.trim()
      .toLowerCase();
    const pw = document.getElementById("signup-password").value;
    const pw2 = document.getElementById("signup-password2").value;
    const rememberCheckbox = document.getElementById("signup-remember");
    const remember = rememberCheckbox ? rememberCheckbox.checked : false;

    if (!email.includes("@")) {
      this.showStatus("Invalid email", true);
      return;
    }
    if (!username || username.length < 3) {
      this.showStatus("Username must be at least 3 characters", true);
      return;
    }
    const strongPw = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/;
    if (!strongPw.test(pw)) {
      this.showStatus(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol",
        true,
      );
      return;
    }
    if (pw !== pw2) {
      this.showStatus("Passwords do not match", true);
      return;
    }
    try {
      // send username to backend (backend expects `username`)
      const registerResp = await fetch(`${this.API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password: pw }),
      });

      if (registerResp.status === 201) {
        // registration succeeded; perform login to obtain token + user
        const loginResp = await fetch(`${this.API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pw }),
        });

        if (!loginResp.ok) {
          const err = await loginResp.json().catch(() => ({}));
          this.showStatus(err.message || "Login after register failed", true);
          return;
        }

        const data = await loginResp.json();
        if (data.token) this.setAuthToken(data.token, remember);
        if (data.user) this.setCurrentUser(data.user, remember);

        this.showStatus("Account created and logged in!");
        setTimeout(() => {
          window.location.href = "../../index.html";
        }, 1200);
      } else {
        const err = await registerResp.json().catch(() => ({}));
        this.showStatus(err.message || "Signup failed", true);
      }
    } catch (error) {
      console.error("Signup error:", error);
      this.showStatus(
        "Connection error. Make sure backend is running on port 5000.",
        true,
      );
    }
  }

  async handleSignin() {
    const email = document
      .getElementById("signin-email")
      .value.trim()
      .toLowerCase();
    const pw = document.getElementById("signin-password").value;
    const rememberCheckbox = document.getElementById("signin-remember");
    const remember = rememberCheckbox ? rememberCheckbox.checked : false;

    if (!email || !pw) {
      this.showStatus("Please enter email and password", true);
      return;
    }

    try {
      const response = await fetch(`${this.API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        this.showStatus(err.message || "Login failed", true);
        return;
      }

      const data = await response.json();
      if (data.token) this.setAuthToken(data.token, remember);
      if (data.user) this.setCurrentUser(data.user, remember);

      this.showStatus("Login successful!");
      setTimeout(() => {
        window.location.href = "../../index.html";
      }, 1200);
    } catch (error) {
      console.error("Login error:", error);
      this.showStatus(
        "Connection error. Make sure backend is running on port 5000.",
        true,
      );
    }
  }

  checkCurrentUser() {
    const user = this.getCurrentUser();
    if (user) {
      this.updateHeaderUser(user);
    }
  }
}

AuthManager.prototype.updateHeaderUser = function (user) {
  const headerRight = document.querySelector(".header-right");
  if (!headerRight) return;

  const existing = document.getElementById("accountMenu");
  if (existing) existing.remove();

  const loginBtn = headerRight.querySelector(".login-btn");
  const mobileNav = document.getElementById("mobileNav");
  const mobileLoginLink = mobileNav?.querySelector(".mobile-login-link");
  const existingMobileAccount = mobileNav?.querySelector(
    ".mobile-account-section",
  );

  if (!user) {
    if (loginBtn) loginBtn.style.display = "flex";
    if (mobileLoginLink) mobileLoginLink.style.display = "";
    if (existingMobileAccount) existingMobileAccount.remove();
    return;
  }

  if (loginBtn) loginBtn.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.id = "accountMenu";
  wrapper.className = "account-menu";
  wrapper.innerHTML = `
    <button class="account-trigger" type="button" aria-haspopup="menu" aria-expanded="false">
      <span class="account-name">${user.name || "User"}</span>
      <span class="account-avatar">${this.createAvatarMarkup(user)}</span>
    </button>
    <div class="account-dropdown" role="menu" aria-label="Account menu">
      <div class="account-dropdown-card">
        <div class="account-dropdown-copy">
          <p class="account-dropdown-eyebrow">Account</p>
          <p class="account-dropdown-name">${user.name || "User"}</p>
          <p class="account-dropdown-email">${user.email || "No email"}</p>
        </div>
        <div class="account-dropdown-actions">
          <button type="button" class="account-menu-item" data-action="settings">Settings</button>
          <button type="button" class="account-menu-item account-menu-item-danger" data-action="logout">Log out</button>
        </div>
      </div>
    </div>
  `;

  const trigger = wrapper.querySelector(".account-trigger");
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const nextState = !wrapper.classList.contains("is-open");
    document.querySelectorAll(".account-menu.is-open").forEach((menu) => {
      menu.classList.remove("is-open");
      menu
        .querySelector(".account-trigger")
        ?.setAttribute("aria-expanded", "false");
    });
    wrapper.classList.toggle("is-open", nextState);
    trigger.setAttribute("aria-expanded", String(nextState));
  });

  wrapper
    .querySelector('[data-action="settings"]')
    .addEventListener("click", () => {
      window.location.href = this.getSettingsPath();
    });
  wrapper
    .querySelector('[data-action="logout"]')
    .addEventListener("click", async () => {
      await this.logout();
    });

  const mobileMenuBtn = headerRight.querySelector(".mobile-menu-btn");
  if (mobileMenuBtn) {
    headerRight.insertBefore(wrapper, mobileMenuBtn);
  } else {
    headerRight.appendChild(wrapper);
  }

  document.removeEventListener("click", this.handleDocumentClick);
  document.addEventListener("click", this.handleDocumentClick);

  if (mobileLoginLink) {
    mobileLoginLink.style.display = "none";
  }
  if (existingMobileAccount) {
    existingMobileAccount.remove();
  }
  if (mobileNav) {
    const mobileAccount = document.createElement("div");
    mobileAccount.className = "mobile-account-section";
    mobileAccount.innerHTML = `
      <div class="mobile-account-summary">
        <span class="account-avatar mobile-account-avatar">${this.createAvatarMarkup(user)}</span>
        <div class="mobile-account-copy">
          <span class="mobile-account-name">${user.name || "User"}</span>
          <span class="mobile-account-email">${user.email || "No email"}</span>
        </div>
      </div>
      <button type="button" class="mobile-account-action" data-action="settings">Settings</button>
      <button type="button" class="mobile-account-action mobile-account-logout" data-action="logout">Log out</button>
    `;
    mobileNav.appendChild(mobileAccount);
    mobileAccount
      .querySelector('[data-action="settings"]')
      .addEventListener("click", () => {
        window.location.href = this.getSettingsPath();
      });
    mobileAccount
      .querySelector('[data-action="logout"]')
      .addEventListener("click", async () => {
        await this.logout();
      });
  }
};

AuthManager.prototype.handleDocumentClick = function (event) {
  document.querySelectorAll(".account-menu.is-open").forEach((menu) => {
    if (!menu.contains(event.target)) {
      menu.classList.remove("is-open");
      menu
        .querySelector(".account-trigger")
        ?.setAttribute("aria-expanded", "false");
    }
  });
};

AuthManager.prototype.logout = async function () {
  const token = this.getAuthToken();

  try {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    await fetch(`${this.API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers,
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  this.clearCurrentUser();
  window.location.href = this.getLoginPath();
};

AuthManager.prototype.handleSignup = async function () {
  const username = document.getElementById("signup-username").value.trim();
  const email = document
    .getElementById("signup-email")
    .value.trim()
    .toLowerCase();
  const pw = document.getElementById("signup-password").value;
  const pw2 = document.getElementById("signup-password2").value;
  const rememberCheckbox = document.getElementById("signup-remember");
  const remember = rememberCheckbox ? rememberCheckbox.checked : false;

  if (!email.includes("@")) {
    this.showStatus("Invalid email", true);
    return;
  }
  if (!username || username.length < 3) {
    this.showStatus("Username must be at least 3 characters", true);
    return;
  }
  const strongPw = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/;
  if (!strongPw.test(pw)) {
    this.showStatus(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol",
      true,
    );
    return;
  }
  if (pw !== pw2) {
    this.showStatus("Passwords do not match", true);
    return;
  }

  try {
    const registerResp = await fetch(`${this.API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email, password: pw }),
    });

    if (registerResp.status !== 201) {
      const err = await registerResp.json().catch(() => ({}));
      this.showStatus(err.message || "Signup failed", true);
      return;
    }

    const loginResp = await fetch(`${this.API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password: pw }),
    });

    if (!loginResp.ok) {
      const err = await loginResp.json().catch(() => ({}));
      this.showStatus(err.message || "Login after register failed", true);
      return;
    }

    const data = await loginResp.json();
    if (data.token) this.setAuthToken(data.token, remember);
    if (data.user) this.setCurrentUser(data.user, remember);

    this.showStatus("Account created and logged in!");
    setTimeout(() => {
      window.location.href = this.getHomePath();
    }, 1200);
  } catch (error) {
    console.error("Signup error:", error);
    this.showStatus(
      "Connection error. Make sure backend is running on port 5000.",
      true,
    );
  }
};

AuthManager.prototype.handleSignin = async function () {
  const email = document
    .getElementById("signin-email")
    .value.trim()
    .toLowerCase();
  const pw = document.getElementById("signin-password").value;
  const rememberCheckbox = document.getElementById("signin-remember");
  const remember = rememberCheckbox ? rememberCheckbox.checked : false;

  if (!email || !pw) {
    this.showStatus("Please enter email and password", true);
    return;
  }

  try {
    const response = await fetch(`${this.API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password: pw }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      this.showStatus(err.message || "Login failed", true);
      return;
    }

    const data = await response.json();
    if (data.token) this.setAuthToken(data.token, remember);
    if (data.user) this.setCurrentUser(data.user, remember);

    this.showStatus("Login successful!");
    setTimeout(() => {
      window.location.href = this.getHomePath();
    }, 1200);
  } catch (error) {
    console.error("Login error:", error);
    this.showStatus(
      "Connection error. Make sure backend is running on port 5000.",
      true,
    );
  }
};

// ===============================================
// MAIN ENTRY POINT
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("WedEASE Starting...");

  window.authManager = new AuthManager();

  if (document.getElementById("hero-image")) {
    window.heroManager = new HeroManager();
    window.heroManager.init();
  }

  if (document.getElementById("weddingDateInput")) {
    window.countdownManager = new CountdownManager();
  }

  WedEASEUtils.setupHeaderScroll();
  WedEASEUtils.setupHoverEffects();
  WedEASEUtils.updateActiveNavLink();

  document.querySelectorAll(".cta-button").forEach((btn) => {
    if (btn.getAttribute("href")) return;
    btn.addEventListener("click", () => {
      window.location.href = "src/pages/about.html";
    });
  });
});

window.WedEASEUtils = WedEASEUtils;
window.CountdownManager = CountdownManager;
window.AuthManager = AuthManager;
window.HeroManager = HeroManager;

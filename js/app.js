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
// HERO IMAGE ROTATOR & CTA MANAGER - FIXED
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
    
    console.log("Hero Manager: Initializing...");
    
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
    
    console.log("Hero Manager: Elements found, starting rotation...");
    
    // Ensure initial image is set
    heroImage.src = this.images[this.currentIndex];
    heroImage.alt = this.getAltText();
    
    // Set initial CTA content
    this.updateCtaContent();
    
    // Start auto rotation
    this.startAutoRotation();
    
    // Add click handler for manual rotation
    heroImage.addEventListener('click', () => {
      console.log("Hero image clicked, rotating...");
      this.nextImage();
    });
    
    this.initialized = true;
    console.log("Hero Manager: Successfully initialized and running");
  }

  startAutoRotation() {
    // Clear any existing interval first
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      console.log("Hero Manager: Cleared existing interval");
    }
    
    // Start new interval - rotate every 3 seconds
    this.rotationInterval = setInterval(() => {
      console.log("Hero Manager: Auto-rotating to next image");
      this.nextImage();
    }, 3000);
    
    console.log("Hero Manager: Auto-rotation started (3 second intervals)");
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    console.log("Hero Manager: Switching to image index", this.currentIndex, "-", this.images[this.currentIndex]);
    this.updateHeroContent();
  }

  updateHeroContent() {
    const heroImage = document.getElementById('hero-image');
    const ctaButton = document.getElementById('hero-cta-button');
    
    if (!heroImage || !ctaButton) {
      console.log("Hero Manager: Elements missing during update");
      return;
    }

    console.log("Hero Manager: Updating content...");

    // Update image with fade effect
    heroImage.style.transition = 'opacity 0.3s ease-in-out';
    heroImage.style.opacity = '0.1';
    
    setTimeout(() => {
      heroImage.src = this.images[this.currentIndex];
      heroImage.alt = this.getAltText();
      heroImage.style.opacity = '1';
      console.log("Hero Manager: Image updated to", this.images[this.currentIndex]);
    }, 300);

    // Update CTA button
    this.updateCtaContent();
    console.log("Hero Manager: CTA button updated");
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
    const altTexts = ["Bride and Groom", "Wedding Car", "Ring Hand"];
    return altTexts[this.currentIndex];
  }
}

// ===============================================
// WEDDING COUNTDOWN MANAGER - COMPLETELY FIXED
// ===============================================

class CountdownManager {
    constructor() {
        this.weddingDate = null;
        this.countdownInterval = null;
        this.init();
    }

    init() {
        console.log("Countdown Manager: Initializing");
        
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('weddingDateInput');
        if (dateInput) {
            dateInput.min = today;
        }
        
        // Setup event listeners
        const setDateBtn = document.getElementById('setDateBtn');
        const clearDateBtn = document.getElementById('clearDateBtn');
        const exploreBtn = document.getElementById('exploreMoreBtn');
        
        if (setDateBtn) {
            setDateBtn.addEventListener('click', () => {
                this.setWeddingDate();
            });
        }
        
        if (clearDateBtn) {
            clearDateBtn.addEventListener('click', () => {
                this.clearWeddingDate();
            });
        }
        
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                window.location.href = 'src/pages/about.html';
            });
        }
        
        // Enter key support
        const dateInputElement = document.getElementById('weddingDateInput');
        if (dateInputElement) {
            dateInputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.setWeddingDate();
            });
        }
        
        // Load saved data from localStorage
        this.loadSavedData();
    }

    loadSavedData() {
        const savedDate = localStorage.getItem('wedease_wedding_date');
        
        if (savedDate) {
            this.weddingDate = new Date(savedDate);
            const dateInput = document.getElementById('weddingDateInput');
            if (dateInput) {
                dateInput.value = savedDate.split('T')[0];
            }
            this.startCountdown();
        }
    }

    setWeddingDate() {
        const dateInput = document.getElementById('weddingDateInput');
        if (!dateInput) return;

        const dateValue = dateInput.value;
        
        if (!dateValue) {
            this.showError('Please select your wedding date');
            return;
        }

        const btn = document.getElementById('setDateBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Starting...';
        }

        try {
            this.weddingDate = new Date(dateValue + 'T00:00:00');
            
            // Validate date is in the future
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Set to beginning of day for comparison
            
            if (this.weddingDate <= now) {
                throw new Error('Please select a future date');
            }
            
            localStorage.setItem('wedease_wedding_date', this.weddingDate.toISOString());
            this.startCountdown();
            
        } catch (error) {
            this.showError('Failed to set wedding date: ' + error.message);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Start Countdown';
            }
        }
    }

    clearWeddingDate() {
        // Clear from localStorage
        localStorage.removeItem('wedease_wedding_date');
        
        // Clear current date
        this.weddingDate = null;
        
        // Clear interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Reset UI
        const dateInput = document.getElementById('weddingDateInput');
        const countdownDisplay = document.getElementById('countdownDisplay');
        const weddingDateDisplay = document.getElementById('weddingDateDisplay');
        const setDateBtn = document.getElementById('setDateBtn');
        const clearDateBtn = document.getElementById('clearDateBtn');
        const exploreBtn = document.getElementById('exploreMoreBtn');
        
        if (dateInput) dateInput.value = '';
        if (countdownDisplay) countdownDisplay.style.display = 'none';
        if (weddingDateDisplay) weddingDateDisplay.style.display = 'none';
        if (setDateBtn) setDateBtn.style.display = 'block';
        if (clearDateBtn) clearDateBtn.style.display = 'none';
        if (exploreBtn) exploreBtn.style.display = 'none';
        
        console.log("Wedding date cleared");
    }

    startCountdown() {
        if (!this.weddingDate) return;

        // Show displays
        const countdownDisplay = document.getElementById('countdownDisplay');
        const weddingDateDisplay = document.getElementById('weddingDateDisplay');
        const setDateBtn = document.getElementById('setDateBtn');
        const clearDateBtn = document.getElementById('clearDateBtn');
        const exploreBtn = document.getElementById('exploreMoreBtn');
        
        if (countdownDisplay) countdownDisplay.style.display = 'block';
        if (weddingDateDisplay) weddingDateDisplay.style.display = 'block';
        if (setDateBtn) setDateBtn.style.display = 'none';
        if (clearDateBtn) clearDateBtn.style.display = 'inline-block';
        if (exploreBtn) exploreBtn.style.display = 'block';

        // Update wedding date display
        this.updateWeddingDateDisplay();
        
        // Clear existing interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // Update immediately
        this.updateCountdown();
        
        // Update every second
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
        
        console.log("Countdown started for:", this.weddingDate.toDateString());
    }

    updateWeddingDateDisplay() {
        const weddingDateText = document.getElementById('weddingDateText');
        if (!weddingDateText || !this.weddingDate) return;

        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = this.weddingDate.toLocaleDateString('en-US', options);
        weddingDateText.textContent = formattedDate;
    }

    updateCountdown() {
        if (!this.weddingDate) return;

        const now = new Date().getTime();
        const distance = this.weddingDate.getTime() - now;

        if (distance < 0) {
            // Wedding day has passed
            this.handleWeddingPassed();
            return;
        }

        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update display
        this.updateDisplay(days, hours, minutes, seconds);
        this.updateMessage(days);
    }

    updateDisplay(days, hours, minutes, seconds) {
        // Update numbers
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }

    updateMessage(days) {
        const messageElement = document.getElementById('countdownMessage');
        if (!messageElement) return;
        
        let message = '';
        
        if (days === 0) {
            message = " It's your wedding day! Congratulations!";
        } else if (days === 1) {
            message = " Just one more day until your special day! ";
        } else if (days < 7) {
            message = " Less than a week to go! So exciting! ";
        } else if (days < 30) {
            message = " The big day is getting closer! ";
        } else if (days < 90) {
            message = " Your wedding is just around the corner! ";
        } else {
            message = " Counting down to your beautiful wedding day! ";
        }
        
        messageElement.textContent = message;
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
                    <button class="explore-more-btn" onclick="window.location.href='src/pages/about.html'">
                        Explore More
                    </button>
                </div>
            `;
        }
    }

    showError(message) {
        // Remove any existing errors
        const existingError = document.querySelector('.countdown-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'countdown-error';
        errorDiv.textContent = message;
        
        const inputSection = document.querySelector('.countdown-input-section');
        if (inputSection) {
            inputSection.appendChild(errorDiv);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// ===============================================
// EPIC FIRST-TIME WELCOME EXPERIENCE - FIXED AUDIO
// ===============================================

class MusicalEntrance {
  constructor() {
    this.audio = document.getElementById('welcomeAudio');
    this.welcomeContainer = document.getElementById('firstTimeWelcome');
    this.startButton = document.getElementById('startExperience');
    this.mainApp = document.getElementById('app');
    this.hasShownWelcome = sessionStorage.getItem('wedease_welcome_shown');
    this.audioPlayed = false;
    
    this.init();
  }

  init() {
    const isPageRefresh = performance.navigation.type === performance.navigation.TYPE_RELOAD;
    const cameFromOtherSite = document.referrer && !document.referrer.includes(window.location.hostname);
    
    if (this.hasShownWelcome && !cameFromOtherSite && !isPageRefresh) {
      this.showMainContentImmediately();
      this.hideWelcomeContainer();
      return;
    }

    if (!this.welcomeContainer) {
      this.showMainContentImmediately();
      return;
    }

    if (this.mainApp) {
      this.mainApp.style.opacity = '0';
      this.mainApp.style.visibility = 'hidden';
    }

    this.startWelcomeSequence();

    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        this.startWithSound();
      });
    }
  }

  startWelcomeSequence() {
    this.welcomeContainer.classList.add('open');
    
    setTimeout(() => {
      this.createQuantumParticles();
      this.createLightBeams();
      this.createFloatingElements();
    }, 500);
    
    setTimeout(() => {
      if (this.startButton) {
        this.startButton.style.transform = 'translate(-50%, -50%) scale(1)';
        this.startButton.style.opacity = '1';
      }
    }, 2000);
  }

  async startWithSound() {
    await this.playWelcomeSound();
    this.completeWelcomeExperience();
  }

  async playWelcomeSound() {
    if (!this.audio || this.audioPlayed) return;

    try {
      this.audio.volume = 0.3;
      this.audio.currentTime = 0;
      
      await this.audio.play();
      this.audioPlayed = true;
      
      console.log("Welcome audio playing successfully");
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (this.audio && this.audioPlayed) {
          this.audio.pause();
          this.audio.currentTime = 0;
        }
      }, 5000);
      
    } catch (error) {
      console.log('Audio play failed:', error);
      // Continue with welcome experience even if audio fails
    }
  }

  completeWelcomeExperience() {
    sessionStorage.setItem('wedease_welcome_shown', 'true');
    
    if (this.startButton) {
      this.startButton.style.transform = 'translate(-50%, -50%) scale(0.9)';
      this.startButton.style.background = 'linear-gradient(45deg, #764ba2, #667eea)';
    }
    
    setTimeout(() => {
      if (this.welcomeContainer) {
        this.welcomeContainer.style.opacity = '0';
        this.welcomeContainer.style.transform = 'scale(1.1)';
      }
      
      this.showMainContent();
      
      setTimeout(() => {
        this.hideWelcomeContainer();
        
        // Initialize hero manager after welcome sequence
        if (window.heroManager && typeof window.heroManager.init === 'function') {
          console.log("Starting hero image rotation after welcome...");
          window.heroManager.init();
        }
      }, 1000);
    }, 300);
  }

  showMainContent() {
    if (this.mainApp) {
      this.mainApp.style.opacity = '1';
      this.mainApp.style.visibility = 'visible';
    }
  }

  showMainContentImmediately() {
    if (this.mainApp) {
      this.mainApp.style.opacity = '1';
      this.mainApp.style.visibility = 'visible';
    }
    this.hideWelcomeContainer();
    
    // Initialize hero manager immediately for returning visitors
    if (window.heroManager && typeof window.heroManager.init === 'function') {
      console.log("Starting hero image rotation immediately...");
      window.heroManager.init();
    }
  }

  hideWelcomeContainer() {
    if (this.welcomeContainer) {
      this.welcomeContainer.style.display = 'none';
    }
  }

  createQuantumParticles() {
    if (!this.welcomeContainer) return;
    
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        this.createQuantumParticle();
      }, i * 40);
    }
  }

  createQuantumParticle() {
    if (!this.welcomeContainer) return;
    
    const particle = document.createElement('div');
    particle.className = 'quantum-particle';
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 200;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.left = '50%';
    particle.style.top = '50%';
    
    const colors = ['#ff6b9d', '#ffd700', '#667eea', '#ffffff', '#764ba2'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    const size = 2 + Math.random() * 4;
    const duration = 2 + Math.random() * 2;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.animation = `quantumFloat ${duration}s ease-out forwards`;
    
    this.welcomeContainer.appendChild(particle);
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, duration * 1000);
  }

  createLightBeams() {
    if (!this.welcomeContainer) return;
    
    for (let i = 0; i < 12; i++) {
      const beam = document.createElement('div');
      beam.className = 'light-beam';
      
      const angle = (i * 30) * (Math.PI / 180);
      const distance = 150;
      
      beam.style.left = `calc(50% + ${Math.cos(angle) * distance}px)`;
      beam.style.top = `calc(50% + ${Math.sin(angle) * distance}px)`;
      beam.style.transform = `rotate(${angle}rad)`;
      beam.style.animation = `beamRise 2s ease-in-out ${i * 0.2}s forwards`;
      
      this.welcomeContainer.appendChild(beam);
      
      setTimeout(() => {
        if (beam.parentNode) {
          beam.parentNode.removeChild(beam);
        }
      }, 3000);
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

  // FIXED: runs on ALL pages (homepage, about, theme, budget...)
  init() {
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

  // --- USER ACCOUNT STORAGE ---
  getUsers() {
    return JSON.parse(localStorage.getItem("wedease_users") || "{}");
  }

  setUsers(obj) {
    localStorage.setItem("wedease_users", JSON.stringify(obj));
  }

  // --- LOGIN SESSION ---
  setCurrentUser(email) {
    sessionStorage.setItem("wedease_current", email);
    this.updateHeaderUser(email);
  }

  clearCurrentUser() {
    sessionStorage.removeItem("wedease_current");
    this.updateHeaderUser(null);
  }

  // --- SHOW USERNAME IN HEADER ---
  updateHeaderUser(email) {
    const headerRight = document.querySelector(".header-right");
    if (!headerRight) return;

    // Remove existing username
    const existing = document.getElementById("user-label");
    if (existing) existing.remove();

    // Find login button
    const loginBtn = headerRight.querySelector(".login-btn");

    // If logged in → hide login button
    if (email && loginBtn) {
      loginBtn.style.display = "none";
    }

    // If logged out → show login button
    if (!email && loginBtn) {
      loginBtn.style.display = "flex";
      return;
    }

    // SHOW USERNAME BUTTON
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
          window.location.href = "../../src/pages/login.html";
        }
      });

      headerRight.appendChild(btn);
    }
  }

  showStatus(msg, isError = false) {
    const el = document.getElementById("auth-status");
    if (!el) return;
    el.textContent = msg;
    el.className = isError ? "error" : "success";
  }

  // --- EVENTS ---
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

  // --- CREATE ACCOUNT ---
  async handleSignup() {
  try {
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const pw = document.getElementById("signup-password").value;
    const pw2 = document.getElementById("signup-password2").value;

    // Validation
    if (!email) throw new Error("Please enter your email");
    if (!pw) throw new Error("Please enter your password");
    if (!pw2) throw new Error("Please confirm your password");
    if (!email.includes("@")) throw new Error("Invalid email");
    if (pw.length < 8) throw new Error("Password must be at least 8 characters");
    if (pw !== pw2) throw new Error("Passwords do not match");

    const users = this.getUsers();
    if (users[email]) throw new Error("Account already exists");

    // Hash password
    const hash = await this.hashPassword(pw);

    users[email] = { hash, created: Date.now() };
    this.setUsers(users);
    this.setCurrentUser(email);

    this.showStatus("Account created successfully!", false);

    setTimeout(() => {
      window.location.href = "../../index.html";
    }, 1500);

  } catch (err) {
    this.showStatus(err.message, true);
  }
}


  // --- SIGN IN ---
  async handleSignin() {
  try {
    const email = document.getElementById("signin-email").value.trim().toLowerCase();
    const pw = document.getElementById("signin-password").value;

    // Validation
    if (!email) throw new Error("Please enter your email");
    if (!pw) throw new Error("Please enter your password");

    const users = this.getUsers();
    if (!users[email]) throw new Error("Account not found");

    const hashed = await this.hashPassword(pw);
    if (hashed !== users[email].hash) throw new Error("Incorrect password");

    this.setCurrentUser(email);
    this.showStatus("Login successful!", false);

    setTimeout(() => {
      window.location.href = "../../index.html";
    }, 1500);

  } catch (err) {
    this.showStatus(err.message, true);
  }
}


  // --- LOAD USER ON PAGE LOAD ---
  checkCurrentUser() {
    const current = sessionStorage.getItem("wedease_current");
    this.updateHeaderUser(current);
  }
}
class BudgetManager {
  constructor() {
    this.init();
  }

  init() {
    console.log("Budget Manager initialized");
  }
}


class WedEASEApp {
  constructor() {
    this.heroManager = null;
    this.musicalEntrance = null;
    this.countdownManager = null;
    this.init();
  }

  init() {
    console.log("WedEASE App initialized");
    
    this.utils = WedEASEUtils;
    this.budgetManager = new BudgetManager();
    this.authManager = new AuthManager();

    // Initialize managers based on page content
    if (document.getElementById('firstTimeWelcome')) {
      this.musicalEntrance = new MusicalEntrance();
    }
    
    if (document.getElementById('hero-image')) {
      this.heroManager = new HeroManager();
      window.heroManager = this.heroManager; // Make globally available
    }

    if (document.getElementById('weddingDateInput')) {
      this.countdownManager = new CountdownManager();
    }

    this.utils.setupHeaderScroll();
    this.utils.setupHoverEffects();
    this.utils.updateActiveNavLink();

    this.setupInteractiveElements();
  }

  setupInteractiveElements() {
    const ctaButtons = document.querySelectorAll(".cta-button");
    ctaButtons.forEach((btn) => {
      if (btn.getAttribute('href')) return;
      btn.addEventListener("click", () => {
        window.location.href = "src/pages/about.html";
      });
    });

    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        const categoryName = card.querySelector('span').textContent;
        alert(`Opening ${categoryName} budget category`);
      });
    });
  }
}

let budgetManager;
let heroManager;
let themeManager;

document.addEventListener("DOMContentLoaded", () => {
  console.log("WedEASE Starting...");
  budgetManager = new BudgetManager();
  heroManager = new HeroManager();
  
  const themeGrid = document.querySelector('.theme-grid');
  const themeSearch = document.getElementById('theme-search');
  if (themeGrid && themeSearch) {
      themeManager = new ThemeManager();
  }
  
  new WedEASEApp();
});

window.WedEASEUtils = WedEASEUtils;
window.heroManager = heroManager;
window.themeManager = themeManager;
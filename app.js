// ===============================================
// PAGE NAVIGATION & ROUTING
// ===============================================

class PageRouter {
  constructor() {
    this.currentPage = 'home';
    this.init();
  }

  init() {
    // Set up navigation links
    this.setupNavigation();
    
    // Load initial page
    this.navigateTo('home');
    
    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'home';
      this.navigateTo(hash);
    });

    // Handle header scroll effect
    this.setupHeaderScroll();
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('[data-page]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.navigateTo(page);
        window.location.hash = page;
      });
    });
  }

  navigateTo(page) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    // Show selected page
    const selectedPage = document.getElementById(page);
    if (selectedPage) {
      selectedPage.classList.add('active');
      this.currentPage = page;
      
      // Scroll to top
      window.scrollTo(0, 0);
      
      // Update active nav link
      this.updateActiveNavLink(page);
    }
  }

  updateActiveNavLink(page) {
    const navLinks = document.querySelectorAll('[data-page]');
    navLinks.forEach(link => {
      if (link.dataset.page === page) {
        link.style.borderBottomColor = 'var(--wed-secondary)';
        link.style.color = 'var(--wed-secondary)';
      } else {
        link.style.borderBottomColor = 'transparent';
        link.style.color = 'var(--wed-primary)';
      }
    });
  }

  setupHeaderScroll() {
    const header = document.getElementById('header');
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 0) {
            header.classList.add('is-fixed');
          } else {
            header.classList.remove('is-fixed');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}

// ===============================================
// INTERACTIVE ELEMENTS
// ===============================================

class InteractiveElements {
  constructor() {
    this.init();
  }

  init() {
    this.setupButtons();
    this.setupHoverEffects();
  }

  setupButtons() {
    // Start Now button
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        console.log('Start Now clicked!');
        // You can add more functionality here
      });
    });

    // Login button
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        console.log('Login clicked!');
        // Add login functionality here
      });
    }

    // Add budget item
    const addItemButtons = document.querySelectorAll('.add-item');
    addItemButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.addBudgetItem();
      });
    });
  }

  setupHoverEffects() {
    // Add smooth transitions for hover effects
    const interactiveElements = document.querySelectorAll(
      '.feature-card, .category-card, .theme-card, .feature-box'
    );
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
      });
    });
  }

  addBudgetItem() {
    const budgetItems = document.querySelector('.budget-items');
    const newItem = document.createElement('div');
    newItem.className = 'budget-item';
    newItem.innerHTML = `
      <span class="item-name">New Item</span>
      <span class="item-amount">$0</span>
    `;
    
    // Insert before the add-item button
    const addItemBtn = budgetItems.querySelector('.add-item');
    addItemBtn.parentNode.insertBefore(newItem, addItemBtn);
  }
}

// ===============================================
// UTILITIES
// ===============================================

class Utilities {
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// ===============================================
// APP INITIALIZATION
// ===============================================

class WedEASEApp {
  constructor() {
    this.router = new PageRouter();
    this.interactive = new InteractiveElements();
    this.init();
  }

  init() {
    console.log('WedEASE App initialized');
    
    // Add any additional initialization here
    this.setupEventDelegation();
  }

  setupEventDelegation() {
    // Handle all clicks for navigation
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-page]');
      if (target) {
        e.preventDefault();
        const page = target.dataset.page;
        this.router.navigateTo(page);
        window.location.hash = page;
      }
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new WedEASEApp();
});

// Export utilities for external use if needed
window.WedEASEUtils = Utilities;

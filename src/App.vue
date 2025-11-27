<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isFixed = ref(false)
const navHeight = ref(0)
const navRef = ref(null)

function onScroll() {
  // Fix the navbar once we scroll past its top position
  if (!navRef.value) return
  isFixed.value = window.scrollY > navRef.value.offsetTop + 8
}

onMounted(() => {
  if (navRef.value) navHeight.value = Math.ceil(navRef.value.getBoundingClientRect().height)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="app-root">
    <!-- Header/Navigation -->
    <header class="header" :class="{ 'is-fixed': isFixed }" ref="navRef">
      <div class="header-container">
        <div class="header-left">
          <div class="logo">
            <span class="logo-w">W</span><span class="logo-e">E</span>
          </div>
        </div>
        <nav class="header-nav" aria-label="Main navigation">
          <a href="#hero-section" class="nav-link">Home</a>
          <a href="#budget-section" class="nav-link">Budget</a>
          <a href="#theme-section" class="nav-link">Theme</a>
          <a href="#guests-section" class="nav-link">Guests</a>
          <a href="#track-section" class="nav-link">Track</a>
        </nav>
        <div class="header-right">
          <button class="user-icon" aria-label="User profile">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="6" r="4" fill="currentColor" opacity="0.8"/>
              <path d="M2 16c0-2.21 3.58-4 8-4s8 1.79 8 4v2H2v-2z" fill="currentColor" opacity="0.6"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- nav placeholder to avoid layout jump when header becomes fixed -->
    <div v-if="isFixed" :style="{ height: navHeight + 'px' }"></div>

    <!-- Hero Section -->
    <section id="hero-section" class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-left">
            <h1 class="hero-title">WedEASE</h1>
            <p class="hero-subtitle">Your complete wedding planning companion. From budget to theme to seating charts—manage every detail effortlessly.</p>
            <button class="btn btn-primary">
              <span>❤</span> Start Now
            </button>
          </div>
          <div class="hero-right">
            <img src="https://i.pinimg.com/1200x/ff/00/e2/ff00e293d374163a3b9646bb69ca4d02.jpg" alt="Wedding rings" class="hero-image">
          </div>
        </div>
      </div>
    </section>

    <!-- Budget Section -->
    <section id="budget-section" class="budget-section">
      <div class="container">
        <h2 class="section-title">Every Dollar, Perfectly Placed</h2>
        <p class="section-subtitle">Track your budget across all categories and stay in control.</p>
        
        <div class="budget-container">
          <div class="budget-left">
            <div class="budget-card-main">
              <h3>Budget Tracker</h3>
              <div class="budget-items">
                <div class="budget-item">
                  <span class="item-name">Makeup Artist</span>
                  <span class="item-amount">$7,000</span>
                </div>
                <div class="budget-item">
                  <span class="item-name">Venue Rental</span>
                  <span class="item-amount">$15,000</span>
                </div>
                <div class="budget-item add-item">
                  <span>+ Add Budget Item</span>
                </div>
              </div>
              <div class="budget-total">
                <span>Total Budget</span>
                <span class="total-amount">$22,000</span>
              </div>
            </div>
          </div>
          
          <div class="budget-right">
            <div class="category-grid">
              <div class="category-card">
                <div class="icon">🏛️</div>
                <span>Venue & Rental</span>
              </div>
              <div class="category-card">
                <div class="icon">🍽️</div>
                <span>Food & Drink</span>
              </div>
              <div class="category-card">
                <div class="icon">🎵</div>
                <span>Entertainment</span>
              </div>
              <div class="category-card">
                <div class="icon">📷</div>
                <span>Photography</span>
              </div>
              <div class="category-card">
                <div class="icon">🌸</div>
                <span>Floral & Decor</span>
              </div>
              <div class="category-card">
                <div class="icon">🎁</div>
                <span>Gifts & Favors</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Theme Section -->
    <section id="theme-section" class="theme-section">
      <div class="container">
        <h2 class="section-title">Choose Your Wedding Theme</h2>
        <p class="section-subtitle">Select a style that matches your vision.</p>
        
        <div class="theme-grid">
          <div class="theme-card">
            <div class="theme-image" style="background: linear-gradient(135deg, #FFB6D9 0%, #FFC0CB 100%);">
              <img src="/assets/theme-fairy-tale.svg" alt="Fairytale Theme">
            </div>
            <h3 class="theme-name">Fairytale Theme</h3>
          </div>
          <div class="theme-card">
            <div class="theme-image" style="background: linear-gradient(135deg, #E0E0E0 0%, #D8D8D8 100%);">
              <img src="/assets/theme-modern.svg" alt="Modern Theme">
            </div>
            <h3 class="theme-name">Modern Theme</h3>
          </div>
          <div class="theme-card">
            <div class="theme-image" style="background: linear-gradient(135deg, #C19A6B 0%, #D2B48C 100%);">
              <img src="/assets/theme-classic.svg" alt="Classic Theme">
            </div>
            <h3 class="theme-name">Classic Theme</h3>
          </div>
          <div class="theme-card">
            <div class="theme-image" style="background: linear-gradient(135deg, #8B6F47 0%, #A0826D 100%);">
              <img src="/assets/theme-rustic.svg" alt="Rustic Theme">
            </div>
            <h3 class="theme-name">Rustic Theme</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- Guests/Seating Section -->
    <section id="guests-section" class="guests-section">
      <div class="container">
        <div class="guests-content">
          <div class="guests-left">
            <h2 class="section-title">Every Guest in the Perfect Place</h2>
            <p class="section-subtitle">Create and manage seating charts with ease. Assign guests to tables, track RSVPs, and ensure everyone feels at home.</p>
            <button class="btn btn-secondary">Plan Seating</button>
          </div>
          <div class="guests-right">
            <div class="guests-image">
              <img src="/assets/seating-chart.svg" alt="Seating Chart Visualization">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Track/Gifts Section -->
    <section id="track-section" class="track-section">
      <div class="container">
        <div class="track-content">
          <div class="track-left">
            <div class="track-image">
              <img src="/assets/gift-tracker.svg" alt="Gift Tracker">
            </div>
          </div>
          <div class="track-right">
            <h2 class="section-title">Track Every Gift, Honor Every Guest</h2>
            <p class="section-subtitle">Keep a detailed record of gifts received, thank-you notes sent, and guest details all in one place.</p>
            <ul class="track-features">
              <li>✓ Gift tracking with amounts</li>
              <li>✓ Thank-you note reminders</li>
              <li>✓ Guest contact information</li>
              <li>✓ Export and print capabilities</li>
            </ul>
            <button class="btn btn-secondary">Start Tracking</button>
          </div>
        </div>
      </div>
    </section>

    <!-- RSVP Section -->
    <section class="rsvp-section">
      <div class="container">
        <h2 class="section-title">Simplify Guest Management</h2>
        <p class="section-subtitle">Three essential features to manage your wedding details.</p>
        
        <div class="feature-cards-grid">
          <div class="feature-card">
            <div class="feature-icon">🌐</div>
            <h3>Wedding Website</h3>
            <p>Create a beautiful wedding website to share details with your guests.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✓</div>
            <h3>RSVP Tracking</h3>
            <p>Track guest responses and attendance status in real-time.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📧</div>
            <h3>Sharing Made Easy</h3>
            <p>Share your wedding details and updates with all your guests instantly.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-section">
            <h4>Features</h4>
            <ul>
              <li><a href="#budget-section">Budget</a></li>
              <li><a href="#theme-section">Theme</a></li>
              <li><a href="#guests-section">Seating</a></li>
              <li><a href="#track-section">Gift Tracking</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Social</h4>
            <ul>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">LinkedIn</a></li>
            </ul>
          </div>
          <div class="footer-section newsletter">
            <h4>Newsletter</h4>
            <p>Subscribe for wedding tips and updates</p>
            <div class="newsletter-input">
              <input type="email" placeholder="your@email.com">
              <button class="btn btn-small">Subscribe</button>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 WedEASE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
:root {
  --primary: #a2437c;
  --secondary: #6f3054;
  --bg: #fcf4fb;
  --text: #1f1f1f;
  --muted: #666;
  --border: #e0d5e3;
  --card-bg: #ffffff;
  --shadow-lg: 0 10px 30px rgba(20, 20, 20, 0.1);
  --shadow-xl: 0 20px 50px rgba(20, 20, 20, 0.15);
  --radius: 0.75rem;
}

* {
  box-sizing: border-box;
}

html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}

.app-root {
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(to bottom, #ffffff 0%, var(--bg) 100%);
  color: var(--text);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header/Navigation */
.header {
  position: relative;
  background: transparent;
  padding: 1.5rem 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.header.is-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-lg);
  padding: 1rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-left {
  flex-shrink: 0;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  display: flex;
  align-items: baseline;
}

.logo-w {
  color: var(--primary);
}

.logo-e {
  color: var(--secondary);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: var(--muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s ease;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
}

.nav-link:hover {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.user-icon:hover {
  transform: scale(1.05);
}

/* Hero Section */
.hero-section {
  padding: 6rem 0 4rem;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 1.5rem;
  letter-spacing: -1px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--muted);
  line-height: 1.6;
  margin: 0 0 2rem;
  max-width: 500px;
}

.hero-right {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 1rem;
  box-shadow: var(--shadow-xl);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  border: 1px solid transparent;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 15px rgba(162, 67, 124, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(162, 67, 124, 0.4);
}

.btn-secondary {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
}

.btn-secondary:hover {
  background: var(--primary);
  color: white;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Sections */
section {
  padding: 4rem 0;
  border-top: 1px solid rgba(162, 67, 124, 0.1);
}

section:first-of-type {
  border-top: none;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  color: var(--text);
}

.section-subtitle {
  font-size: 1rem;
  color: var(--muted);
  margin: 0 0 2rem;
  max-width: 600px;
}

/* Budget Section */
.budget-section {
  background: linear-gradient(to bottom, rgba(162, 67, 124, 0.02), transparent);
}

.budget-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 3rem;
}

.budget-card-main {
  background: var(--card-bg);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(162, 67, 124, 0.08);
  border: 1px solid rgba(162, 67, 124, 0.1);
}

.budget-card-main h3 {
  font-size: 1.3rem;
  margin: 0 0 1.5rem;
  color: var(--text);
}

.budget-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.budget-item.add-item {
  border: none;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
}

.item-name {
  color: var(--text);
  font-weight: 500;
}

.item-amount {
  color: var(--primary);
  font-weight: 700;
}

.budget-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-top: 2px solid rgba(162, 67, 124, 0.2);
  font-weight: 700;
}

.total-amount {
  color: var(--primary);
  font-size: 1.3rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(162, 67, 124, 0.05), rgba(111, 48, 84, 0.05));
  border-radius: var(--radius);
  border: 1px solid rgba(162, 67, 124, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-card:hover {
  background: linear-gradient(135deg, rgba(162, 67, 124, 0.1), rgba(111, 48, 84, 0.1));
  transform: translateY(-2px);
}

.icon {
  font-size: 2rem;
}

.category-card span {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

/* Theme Section */
.theme-section {
  background: linear-gradient(to bottom, transparent, rgba(162, 67, 124, 0.02));
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-top: 2rem;
}

.theme-card {
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.theme-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(162, 67, 124, 0.2);
}

.theme-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.theme-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
}

.theme-name {
  padding: 1rem;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  background: var(--card-bg);
  color: var(--text);
}

/* Guests/Seating Section */
.guests-section {
  padding: 4rem 0;
}

.guests-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.guests-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.guests-right {
  display: flex;
  align-items: center;
  justify-content: center;
}

.guests-image {
  width: 100%;
  max-width: 400px;
}

.guests-image img {
  width: 100%;
  height: auto;
  border-radius: 1rem;
  box-shadow: var(--shadow-xl);
}

/* Track/Gifts Section */
.track-section {
  padding: 4rem 0;
  background: linear-gradient(to bottom, rgba(162, 67, 124, 0.02), transparent);
}

.track-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.track-left {
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-image {
  width: 100%;
  max-width: 400px;
}

.track-image img {
  width: 100%;
  height: auto;
  border-radius: 1rem;
  box-shadow: var(--shadow-xl);
}

.track-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.track-features {
  list-style: none;
  padding: 1.5rem 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.track-features li {
  font-size: 1rem;
  color: var(--text);
  font-weight: 500;
}

/* RSVP Section */
.rsvp-section {
  padding: 4rem 0;
  background: linear-gradient(to bottom, transparent, rgba(162, 67, 124, 0.05));
}

.feature-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: var(--card-bg);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(162, 67, 124, 0.08);
  border: 1px solid rgba(162, 67, 124, 0.1);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(162, 67, 124, 0.2);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 1rem 0;
  color: var(--text);
}

.feature-card p {
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}

/* Footer */
.footer {
  background: linear-gradient(to bottom, rgba(162, 67, 124, 0.05), rgba(162, 67, 124, 0.1));
  border-top: 1px solid rgba(162, 67, 124, 0.2);
  padding: 3rem 0 1.5rem;
  margin-top: 2rem;
}

.footer-top {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(162, 67, 124, 0.1);
}

.footer-section h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text);
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-section a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-section a:hover {
  color: var(--primary);
}

.newsletter {
  display: flex;
  flex-direction: column;
}

.newsletter p {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 0 0 1rem;
}

.newsletter-input {
  display: flex;
  gap: 0.5rem;
}

.newsletter-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid rgba(162, 67, 124, 0.2);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 0.9rem;
}

.newsletter-input input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(162, 67, 124, 0.1);
}

.footer-bottom {
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
  padding-top: 1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-nav {
    gap: 1.5rem;
    font-size: 0.9rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-content {
    gap: 2rem;
  }

  .theme-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .feature-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-top {
    grid-template-columns: repeat(3, 1fr);
  }

  .budget-container {
    grid-template-columns: 1fr;
  }

  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .guests-content,
  .track-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1.5rem;
  }

  .header-container {
    padding: 0 1.5rem;
  }

  .hero-section {
    padding: 3rem 0 2rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .header-nav {
    display: none;
  }

  .theme-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .feature-cards-grid {
    grid-template-columns: 1fr;
  }

  .footer-top {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 1rem 0;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.9rem;
  }

  .theme-grid {
    grid-template-columns: 1fr;
  }

  .budget-card-main {
    padding: 1rem;
  }

  .category-grid {
    grid-template-columns: 1fr;
  }

  .newsletter-input {
    flex-direction: column;
  }

  .newsletter-input input,
  .newsletter-input button {
    width: 100%;
  }
}
</style>

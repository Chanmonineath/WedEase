<template>
  <div class="home-root">
    <!-- HERO -->
    <section class="hero container">
      <div class="hero-left">
        <h1 class="hero-title">
          <span class="hero-we">We</span>
          <span class="hero-dease">deASE</span>
        </h1>
        <p class="hero-sub">All the tools you need to design, plan, and celebrate your big day—smart, seamless, and stress-free.</p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg">Start Now</button>
        </div>
      </div>
      <div class="hero-right" aria-hidden="true">
        <div class="phone-mockup">
          <div class="mock-screen">
            <div class="mock-top">
              <div class="chips">
                <span class="chip">Budget</span>
                <span class="chip">Theme</span>
                <span class="chip">Seats</span>
              </div>
              <div class="avatar" />
            </div>
            <div class="mock-body">
              <div class="summary">
                <div>
                  <div class="num">$15,220</div>
                  <div class="label">Total Spent</div>
                </div>
                <div>
                  <div class="num">120</div>
                  <div class="label">Guests</div>
                </div>
                <div>
                  <div class="num">4</div>
                  <div class="label">Themes</div>
                </div>
              </div>
              <div class="mini-tiles">
                <div class="tile">Venue</div>
                <div class="tile">Catering</div>
                <div class="tile">Décor</div>
                <div class="tile">Gifts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BUDGET SECTION -->
    <section id="features" class="section container budget-section">
      <div class="section-head">
        <h2 class="section-title"># Every Dollar, Perfectly Placed</h2>
      </div>

      <div class="budget-grid">
        <div class="budget-card">
          <div class="icon">🏛️</div>
          <div class="label">Venue Rental</div>
        </div>
        <div class="budget-card">
          <div class="icon">💐</div>
          <div class="label">Decoration</div>
        </div>
        <div class="budget-card">
          <div class="icon">🎶</div>
          <div class="label">Entertainment</div>
        </div>
        <div class="budget-card">
          <div class="icon">🍽️</div>
          <div class="label">Catering</div>
        </div>
        <div class="budget-card">
          <div class="icon">👰</div>
          <div class="label">Bridal Styling</div>
        </div>
        <div class="budget-card">
          <div class="icon">🎁</div>
          <div class="label">Gifts</div>
        </div>
      </div>
    </section>

    <!-- THEME SELECTION -->
    <section class="section container theme-section">
      <div class="section-head">
        <h2 class="section-title">Pick the Theme, Create the Dream.</h2>
        <p class="muted" aria-hidden="true"></p>
      </div>
      <div class="themes-row">
        <div class="theme-card">
          <img src="/assets/theme-fairy-tale.svg" alt="Fairy Tale"/>
          <div class="theme-label">Fairy Tale</div>
        </div>
        <div class="theme-card">
          <img src="/assets/theme-modern.svg" alt="Modern"/>
          <div class="theme-label">Modern</div>
        </div>
        <div class="theme-card">
          <img src="/assets/theme-classic.svg" alt="Classic"/>
          <div class="theme-label">Classic</div>
        </div>
        <div class="theme-card">
          <img src="/assets/theme-rustic.svg" alt="Rustic"/>
          <div class="theme-label">Rustic</div>
        </div>
      </div>
    </section>

    <!-- SEATING PLANNER -->
    <section class="section container seating-section">
      <div class="split left">
        <h3 class="sub-title">Every Guest in the Perfect Place</h3>
        <p class="lead">Easily design your seating with drag-and-drop tables, smart guest list import, color-coded assignments, auto table calculations, and ready-to-print charts</p>
      </div>
      <div class="split right">
        <div class="visual-card">
          <img src="/assets/seating-chart.svg" alt="Seating chart mockup" />
        </div>
      </div>
    </section>

    <!-- GIFT TRACKER -->
    <section class="section container gift-section">
      <div class="gift-left">
        <div class="visual-card large">
          <img src="/assets/gift-tracker.svg" alt="Gifts mockup" />
        </div>
      </div>
      <div class="gift-right">
        <h3 class="sub-title"># Track Every Gift, Honor Every Guest</h3>
        <ul class="feature-list">
          <li>Record cash gifts in KHR & USD</li>
          <li>Categorize guests by relationship</li>
          <li>Auto-calculate total contributions</li>
          <li>Export reports for thank-you cards</li>
        </ul>
      </div>
    </section>

    <div class="divider container">
      <hr />
      <div class="cta-center">
        <button class="btn btn-primary">Start Now</button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style>
/* optional page-specific tweaks could go here */
.home-root{padding-bottom:40px}
</style>

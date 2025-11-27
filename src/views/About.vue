<template>
  <main class="about-page">
    <div class="container">
      <section class="about-section">
        <h1 class="page-title">About WedEASE</h1>
        <p class="page-description">
          WedEASE is your complete wedding planning companion designed to make your big day stress-free and unforgettable.
        </p>
      </section>

      <section class="mission-section">
        <h2 class="section-title">Our Mission</h2>
        <p class="section-text">
          We believe every couple deserves a wedding planning experience that's as beautiful and stress-free as their special day. Our mission is to provide you with smart, seamless tools that help you organize every detail—from budgeting to themes, seating arrangements, and gift tracking.
        </p>
      </section>

      <section class="features-section">
        <h2 class="section-title">Why Choose WedEASE?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Smart Budget Tracking</h3>
            <p>Keep every expense organized and stay within your budget with ease.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Theme Selection</h3>
            <p>Choose from curated themes that match your wedding vision perfectly.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Guest Management</h3>
            <p>Manage RSVPs, seating arrangements, and guest details effortlessly.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎁</div>
            <h3>Gift Tracking</h3>
            <p>Track gifts and send thank-you notes with our organized system.</p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
</script>

<style scoped>
.about-page {
  min-height: calc(100vh - 5rem);
  padding: 4rem 0;
  background: linear-gradient(135deg, rgba(162, 67, 124, 0.05) 0%, #fcf4fb 100%);
  margin-top: 5rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.about-section {
  text-align: center;
  margin-bottom: 4rem;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #a2437c;
  margin: 0 0 1.5rem;
  font-family: 'Caveat', cursive;
}

.page-description {
  font-size: 1.25rem;
  color: #6f3054;
  max-width: 600px;
  margin: 0 auto;
}

.mission-section,
.features-section {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #333333;
  margin-bottom: 2rem;
}

.section-text {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
  max-width: 800px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  border: 2px solid #e0d5e3;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: #a2437c;
  box-shadow: 0 10px 30px rgba(162, 67, 124, 0.1);
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333333;
  margin: 0 0 0.5rem;
}

.feature-card p {
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .about-page {
    padding: 2rem 0;
  }

  .container {
    padding: 0 1rem;
  }
}
</style>
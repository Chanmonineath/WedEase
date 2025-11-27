<template>
  <main id="hero-section" class="hero-section">
    <div class="hero-container">
      <!-- Left Content: Headline and CTA -->
      <div class="hero-content-left">
        <h1 class="hero-headline">WedEASE</h1>
        <h2 class="hero-subheading">WedEASE</h2>
        <p class="hero-description">
          All the tools you need to design, plan, and celebrate your big day—smart, seamless, and stress-free.
        </p>

        <!-- CTA Button -->
        <button class="cta-button">
          <!-- Heart Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          <span>Start Now</span>
        </button>
      </div>

      <!-- Right Content: Illustration -->
      <div class="hero-illustration-right">
        <img 
          src="https://i.pinimg.com/1200x/ff/00/e2/ff00e293d374163a3b9646bb69ca4d02.jpg" 
          alt="Wedding rings illustration">
      </div>
    </div>
  </main>
</template>

<script setup>
</script>

<style scoped>
:root {
  --wed-bg: #fcf4fb;          
  --wed-primary: #a2437c;     
  --wed-secondary: #6f3054;   
  --wed-headline: #333333;    
  --font-sans: 'Inter', sans-serif;
  --font-script: 'Cedarville Cursive', cursive;
}

/* Hero Section Styles */
#hero-section {
  background-color: var(--wed-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem; 
  min-height: calc(100vh - 5rem); 
  margin-top: 5rem;
}

.hero-container {
  width: 100%;
  max-width: 80rem; 
  display: grid;
  grid-template-columns: 1fr 1fr; 
  gap: 3rem; 
  align-items: center;
}

/* Left Content (Text) */
.hero-content-left {
  text-align: left; 
  order: 1; 
}

.hero-headline {
  font-family: var(--font-script);
  font-size: 3.75rem; 
  font-weight: 800; 
  margin-bottom: 1.5rem; 
  line-height: 1; 
  color: var(--wed-primary);
}

.hero-subheading {
  font-family: 'Caveat', cursive;
  font-size: 6rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1;

}

.hero-description {
  font-size: 1.125rem; 
  max-width: 36rem; 
  margin: 0 0 2.5rem 0; 
  font-weight: 500; 
  color: var(--wed-secondary);
  font-family: var(--font-sans);
}

/* CTA Button */
.cta-button {
  display: inline-flex;
  align-items: center;
  column-gap: 0.5rem; 
  padding: 0.75rem 2rem; 
  border-radius: 9999px; 
  background-color: #ffb6d9;
  color: white;
  font-size: 1.125rem; 
  font-weight: 600; 
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(255, 182, 217, 0.5), 0 4px 6px -2px rgba(255, 182, 217, 0.05); 
  transition: transform 300ms ease-in-out, box-shadow 300ms ease-in-out;
  font-family: var(--font-sans);
}

.cta-button:hover {
  transform: scale(1.03); 
  box-shadow: 0 20px 25px -5px rgba(255, 182, 217, 0.6), 0 8px 10px -6px rgba(255, 182, 217, 0.1); 
}

.cta-button svg {
  width: 1.25rem; 
  height: 1.25rem; 
}

/* Right Content (Illustration) */
.hero-illustration-right {
  display: flex;
  justify-content: flex-end; 
  order: 2; 
}

.hero-illustration-right img {
  width: 100%; 
  max-width: 25rem; 
  height: auto;
  border-radius: 0.75rem; 
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); 
  opacity: 0.8; 
}

/* Responsive Design */
@media (min-width: 640px) { 
  .hero-headline {
    font-size: 4.5rem; 
  }
  .hero-description {
    font-size: 1.25rem; 
  }
}

@media (min-width: 768px) { 
  .hero-content-left {
    text-align: left; 
    order: 1; 
  }
  
  .hero-description {
    margin: 0 0 2.5rem 0; 
    font-size: 1.25rem; 
  }

  .hero-headline {
    font-size: 5rem; 
  }

  .hero-illustration-right {
    justify-content: flex-end; 
    order: 2; 
  }

  .hero-illustration-right img {
    max-width: none; 
  }
}

@media (max-width: 767px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-content-left {
    text-align: center;
    order: 2;
  }

  .hero-illustration-right {
    justify-content: center;
    order: 1;
  }

  .hero-headline {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  #hero-section {
    padding: 1rem;
    min-height: auto;
  }
}
</style>

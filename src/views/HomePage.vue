<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">AI-Powered Personal Fitness Coaching</h1>
          <p class="hero-subtitle">
            Your personalized fitness journey starts here. Get custom workouts, nutrition plans, and 24/7 coaching support.
          </p>
          <div class="hero-cta">
            <router-link to="/signup" class="btn btn-primary btn-lg">
              Get Started Free
            </router-link>
            <router-link to="/login" class="btn btn-outline btn-lg">
              Login
            </router-link>
          </div>
        </div>
        
        <div class="hero-image">
          <div class="image-placeholder">
            <i class="fas fa-dumbbell"></i>
          </div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Why Choose FitCoach AI?</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-robot"></i>
            </div>
            <h3 class="feature-title">AI-Powered Coaching</h3>
            <p class="feature-description">
              Get 24/7 access to an AI coach that adapts to your progress and provides real-time guidance.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-dumbbell"></i>
            </div>
            <h3 class="feature-title">Personalized Workouts</h3>
            <p class="feature-description">
              Custom workout plans based on your goals, fitness level, and available equipment.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-utensils"></i>
            </div>
            <h3 class="feature-title">Nutrition Guidance</h3>
            <p class="feature-description">
              Tailored meal plans and recipes designed to complement your fitness goals.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <h3 class="feature-title">Progress Tracking</h3>
            <p class="feature-description">
              Visual dashboards to monitor your progress and celebrate your achievements.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="testimonials-section">
      <div class="container">
        <h2 class="section-title">Member Success Stories</h2>
        
        <div class="testimonials-carousel">
          <div class="testimonial-card">
            <div class="testimonial-quote">
              <i class="fas fa-quote-left"></i>
              <p>
                FitCoach AI completely transformed my approach to fitness. The personalized workouts and constant feedback kept me motivated and on track.
              </p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="author-info">
                <h4>Alex Johnson</h4>
                <p>Lost 25 pounds in 3 months</p>
              </div>
            </div>
          </div>
          
          <div class="testimonial-card">
            <div class="testimonial-quote">
              <i class="fas fa-quote-left"></i>
              <p>
                Having a 24/7 AI coach is like having a personal trainer in my pocket. I can get advice, adjust my workout, or check my form anytime.
              </p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="author-info">
                <h4>Sarah Miller</h4>
                <p>Improved strength by 40%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to start your fitness journey?</h2>
          <p>
            Join thousands of members who have achieved their fitness goals with FitCoach AI.
          </p>
          <router-link to="/signup" class="btn btn-primary btn-lg">
            Start Your Free Trial
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  metaInfo: {
    title: 'FitCoach AI - Your Personal Fitness Assistant'
  }
};
</script>

<style scoped>
.home-page {
  padding-top: 0;
}

/* Hero Section */
.hero-section {
  padding: var(--spacing-xxl) 0;
  background: linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(33,150,243,0.1) 100%);
}

.hero-section .container {
  display: flex;
  align-items: center;
  gap: var(--spacing-xxl);
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
  line-height: 1.2;
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
  line-height: 1.5;
}

.hero-cta {
  display: flex;
  gap: var(--spacing-md);
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-placeholder {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1/1;
  background-color: rgba(76,175,80,0.1);
  border-radius: var(--border-radius-lg);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 5rem;
  color: var(--primary-color);
}

/* Features Section */
.features-section {
  padding: var(--spacing-xxl) 0;
  background-color: var(--background-color);
}

.section-title {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  font-weight: 600;
  color: var(--text-color);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.feature-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  background-color: rgba(76,175,80,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.feature-title {
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Testimonials Section */
.testimonials-section {
  padding: var(--spacing-xxl) 0;
  background-color: rgba(76,175,80,0.05);
}

.testimonials-carousel {
  display: flex;
  gap: var(--spacing-lg);
  overflow-x: auto;
  padding: var(--spacing-md) 0;
  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.testimonials-carousel::-webkit-scrollbar {
  display: none;
}

.testimonial-card {
  flex: 0 0 auto;
  width: calc(50% - var(--spacing-lg));
  min-width: 300px;
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.testimonial-quote {
  margin-bottom: var(--spacing-md);
}

.testimonial-quote i {
  font-size: 1.5rem;
  color: var(--primary-light);
  margin-bottom: var(--spacing-sm);
}

.testimonial-quote p {
  font-style: italic;
  line-height: 1.6;
  color: var(--text-color);
}

.testimonial-author {
  display: flex;
  align-items: center;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: var(--spacing-sm);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(76,175,80,0.1);
  color: var(--primary-color);
  font-size: 1.5rem;
}

.author-info h4 {
  margin: 0;
  font-weight: 600;
}

.author-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* CTA Section */
.cta-section {
  padding: var(--spacing-xxl) 0;
  background: linear-gradient(135deg, rgba(76,175,80,0.9) 0%, rgba(33,150,243,0.9) 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
  color: white;
}

.cta-content p {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-lg);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-content .btn {
  background-color: white;
  color: var(--primary-color);
  border-color: white;
}

.cta-content .btn:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

/* Responsive adjustments */
@media (max-width: 991px) {
  .hero-section .container {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-cta {
    justify-content: center;
  }
  
  .image-placeholder {
    margin-top: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: var(--font-size-md);
  }
  
  .testimonial-card {
    width: 100%;
  }
  
  .hero-cta {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .hero-cta .btn {
    width: 100%;
  }
}
</style>

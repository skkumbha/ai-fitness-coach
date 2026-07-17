<template>
  <div class="home-page">
    <FitBotHomeIntro />

    <section class="features-section">
      <div class="container">
        <h2 class="section-title">What FitBot actually does</h2>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-comments"></i></div>
            <h3 class="feature-title">Talks like a human</h3>
            <p class="feature-description">
              Onboarding feels like a chat, not a tax form. Same energy in the coach chat after you're in.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-dumbbell"></i></div>
            <h3 class="feature-title">Daily workouts</h3>
            <p class="feature-description">
              Plans built for your goals, schedule, and timezone — with reminders when you said you'd show up.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon"><i class="fab fa-telegram-plane"></i></div>
            <h3 class="feature-title">Telegram too</h3>
            <p class="feature-description">
              Link Telegram in profile and get nudges on your phone. FitBot follows you everywhere. You asked for this.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-chart-line"></i></div>
            <h3 class="feature-title">Track progress</h3>
            <p class="feature-description">
              Dashboard shows today's plan, check-ins, and weekly activity — real data, not demo fluff.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import FitBotHomeIntro from '@/components/FitBotHomeIntro.vue';

export default {
  name: 'HomePage',
  components: {
    FitBotHomeIntro
  },
  metaInfo: {
    title: 'FitCoach AI - Meet FitBot'
  }
};
</script>

<style scoped>
.home-page {
  padding-top: 0;
}

.features-section {
  padding: var(--spacing-xxl) 0;
  background-color: var(--background-color);
}

.section-title {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  font-weight: 600;
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
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  background-color: rgba(76, 175, 80, 0.1);
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
</style>

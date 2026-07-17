<template>
  <section class="fitbot-intro">
    <div class="container intro-layout">
      <div class="intro-chat">
        <div class="intro-header">
          <div class="intro-avatar">🤖</div>
          <div>
            <h2 class="intro-name">FitBot</h2>
            <p class="intro-tagline">Unnamed by creator. Overqualified for small talk.</p>
          </div>
        </div>

        <div class="intro-messages">
          <div
            v-for="(line, index) in visibleLines"
            :key="index"
            class="intro-bubble"
          >
            {{ line }}
          </div>
          <div v-if="isTyping" class="intro-bubble typing">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div v-if="introComplete" class="intro-actions">
          <router-link to="/login" class="btn btn-outline btn-lg">
            I have an account — log in
          </router-link>
          <router-link to="/signup" class="btn btn-primary btn-lg">
            I'm new — let's go
          </router-link>
        </div>
      </div>

      <div class="intro-aside">
        <p class="aside-text">
          No boring forms on the home page. Sign up, then FitBot walks you through setup one question at a time — like texting a coach who won't shut up about protein.
        </p>
      </div>
    </div>
  </section>
</template>

<script>
import { HOME_INTRO_LINES } from '@/config/fitbotOnboardingScript';

export default {
  name: 'FitBotHomeIntro',
  data() {
    return {
      visibleLines: [],
      lineIndex: 0,
      isTyping: false,
      introComplete: false
    };
  },
  mounted() {
    this.playIntro();
  },
  methods: {
    async playIntro() {
      for (let i = 0; i < HOME_INTRO_LINES.length; i++) {
        this.isTyping = true;
        await this.delay(700);
        this.isTyping = false;
        this.visibleLines.push(HOME_INTRO_LINES[i]);
        await this.delay(300);
      }
      this.introComplete = true;
    },
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }
};
</script>

<style scoped>
.fitbot-intro {
  padding: var(--spacing-xl) 0;
}

.intro-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--spacing-xl);
  align-items: start;
}

.intro-chat {
  background: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
}

.intro-header {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.intro-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.intro-name {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
}

.intro-tagline {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.intro-messages {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-height: 200px;
  margin-bottom: var(--spacing-lg);
}

.intro-bubble {
  align-self: flex-start;
  max-width: 95%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(76, 175, 80, 0.1);
  border-radius: 16px 16px 16px 4px;
  line-height: 1.5;
  animation: fadeIn 0.35s ease;
}

.intro-bubble.typing {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.intro-bubble.typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.5;
  animation: bounce 1.2s infinite;
}

.intro-bubble.typing span:nth-child(2) { animation-delay: 0.15s; }
.intro-bubble.typing span:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.intro-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.intro-aside {
  padding-top: var(--spacing-md);
}

.aside-text {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: var(--font-size-md);
}

@media (max-width: 768px) {
  .intro-layout {
    grid-template-columns: 1fr;
  }

  .intro-aside {
    order: -1;
    padding-top: 0;
  }
}
</style>

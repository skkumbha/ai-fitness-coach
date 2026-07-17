<template>
  <div class="onboarding-page">
    <div class="onboarding-container">
      <FitBotOnboardingChat
        :form-data="formData"
        :loading="loading"
        :first-name="firstName"
        @update:form-data="formData = $event"
        @complete="submitOnboarding"
      />
    </div>

    <transition name="fade">
      <div v-if="errorMessage" class="error-banner">
        <div class="error-content">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ errorMessage }}</span>
        </div>
        <button type="button" @click="errorMessage = ''" class="error-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import FitBotOnboardingChat from '@/components/FitBotOnboardingChat.vue';
import { createInitialFormData } from '@/config/fitbotOnboardingScript';
import { mapState } from 'vuex';

export default {
  name: 'OnboardingPage',
  components: {
    FitBotOnboardingChat
  },
  data() {
    return {
      formData: createInitialFormData(),
      loading: false,
      errorMessage: ''
    };
  },
  computed: {
    ...mapState(['user']),
    firstName() {
      return this.user?.firstName || '';
    }
  },
  mounted() {
    if (this.firstName && !this.formData.preferredName) {
      this.formData.preferredName = this.firstName;
    }
  },
  methods: {
    async submitOnboarding() {
      if (this.loading) return;

      this.loading = true;
      this.errorMessage = '';

      const { preferredName, heightUnit, heightFeetDisplay, heightInchesDisplay, ...payload } =
        this.formData;

      try {
        await this.$store.dispatch('submitOnboarding', payload);
        await this.$nextTick();
        this.$router.push({ name: 'dashboard' });
      } catch (error) {
        this.errorMessage = error.message || 'Failed to complete onboarding. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.onboarding-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%);
  padding: var(--spacing-lg) 0;
}

.onboarding-container {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.error-banner {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(244, 67, 54, 0.9);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  z-index: var(--z-index-toast);
  min-width: 300px;
  max-width: 90%;
}

.error-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.error-content i {
  margin-right: var(--spacing-sm);
}

.error-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  margin-left: var(--spacing-sm);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>

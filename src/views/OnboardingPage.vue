<template>
  <div class="onboarding-page">
    <div class="onboarding-container">
      <div class="onboarding-progress">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="progress-step"
          :class="{ 
            'completed': currentStep > index, 
            'active': currentStep === index
          }"
        >
          <div class="step-indicator">
            <span v-if="currentStep > index" class="step-check">
              <i class="fas fa-check"></i>
            </span>
            <span v-else class="step-number">{{ index + 1 }}</span>
          </div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>
      
      <div class="onboarding-card">
        <div class="card-header">
          <h2 class="card-title">{{ steps[currentStep].title }}</h2>
          <p class="card-subtitle">{{ steps[currentStep].subtitle }}</p>
        </div>
        
        <div class="card-body">
          <!-- Onboarding Form Component -->
          <OnboardingForm 
            :step="currentStep" 
            :form-data="formData" 
            @update:form="updateFormData"
          />
        </div>
        
        <div class="card-footer">
          <button 
            v-if="currentStep > 0" 
            @click="prevStep"
            class="btn btn-outline"
            :disabled="loading"
          >
            <i class="fas fa-arrow-left"></i> Back
          </button>
          
          <button 
            v-if="currentStep < steps.length - 1" 
            @click="nextStep"
            class="btn btn-primary"
            :disabled="loading || !isStepValid"
          >
            Next <i class="fas fa-arrow-right"></i>
          </button>
          
          <button 
            v-else 
            @click="submitOnboarding"
            class="btn btn-primary"
            :disabled="loading || !isStepValid"
          >
            <span v-if="loading">
              <i class="fas fa-circle-notch fa-spin"></i> Processing...
            </span>
            <span v-else>
              <i class="fas fa-check"></i> Complete Setup
            </span>
          </button>
        </div>
      </div>
    </div>
    
    <transition name="fade">
      <div v-if="errorMessage" class="error-banner">
        <div class="error-content">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ errorMessage }}</span>
        </div>
        <button @click="errorMessage = ''" class="error-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import OnboardingForm from '@/components/OnboardingForm.vue';

export default {
  name: 'OnboardingPage',
  components: {
    OnboardingForm
  },
  data() {
    return {
      currentStep: 0,
      loading: false,
      errorMessage: '',
      formData: {
        // Basic Info
        gender: '',
        birthdate: '',
        height: '',
        weight: '',
        
        // Fitness Level & Goals
        fitnessLevel: '',
        primaryGoal: '',
        targetWeight: '',
        weeklyWorkouts: '',
        
        // Preferences
        workoutPreferences: [],
        dietaryRestrictions: [],
        workoutLocation: '',
        
        // Schedule
        preferredTimes: [],
        availableDays: [],
        sessionDuration: '',
      },
      steps: [
        {
          label: 'Basic Info',
          title: 'Tell Us About Yourself',
          subtitle: 'We\'ll use this information to personalize your fitness experience'
        },
        {
          label: 'Fitness Goals',
          title: 'Set Your Fitness Goals',
          subtitle: 'Let us know what you want to achieve with FitCoach AI'
        },
        {
          label: 'Preferences',
          title: 'Your Workout Preferences',
          subtitle: 'Help us tailor recommendations to your preferences'
        },
        {
          label: 'Schedule',
          title: 'Plan Your Week',
          subtitle: 'Set up your workout schedule to stay consistent'
        }
      ]
    };
  },
  computed: {
    isStepValid() {
      // Validate current step based on step number
      switch (this.currentStep) {
        case 0: // Basic Info
          return this.formData.gender && 
                 this.formData.birthdate && 
                 this.formData.height && 
                 this.formData.weight;
        
        case 1: // Fitness Goals
          return this.formData.fitnessLevel && 
                 this.formData.primaryGoal && 
                 this.formData.weeklyWorkouts;
        
        case 2: // Preferences
          return this.formData.workoutPreferences.length > 0 && 
                 this.formData.workoutLocation;
        
        case 3: // Schedule
          return this.formData.availableDays.length > 0 && 
                 this.formData.sessionDuration;
        
        default:
          return true;
      }
    }
  },
  methods: {
    updateFormData(data) {
      this.formData = { ...this.formData, ...data };
    },
    
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep += 1;
        window.scrollTo(0, 0);
      }
    },
    
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep -= 1;
        window.scrollTo(0, 0);
      }
    },
    
    async submitOnboarding() {
      if (!this.isStepValid) return;
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        await this.$store.dispatch('submitOnboarding', this.formData);
        
        // Redirect to dashboard after successful onboarding
        this.$router.push('/dashboard');
      } catch (error) {
        this.errorMessage = error.message || 'Failed to complete onboarding. Please try again.';
        window.scrollTo(0, 0);
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
  background: linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(33,150,243,0.1) 100%);
  padding: var(--spacing-lg) 0;
}

.onboarding-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.onboarding-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.onboarding-progress::before {
  content: '';
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--border-color);
  z-index: 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--card-background);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.step-number, .step-check {
  font-weight: 600;
  color: var(--text-secondary);
}

.progress-step.completed .step-indicator {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.progress-step.completed .step-check {
  color: white;
}

.progress-step.active .step-indicator {
  border-color: var(--primary-color);
  background-color: white;
}

.progress-step.active .step-number {
  color: var(--primary-color);
}

.step-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
  transition: color var(--transition-normal);
}

.progress-step.active .step-label,
.progress-step.completed .step-label {
  color: var(--primary-color);
}

.onboarding-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
}

.card-header {
  padding: var(--spacing-lg);
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

.card-subtitle {
  color: var(--text-secondary);
  margin-bottom: 0;
}

.card-body {
  padding: var(--spacing-lg);
}

.card-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: var(--spacing-sm);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

@media (max-width: 768px) {
  .step-label {
    display: none;
  }
  
  .card-footer {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .card-footer button {
    width: 100%;
  }
  
  .card-footer button:first-child {
    order: 2;
  }
}

@media (max-width: 576px) {
  .onboarding-page {
    padding: var(--spacing-md) 0;
  }
  
  .onboarding-card {
    border-radius: 0;
    box-shadow: none;
  }
  
  .card-header, .card-body, .card-footer {
    padding: var(--spacing-md);
  }
}
</style>

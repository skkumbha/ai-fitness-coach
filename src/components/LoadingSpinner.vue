<template>
  <div class="loading-spinner" :class="{ overlay: overlay, small: size === 'small', large: size === 'large' }">
    <div class="spinner-container">
      <div class="spinner"></div>
      <p v-if="message" class="spinner-message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    overlay: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
  }
};
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.loading-spinner.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: var(--z-index-modal);
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(76, 175, 80, 0.2);
  border-top-color: var(--primary-color);
  animation: spin 1s infinite linear;
}

.loading-spinner.small .spinner {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.loading-spinner.large .spinner {
  width: 64px;
  height: 64px;
  border-width: 4px;
}

.spinner-message {
  margin-top: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  text-align: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

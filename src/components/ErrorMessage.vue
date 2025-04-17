<template>
  <div class="error-message" :class="{ 'error-banner': type === 'banner' }">
    <div class="error-icon">
      <i class="fas fa-exclamation-circle"></i>
    </div>
    <div class="error-content">
      <h4 v-if="title" class="error-title">{{ title }}</h4>
      <p class="error-text">{{ message }}</p>
      <div v-if="showRetry" class="error-actions">
        <button @click="$emit('retry')" class="btn btn-primary btn-sm">
          <i class="fas fa-redo"></i> Try Again
        </button>
      </div>
    </div>
    <button 
      v-if="dismissible" 
      @click="$emit('dismiss')" 
      class="error-dismiss" 
      aria-label="Dismiss error"
    >
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ErrorMessage',
  props: {
    message: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'inline',
      validator: (value) => ['inline', 'banner'].includes(value)
    },
    showRetry: {
      type: Boolean,
      default: false
    },
    dismissible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['retry', 'dismiss']
};
</script>

<style scoped>
.error-message {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-md);
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 4px solid var(--error-color);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
}

.error-banner {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 2rem);
  max-width: 600px;
  z-index: var(--z-index-toast);
  box-shadow: var(--shadow-md);
  animation: slideDown 0.3s ease-out;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--error-color);
  font-size: var(--font-size-lg);
  margin-right: var(--spacing-sm);
}

.error-content {
  flex: 1;
}

.error-title {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-xs);
  color: var(--error-color);
}

.error-text {
  color: var(--text-color);
  margin: 0;
}

.error-actions {
  margin-top: var(--spacing-sm);
}

.error-dismiss {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-md);
  padding: var(--spacing-xs);
  transition: color var(--transition-fast);
}

.error-dismiss:hover {
  color: var(--error-color);
}

@keyframes slideDown {
  from {
    transform: translate(-50%, -20px);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}
</style>

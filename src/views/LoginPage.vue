<template>
  <div class="login-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <i class="fas fa-dumbbell"></i>
          </div>
          <h1 class="auth-title">Welcome Back!</h1>
          <p class="auth-subtitle">Login to your FitCoach AI account</p>
        </div>
        
        <div class="auth-body">
          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label for="userName" class="form-label">Username</label>
              <div class="input-with-icon">
                <i class="fas fa-user"></i>
                <input 
                  id="userName"
                  v-model="userName"
                  type="text"
                  class="form-control"
                  placeholder="Enter your username"
                  required
                  :disabled="loading"
                />
              </div>
              <div v-if="validationErrors.userName" class="error-message">
                {{ validationErrors.userName }}
              </div>
            </div>
            
            <div class="form-group">
              <div class="password-label-group">
                <label for="password" class="form-label">Password</label>
                <a @click.prevent="showPasswordReset = true" class="forgot-password">
                  Forgot password?
                </a>
              </div>
              <div class="input-with-icon">
                <i class="fas fa-lock"></i>
                <input 
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Enter your password"
                  required
                  :disabled="loading"
                />
                <button 
                  type="button" 
                  class="password-toggle" 
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="validationErrors.password" class="error-message">
                {{ validationErrors.password }}
              </div>
            </div>
            
            <div v-if="errorMessage" class="auth-error">
              <i class="fas fa-exclamation-circle"></i>
              {{ errorMessage }}
            </div>
            
            <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
              <span v-if="loading" class="btn-loader">
                <i class="fas fa-circle-notch fa-spin"></i>
              </span>
              <span v-else>Login</span>
            </button>
          </form>
        </div>
        
        <div class="auth-footer">
          <p>Don't have an account? <router-link to="/signup">Sign up</router-link></p>
        </div>
      </div>
    </div>
    
    <!-- Password Reset Modal -->
    <div v-if="showPasswordReset" class="modal-overlay" @click="showPasswordReset = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Reset Password</h3>
          <button class="modal-close" @click="showPasswordReset = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Enter your email address and we'll send you a link to reset your password.</p>
          <div class="form-group">
            <label for="resetEmail" class="form-label">Email Address</label>
            <input 
              id="resetEmail"
              v-model="resetEmail"
              type="email"
              class="form-control"
              placeholder="Enter your email"
              required
            />
          </div>
          <div v-if="resetError" class="error-message">
            {{ resetError }}
          </div>
          <div v-if="resetSuccess" class="success-message">
            {{ resetSuccess }}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showPasswordReset = false">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="sendPasswordReset"
            :disabled="resetLoading"
          >
            <span v-if="resetLoading">
              <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            <span v-else>Send Reset Link</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { requestPasswordReset } from '@/api/auth';

export default {
  name: 'LoginPage',
  data() {
    return {
      userName: '',
      password: '',
      showPassword: false,
      loading: false,
      errorMessage: '',
      validationErrors: {},
      
      // Password reset
      showPasswordReset: false,
      resetEmail: '',
      resetLoading: false,
      resetError: '',
      resetSuccess: ''
    };
  },
  computed: {
    // If there's a redirect query param, use it
    redirectPath() {
      return this.$route.query.redirect || '/dashboard';
    }
  },
  mounted() {
    // If user is already logged in, redirect
    if (this.$store.getters.isAuthenticated) {
      this.$router.push(this.redirectPath);
    }
  },
  methods: {
    validateForm() {
      this.validationErrors = {};
      let isValid = true;
      
      if (!this.userName) {
        this.validationErrors.userName = 'Username is required';
        isValid = false;
      } else if (this.userName.length < 3) {
        this.validationErrors.userName = 'Username must be at least 3 characters long';
        isValid = false;
      } else if (!/^[a-zA-Z0-9_-]+$/.test(this.userName)) {
        this.validationErrors.userName = 'Username can only contain letters, numbers, underscores, and hyphens';
        isValid = false;
      }
      
      if (!this.password) {
        this.validationErrors.password = 'Password is required';
        isValid = false;
      }
      
      return isValid;
    },
    
    async handleLogin() {
      if (!this.validateForm()) return;
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        await this.$store.dispatch('loginUser', {
          userName: this.userName,
          password: this.password
        });
        
        // Redirect to dashboard or requested page
        this.$router.push(this.redirectPath);
      } catch (error) {
        // Display error message
        this.errorMessage = error.message || 'Failed to login. Please check your credentials.';
      } finally {
        this.loading = false;
      }
    },
    
    async sendPasswordReset() {
      if (!this.resetEmail) {
        this.resetError = 'Please enter your email address';
        return;
      }
      
      this.resetLoading = true;
      this.resetError = '';
      this.resetSuccess = '';
      
      try {
        await requestPasswordReset(this.resetEmail);
        this.resetSuccess = 'Password reset instructions have been sent to your email.';
        
        // Clear email field after successful request
        this.resetEmail = '';
        
        // Close modal after a delay
        setTimeout(() => {
          this.showPasswordReset = false;
          this.resetSuccess = '';
        }, 3000);
      } catch (error) {
        this.resetError = error.message || 'Failed to request password reset. Please try again.';
      } finally {
        this.resetLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(33,150,243,0.1) 100%);
}

.auth-container {
  width: 100%;
  max-width: 1200px;
  margin: auto;
  padding: var(--spacing-md);
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.auth-header {
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
  text-align: center;
  background: linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(33,150,243,0.1) 100%);
}

.auth-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  font-size: 1.5rem;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

.auth-subtitle {
  color: var(--text-secondary);
  margin-bottom: 0;
}

.auth-body {
  padding: var(--spacing-xl);
}

.auth-form .form-group {
  margin-bottom: var(--spacing-md);
}

.password-label-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.forgot-password {
  font-size: var(--font-size-sm);
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
}

.forgot-password:hover {
  text-decoration: underline;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.input-with-icon input {
  padding-left: 40px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.password-toggle:hover {
  color: var(--text-secondary);
}

.auth-error {
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: var(--border-radius-sm);
  color: var(--error-color);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
}

.auth-error i {
  margin-right: var(--spacing-xs);
}

.btn-loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.error-message {
  color: var(--error-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.success-message {
  color: var(--success-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.auth-footer {
  padding: 0 var(--spacing-xl) var(--spacing-xl);
  text-align: center;
}

.auth-footer p {
  margin: 0;
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-modal-backdrop);
}

.modal-container {
  width: 90%;
  max-width: 500px;
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-index-modal);
  overflow: hidden;
}

.modal-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: var(--text-color);
}

.modal-body {
  padding: var(--spacing-md);
}

.modal-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

@media (max-width: 576px) {
  .auth-card {
    box-shadow: none;
    border-radius: 0;
  }
  
  .auth-header {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md);
  }
  
  .auth-body, .auth-footer {
    padding: var(--spacing-md);
  }
}
</style>

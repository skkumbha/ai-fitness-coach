<template>
  <div class="signup-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <i class="fas fa-dumbbell"></i>
          </div>
          <h1 class="auth-title">Create Your Account</h1>
          <p class="auth-subtitle">Join FitCoach AI to start your fitness journey</p>
        </div>
        
        <div class="auth-body">
          <form @submit.prevent="handleSignup" class="auth-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName" class="form-label">First Name</label>
                <input 
                  id="firstName"
                  v-model="firstName"
                  type="text"
                  class="form-control"
                  placeholder="Enter first name"
                  required
                  :disabled="loading"
                />
                <div v-if="validationErrors.firstName" class="error-message">
                  {{ validationErrors.firstName }}
                </div>
              </div>
              
              <div class="form-group">
                <label for="lastName" class="form-label">Last Name</label>
                <input 
                  id="lastName"
                  v-model="lastName"
                  type="text"
                  class="form-control"
                  placeholder="Enter last name"
                  required
                  :disabled="loading"
                />
                <div v-if="validationErrors.lastName" class="error-message">
                  {{ validationErrors.lastName }}
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">Email Address</label>
              <div class="input-with-icon">
                <i class="fas fa-envelope"></i>
                <input 
                  id="email"
                  v-model="email"
                  type="email"
                  class="form-control"
                  placeholder="Enter your email"
                  required
                  :disabled="loading"
                />
              </div>
              <div v-if="validationErrors.email" class="error-message">
                {{ validationErrors.email }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="input-with-icon">
                <i class="fas fa-lock"></i>
                <input 
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Create a password"
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
              <div class="password-strength" v-if="password">
                <div class="strength-meter">
                  <div class="strength-bar" :style="{ width: `${passwordStrength.score * 25}%`, backgroundColor: passwordStrength.color }"></div>
                </div>
                <div class="strength-text" :style="{ color: passwordStrength.color }">
                  {{ passwordStrength.text }}
                </div>
              </div>
              <div v-if="validationErrors.password" class="error-message">
                {{ validationErrors.password }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <div class="input-with-icon">
                <i class="fas fa-lock"></i>
                <input 
                  id="confirmPassword"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Confirm your password"
                  required
                  :disabled="loading"
                />
                <button 
                  type="button" 
                  class="password-toggle" 
                  @click="showConfirmPassword = !showConfirmPassword"
                  tabindex="-1"
                >
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="validationErrors.confirmPassword" class="error-message">
                {{ validationErrors.confirmPassword }}
              </div>
            </div>
            
            <div class="form-group form-checkbox">
              <input 
                id="termsAgreed"
                v-model="termsAgreed"
                type="checkbox"
                required
                :disabled="loading"
              />
              <label for="termsAgreed">
                I agree to the <a href="#" @click.prevent="showTerms = true">Terms of Service</a> and <a href="#" @click.prevent="showPrivacy = true">Privacy Policy</a>
              </label>
              <div v-if="validationErrors.termsAgreed" class="error-message">
                {{ validationErrors.termsAgreed }}
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
              <span v-else>Create Account</span>
            </button>
          </form>
        </div>
        
        <div class="auth-footer">
          <p>Already have an account? <router-link to="/login">Login</router-link></p>
        </div>
      </div>
    </div>
    
    <!-- Terms & Privacy Modals -->
    <div v-if="showTerms" class="modal-overlay" @click="showTerms = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Terms of Service</h3>
          <button class="modal-close" @click="showTerms = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-content">
            <h4>1. Terms</h4>
            <p>By accessing FitCoach AI, you agree to be bound by these terms of service and agree that you are responsible for compliance with any applicable laws and regulations.</p>
            
            <h4>2. Use License</h4>
            <p>Permission is granted to temporarily use FitCoach AI for personal, non-commercial purposes. This is the grant of a license, not a transfer of title.</p>
            
            <h4>3. Disclaimer</h4>
            <p>The materials on FitCoach AI are provided on an 'as is' basis. FitCoach AI makes no warranties, expressed or implied, and hereby disclaims all other warranties.</p>
            
            <h4>4. Limitations</h4>
            <p>In no event shall FitCoach AI or its suppliers be liable for any damages arising out of the use or inability to use FitCoach AI materials.</p>
            
            <h4>5. Accuracy of Materials</h4>
            <p>FitCoach AI does not warrant that any of the materials on its website are accurate, complete or current. FitCoach AI may make changes to the materials at any time without notice.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="showTerms = false">I Understand</button>
        </div>
      </div>
    </div>
    
    <div v-if="showPrivacy" class="modal-overlay" @click="showPrivacy = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Privacy Policy</h3>
          <button class="modal-close" @click="showPrivacy = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-content">
            <h4>1. Information We Collect</h4>
            <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.</p>
            
            <h4>2. How We Use Information</h4>
            <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and personalize your experience.</p>
            
            <h4>3. Sharing Information</h4>
            <p>We do not share personal information with companies, organizations, or individuals outside of FitCoach AI except in the following cases: with your consent, with domain administrators, for legal reasons, or in the event of a business transfer.</p>
            
            <h4>4. Data Security</h4>
            <p>We work hard to protect FitCoach AI and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.</p>
            
            <h4>5. Changes</h4>
            <p>Our Privacy Policy may change from time to time. We will post any privacy policy changes on this page.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="showPrivacy = false">I Understand</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignupPage',
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAgreed: false,
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      errorMessage: '',
      validationErrors: {},
      showTerms: false,
      showPrivacy: false
    };
  },
  computed: {
    // Compute password strength based on length, complexity
    passwordStrength() {
      if (!this.password) {
        return { score: 0, text: '', color: '' };
      }
      
      let score = 0;
      let color = '';
      let text = '';
      
      // Length check
      if (this.password.length > 8) score += 1;
      if (this.password.length > 12) score += 1;
      
      // Complexity checks
      if (/[A-Z]/.test(this.password)) score += 1;
      if (/[0-9]/.test(this.password)) score += 1;
      if (/[^A-Za-z0-9]/.test(this.password)) score += 1;
      
      // Determine strength level
      if (score <= 2) {
        text = 'Weak';
        color = '#f44336';
      } else if (score <= 3) {
        text = 'Fair';
        color = '#ff9800';
      } else if (score <= 4) {
        text = 'Good';
        color = '#4caf50';
      } else {
        text = 'Strong';
        color = '#087f23';
      }
      
      return { score, text, color };
    }
  },
  mounted() {
    // If user is already logged in, redirect
    if (this.$store.getters.isAuthenticated) {
      this.$router.push('/dashboard');
    }
  },
  methods: {
    validateForm() {
      this.validationErrors = {};
      let isValid = true;
      
      // First name validation
      if (!this.firstName.trim()) {
        this.validationErrors.firstName = 'First name is required';
        isValid = false;
      }
      
      // Last name validation
      if (!this.lastName.trim()) {
        this.validationErrors.lastName = 'Last name is required';
        isValid = false;
      }
      
      // Email validation
      if (!this.email.trim()) {
        this.validationErrors.email = 'Email is required';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(this.email)) {
        this.validationErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
      
      // Password validation
      if (!this.password) {
        this.validationErrors.password = 'Password is required';
        isValid = false;
      } else if (this.password.length < 8) {
        this.validationErrors.password = 'Password must be at least 8 characters long';
        isValid = false;
      } else if (this.passwordStrength.score < 3) {
        this.validationErrors.password = 'Password is too weak';
        isValid = false;
      }
      
      // Confirm password validation
      if (this.password !== this.confirmPassword) {
        this.validationErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
      
      // Terms agreement validation
      if (!this.termsAgreed) {
        this.validationErrors.termsAgreed = 'You must agree to the Terms of Service and Privacy Policy';
        isValid = false;
      }
      
      return isValid;
    },
    
    async handleSignup() {
      if (!this.validateForm()) return;
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        // Create user data object
        const userData = {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password
        };
        
        // Dispatch signup action
        await this.$store.dispatch('signupUser', userData);
        
        // After successful signup, redirect to onboarding
        this.$router.push('/onboarding');
      } catch (error) {
        // Display error message
        this.errorMessage = error.message || 'Failed to create account. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.signup-page {
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
  max-width: 550px;
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

.form-row {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.auth-form .form-group {
  margin-bottom: var(--spacing-md);
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

.password-strength {
  margin-top: var(--spacing-xs);
}

.strength-meter {
  height: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.strength-bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-text {
  font-size: var(--font-size-xs);
  text-align: right;
}

.form-checkbox {
  display: flex;
  align-items: flex-start;
}

.form-checkbox input {
  margin-top: 4px;
  margin-right: var(--spacing-sm);
}

.form-checkbox label {
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.form-checkbox a {
  color: var(--primary-color);
  text-decoration: none;
}

.form-checkbox a:hover {
  text-decoration: underline;
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
  max-width: 600px;
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-index-modal);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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
  overflow-y: auto;
  flex: 1;
}

.modal-content h4 {
  margin: var(--spacing-md) 0 var(--spacing-sm);
  color: var(--text-color);
}

.modal-content h4:first-child {
  margin-top: 0;
}

.modal-content p {
  margin: 0 0 var(--spacing-md);
  color: var(--text-secondary);
  line-height: 1.5;
}

.modal-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-row .form-group {
    margin-bottom: var(--spacing-md);
  }
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

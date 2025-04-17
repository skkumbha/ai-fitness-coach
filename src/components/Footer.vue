<template>
  <footer class="footer">
    <div class="container footer-container">
      <div class="footer-content">
        <div class="footer-section brand">
          <router-link to="/" class="footer-brand">
            <i class="fas fa-dumbbell"></i>
            <span>FitCoach AI</span>
          </router-link>
          <p class="tagline">Your personal AI fitness coach, available 24/7.</p>
        </div>
        
        <div class="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li><router-link to="/dashboard">Dashboard</router-link></li>
            <li><router-link to="/workouts">Workouts</router-link></li>
            <li><router-link to="/nutrition">Nutrition</router-link></li>
            <li><router-link to="/chat">Coach Chat</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section support">
          <h4>Support</h4>
          <ul>
            <li><a href="#" @click.prevent="openHelpChat">Help & FAQ</a></li>
            <li><a href="#" @click.prevent="openPrivacyPolicy">Privacy Policy</a></li>
            <li><a href="#" @click.prevent="openTerms">Terms of Service</a></li>
            <li><a href="#" @click.prevent="openContact">Contact Us</a></li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} FitCoach AI. All rights reserved.</p>
        <div class="social-links">
          <a href="#" class="social-link" title="Facebook" aria-label="Facebook">
            <i class="fab fa-facebook"></i>
          </a>
          <a href="#" class="social-link" title="Twitter" aria-label="Twitter">
            <i class="fab fa-twitter"></i>
          </a>
          <a href="#" class="social-link" title="Instagram" aria-label="Instagram">
            <i class="fab fa-instagram"></i>
          </a>
          <a href="#" class="social-link" title="YouTube" aria-label="YouTube">
            <i class="fab fa-youtube"></i>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  },
  methods: {
    openHelpChat() {
      // Navigate to chat with help context
      this.$router.push({ 
        path: '/chat', 
        query: { topic: 'help' } 
      });
    },
    openPrivacyPolicy() {
      // Show privacy policy modal or navigate to page
      alert('Privacy Policy would open here');
    },
    openTerms() {
      // Show terms modal or navigate to page
      alert('Terms of Service would open here');
    },
    openContact() {
      // Show contact form modal or navigate to page
      alert('Contact form would open here');
    }
  }
};
</script>

<style scoped>
.footer {
  background-color: var(--card-background);
  color: var(--text-color);
  padding: var(--spacing-lg) 0;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.footer-section {
  flex: 1;
  min-width: 160px;
  margin-bottom: var(--spacing-md);
}

.footer-section.brand {
  flex: 2;
  min-width: 300px;
}

.footer-brand {
  display: flex;
  align-items: center;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  text-decoration: none;
}

.footer-brand i {
  margin-right: var(--spacing-xs);
}

.tagline {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.footer-section h4 {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: var(--spacing-xs);
}

.footer-section ul li a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-section ul li a:hover {
  color: var(--primary-color);
  text-decoration: none;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.social-links {
  display: flex;
  align-items: center;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: var(--spacing-xs);
  color: var(--text-secondary);
  border-radius: var(--border-radius-round);
  transition: all var(--transition-fast);
}

.social-link:hover {
  color: var(--primary-color);
  background-color: rgba(76, 175, 80, 0.1);
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
  }
  
  .footer-section {
    margin-bottom: var(--spacing-lg);
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
  
  .social-links {
    margin-top: var(--spacing-sm);
  }
}
</style>

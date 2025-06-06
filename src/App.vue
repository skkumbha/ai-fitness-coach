<template>
  <div id="app" class="app-container">
    <Navbar v-if="showNavigation" />
    <main class="main-content">
      <router-view />
    </main>
    <Footer v-if="showNavigation" />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  },
  computed: {
    showNavigation() {
      // Hide navigation on login, signup, and onboarding pages
      const hiddenRoutes = ['login', 'signup', 'onboarding'];
      return !hiddenRoutes.includes(this.$route.name);
    }
  },
  created() {
    // Check for stored auth token and set authenticated state if found
    const token = localStorage.getItem('token');
    if (token) {
      this.$store.commit('setToken', token);
      this.$store.dispatch('fetchUserProfile').catch(error => {
        console.error('Failed to fetch user profile:', error);
        // If profile fetch fails, clear the token
        this.$store.commit('setToken', null);
      });
    }
  }
};
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
}

.main-content {
  flex: 1;
  padding: 20px;
  margin-top: 60px; /* Adjust based on navbar height */
  margin-bottom: 60px; /* Adjust based on footer height */
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
}
</style>

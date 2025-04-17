<template>
  <header class="navbar">
    <div class="container navbar-container">
      <!-- Logo and brand -->
      <div class="navbar-brand">
        <router-link to="/dashboard" class="brand-link">
          <span class="brand-icon">
            <i class="fas fa-dumbbell"></i>
          </span>
          <span class="brand-name">FitCoach AI</span>
        </router-link>
      </div>
      
      <!-- Navigation links - desktop -->
      <nav class="navbar-nav d-md-flex d-none">
        <router-link 
          v-for="item in navItems" 
          :key="item.path" 
          :to="item.path" 
          class="nav-link"
          active-class="nav-link-active"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
      
      <!-- User menu dropdown -->
      <div class="navbar-user">
        <div class="user-menu" @click="toggleUserMenu">
          <div class="user-avatar" v-if="userAvatar">
            <img :src="userAvatar" alt="User avatar" />
          </div>
          <div class="user-avatar user-avatar-placeholder" v-else>
            <i class="fas fa-user"></i>
          </div>
          <span class="user-name d-md-inline d-none">{{ userName }}</span>
          <i class="fas fa-chevron-down ml-2"></i>
        </div>
        
        <!-- Dropdown menu -->
        <div class="user-dropdown" v-if="showUserMenu">
          <router-link to="/profile" class="dropdown-item">
            <i class="fas fa-user-circle"></i> Profile
          </router-link>
          <router-link to="/settings" class="dropdown-item">
            <i class="fas fa-cog"></i> Settings
          </router-link>
          <div class="dropdown-divider"></div>
          <button @click="logout" class="dropdown-item text-error">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
      
      <!-- Mobile menu toggle -->
      <button class="mobile-menu-toggle d-md-none" @click="toggleMobileMenu">
        <i class="fas" :class="showMobileMenu ? 'fa-times' : 'fa-bars'"></i>
      </button>
    </div>
    
    <!-- Mobile navigation menu -->
    <div class="mobile-menu" v-if="showMobileMenu">
      <router-link 
        v-for="item in navItems" 
        :key="item.path" 
        :to="item.path" 
        class="mobile-nav-link"
        active-class="mobile-nav-link-active"
        @click="showMobileMenu = false"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </router-link>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      showUserMenu: false,
      showMobileMenu: false,
      navItems: [
        { path: '/dashboard', label: 'Dashboard', icon: 'fas fa-home' },
        { path: '/workouts', label: 'Workouts', icon: 'fas fa-dumbbell' },
        { path: '/nutrition', label: 'Nutrition', icon: 'fas fa-utensils' },
        { path: '/chat', label: 'Coach Chat', icon: 'fas fa-comment-dots' }
      ]
    };
  },
  computed: {
    userName() {
      return this.$store.getters.currentUser?.name || 'User';
    },
    userAvatar() {
      return this.$store.getters.currentUser?.avatar || null;
    }
  },
  methods: {
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
      // Close mobile menu when user menu is opened
      if (this.showUserMenu) {
        this.showMobileMenu = false;
      }
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu;
      // Close user menu when mobile menu is opened
      if (this.showMobileMenu) {
        this.showUserMenu = false;
      }
    },
    logout() {
      this.$store.dispatch('logoutUser')
        .then(() => {
          this.$router.push('/login');
        })
        .catch(error => {
          console.error('Logout error:', error);
          // Still redirect to login even if there's an error
          this.$router.push('/login');
        });
    }
  },
  mounted() {
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showUserMenu = false;
        // Don't close mobile menu when clicking outside to avoid accidental closures
      }
    });
  }
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: var(--card-background);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-index-fixed);
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 var(--spacing-md);
  max-width: 1200px;
  margin: 0 auto;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
}

.brand-link:hover {
  text-decoration: none;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: var(--spacing-xs);
  color: var(--primary-color);
}

.navbar-nav {
  display: flex;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-color);
  font-weight: 500;
  text-decoration: none;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.nav-link i {
  margin-right: var(--spacing-xs);
}

.nav-link:hover {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
  text-decoration: none;
}

.nav-link-active {
  color: var(--primary-color);
  background-color: rgba(76, 175, 80, 0.1);
}

.navbar-user {
  position: relative;
}

.user-menu {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: background-color var(--transition-fast);
}

.user-menu:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-round);
  overflow: hidden;
  margin-right: var(--spacing-xs);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-light);
  color: white;
}

.user-name {
  font-weight: 500;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  width: 200px;
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  z-index: var(--z-index-dropdown);
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: background-color var(--transition-fast);
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.dropdown-item i {
  margin-right: var(--spacing-sm);
  width: 16px;
  text-align: center;
}

.dropdown-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  text-decoration: none;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-xs) 0;
}

.mobile-menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--text-color);
  font-size: var(--font-size-lg);
  cursor: pointer;
}

.mobile-menu {
  position: fixed;
  top: 60px;
  left: 0;
  width: 100%;
  background-color: var(--card-background);
  box-shadow: var(--shadow-md);
  z-index: var(--z-index-fixed);
  padding: var(--spacing-sm) 0;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: background-color var(--transition-fast);
}

.mobile-nav-link i {
  width: 24px;
  margin-right: var(--spacing-md);
  text-align: center;
}

.mobile-nav-link:hover,
.mobile-nav-link-active {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
}
</style>

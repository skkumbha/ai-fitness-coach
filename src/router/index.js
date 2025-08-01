import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';

// Import view components
import HomePage from '@/views/HomePage.vue';
import LoginPage from '@/views/LoginPage.vue';
import SignupPage from '@/views/SignupPage.vue';
import OnboardingPage from '@/views/OnboardingPage.vue';
import DashboardPage from '@/views/DashboardPage.vue';
import ChatPage from '@/views/ChatPage.vue';
import WorkoutHistoryPage from '@/views/WorkoutHistoryPage.vue';
import NutritionPage from '@/views/NutritionPage.vue';
import ProfilePage from '@/views/ProfilePage.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false, redirectIfAuth: true }
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupPage,
    meta: { requiresAuth: false, redirectIfAuth: true }
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: OnboardingPage,
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/workouts',
    name: 'workouts',
    component: WorkoutHistoryPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/nutrition',
    name: 'nutrition',
    component: NutritionPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Always scroll to top when changing routes
    return { top: 0 };
  }
});

// Navigation guard for auth-protected routes
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated;
  
  // If user is authenticated but we don't have their profile yet, fetch it first
  if (isAuthenticated && !store.state.user) {
    try {
      await store.dispatch('fetchUserProfile');
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If profile fetch fails, redirect to login
      store.dispatch('logoutUser');
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }
  }
  
  const hasCompletedOnboarding = store.getters.hasCompletedOnboarding;

  // Handle authentication requirements
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } 
  // Redirect logged in users away from login/signup
  else if (to.meta.redirectIfAuth && isAuthenticated) {
    next({ name: 'dashboard' });
  }
  // Handle onboarding requirement
  else if (isAuthenticated && !hasCompletedOnboarding && to.name !== 'onboarding' && to.name !== 'signup') {
    next({ name: 'onboarding' });
  }
  // Handle users who have already completed onboarding
  else if (isAuthenticated && hasCompletedOnboarding && to.meta.requiresOnboarding) {
    next({ name: 'dashboard' });
  }
  else {
    next();
  }
});

export default router;

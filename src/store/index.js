import { createStore } from 'vuex';
import { login, signup, logout } from '@/api/auth';
import { 
  getProfile, 
  updateProfile, 
  completeOnboarding 
} from '@/api/profile';
import { 
  getWorkoutHistory, 
  getWorkoutById,
  trackWorkoutCompletion 
} from '@/api/workouts';
import { 
  getMealSuggestions 
} from '@/api/nutrition';
import { 
  getChatHistory,
  sendChatMessage 
} from '@/api/chat';

export default createStore({
  state: {
    // Authentication
    token: null,
    isAuthenticated: false,
    
    // User data
    user: null,
    hasCompletedOnboarding: false,
    
    // Fitness data
    workouts: [],
    mealSuggestions: [],
    
    // Chat
    chatHistory: [],
    
    // UI state
    loading: false,
    error: null
  },
  
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    hasCompletedOnboarding: state => state.hasCompletedOnboarding,
    workoutHistory: state => state.workouts,
    mealSuggestions: state => state.mealSuggestions,
    chatHistory: state => state.chatHistory,
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    errorMessage: state => state.error
  },
  
  mutations: {
    // Auth mutations
    setToken(state, token) {
      state.token = token;
      state.isAuthenticated = !!token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    
    // User mutations
    setUser(state, user) {
      state.user = user;
      state.hasCompletedOnboarding = user ? user.onboardingCompleted : false;
    },
    
    // Workouts mutations
    setWorkouts(state, workouts) {
      state.workouts = workouts;
    },
    addWorkout(state, workout) {
      state.workouts.unshift(workout);
    },
    
    // Meal mutations
    setMealSuggestions(state, meals) {
      state.mealSuggestions = meals;
    },
    
    // Chat mutations
    setChatHistory(state, messages) {
      state.chatHistory = messages;
    },
    addChatMessage(state, message) {
      state.chatHistory.push(message);
    },
    
    // UI mutations
    setLoading(state, isLoading) {
      state.loading = isLoading;
    },
    setError(state, error) {
      state.error = error;
    },
    clearError(state) {
      state.error = null;
    }
  },
  
  actions: {
    // Auth actions
    async loginUser({ commit, dispatch }, { email, password }) {
      commit('setLoading', true);
      commit('clearError');
      
      try {
        const response = await login(email, password);
        commit('setToken', response.token);
        await dispatch('fetchUserProfile');
      } catch (error) {
        commit('setError', error.message || 'Failed to login');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async signupUser({ commit }, userData) {
      commit('setLoading', true);
      commit('clearError');
      
      try {
        const response = await signup(userData);
        commit('setToken', response.token);
        commit('setUser', response.user);
      } catch (error) {
        commit('setError', error.message || 'Failed to sign up');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async logoutUser({ commit }) {
      commit('setLoading', true);
      
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        commit('setToken', null);
        commit('setUser', null);
        commit('setWorkouts', []);
        commit('setMealSuggestions', []);
        commit('setChatHistory', []);
        commit('setLoading', false);
      }
    },
    
    // User profile actions
    async fetchUserProfile({ commit }) {
      commit('setLoading', true);
      
      try {
        const user = await getProfile();
        commit('setUser', user);
      } catch (error) {
        commit('setError', error.message || 'Failed to fetch user profile');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async updateUserProfile({ commit }, profileData) {
      commit('setLoading', true);
      commit('clearError');
      
      try {
        const updatedUser = await updateProfile(profileData);
        commit('setUser', updatedUser);
      } catch (error) {
        commit('setError', error.message || 'Failed to update profile');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async submitOnboarding({ commit }, onboardingData) {
      commit('setLoading', true);
      commit('clearError');
      
      try {
        const user = await completeOnboarding(onboardingData);
        commit('setUser', user);
      } catch (error) {
        commit('setError', error.message || 'Failed to complete onboarding');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    // Workout actions
    async fetchWorkoutHistory({ commit }) {
      commit('setLoading', true);
      
      try {
        const workouts = await getWorkoutHistory();
        commit('setWorkouts', workouts);
      } catch (error) {
        commit('setError', error.message || 'Failed to fetch workout history');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async completeWorkout({ commit }, workoutData) {
      commit('setLoading', true);
      
      try {
        const workout = await trackWorkoutCompletion(workoutData);
        commit('addWorkout', workout);
      } catch (error) {
        commit('setError', error.message || 'Failed to track workout');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    // Nutrition actions
    async fetchMealSuggestions({ commit }, preferences) {
      commit('setLoading', true);
      
      try {
        const meals = await getMealSuggestions(preferences);
        commit('setMealSuggestions', meals);
      } catch (error) {
        commit('setError', error.message || 'Failed to fetch meal suggestions');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    // Chat actions
    async fetchChatHistory({ commit }) {
      commit('setLoading', true);
      
      try {
        const messages = await getChatHistory();
        commit('setChatHistory', messages);
      } catch (error) {
        commit('setError', error.message || 'Failed to fetch chat history');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async sendMessage({ commit }, messageText) {
      commit('clearError');
      
      try {
        // Add user message to chat immediately for responsive UI
        const userMessage = {
          id: Date.now().toString(),
          sender: 'user',
          text: messageText,
          timestamp: new Date().toISOString()
        };
        commit('addChatMessage', userMessage);
        
        // Send message to API and get AI response
        const response = await sendChatMessage(messageText);
        
        commit('addChatMessage', {
          id: response.id,
          sender: 'assistant',
          text: response.text,
          timestamp: response.timestamp
        });
        
        return response;
      } catch (error) {
        commit('setError', error.message || 'Failed to send message');
        throw error;
      }
    }
  }
});

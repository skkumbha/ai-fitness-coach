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
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    
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
      console.log('🔵 [Store] Setting token in store and localStorage');
      state.token = token;
      state.isAuthenticated = !!token;
      if (token) {
        localStorage.setItem('token', token);
        console.log('✅ [Store] Token stored in localStorage');
      } else {
        localStorage.removeItem('token');
        console.log('✅ [Store] Token removed from localStorage');
      }
      console.log('✅ [Store] Authentication state:', state.isAuthenticated);
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
    updateMessageStatus(state, { messageId, status }) {
      const message = state.chatHistory.find(m => m.id === messageId);
      if (message) {
        message.status = status;
      }
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
    },
    setOnboardingCompleted(state, completed) {
      state.hasCompletedOnboarding = completed;
    }
  },
  
  actions: {
    // Auth actions
    async loginUser({ commit, dispatch }, { userName, password }) {
      commit('setLoading', true);
      commit('clearError');
      
      try {
        const response = await login(userName, password);
        commit('setToken', response.token);
        await dispatch('fetchUserProfile');
      } catch (error) {
        commit('setError', error.message || 'Failed to login');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async signupUser({ commit, dispatch }, userData) {
      commit('setLoading', true);
      commit('clearError');
      
      try {
        console.log('🔵 [Store] Starting signup process...');
        const response = await signup(userData);
        console.log('✅ [Store] Signup successful, response:', response);
        
        console.log('🔵 [Store] Setting token...');
        commit('setToken', response.token);
        console.log('✅ [Store] Token set in store and localStorage');
        
        console.log('🔵 [Store] Starting profile fetch...');
        await dispatch('fetchUserProfile');
        console.log('✅ [Store] Profile fetch completed');
        
        return response;
      } catch (error) {
        console.error('❌ [Store] Signup error:', error);
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
    async fetchUserProfile({ commit, state }) {
      commit('setLoading', true);
      
      try {
        console.log('🔵 [Store] Fetching user profile...');
        console.log('🔵 [Store] Current token:', state.token);
        
        const user = await getProfile();
        console.log('✅ [Store] Profile data received:', user);
        
        commit('setUser', user);
        console.log('✅ [Store] User data set in store');
      } catch (error) {
        console.error('❌ [Store] Profile fetch error:', error);
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
        commit('setOnboardingCompleted', true);
        return user;
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
          timestamp: new Date().toISOString(),
          status: 'sent' // Initial status
        };
        commit('addChatMessage', userMessage);
        
        // Send message to API and get AI response
        const response = await sendChatMessage(messageText);
        
        // Update status to acknowledged after successful backend response
        commit('updateMessageStatus', { messageId: userMessage.id, status: 'acknowledged' });
        
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

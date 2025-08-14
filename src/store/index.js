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
import { generateMessageId } from '@/utils/messageUtils';
import ChatWebSocket from '@/services/websocket';

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
    
    // WebSocket
    websocket: null,
    isWebSocketConnected: false,
    typingIndicators: {},
    
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
    errorMessage: state => state.error,
    messageExists: (state) => (identifier) => state.chatHistory.some(m => 
      m.id === identifier || m.idempotencyKey === identifier
    ),
    // WebSocket getters
    isWebSocketConnected: state => state.isWebSocketConnected,
    websocket: state => state.websocket,
    typingIndicators: state => state.typingIndicators
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
      // Validate message structure
      if (!message || typeof message !== 'object') {
        return;
      }
      
      // Ensure message has required fields
      const validatedMessage = {
        id: message.id || generateMessageId('msg'),
        sender: message.sender || 'assistant',
        text: message.text || message.message || 'No message content',
        timestamp: message.timestamp || new Date().toISOString(),
        status: message.status || 'received',
        ...message // Keep any additional fields
      };
      
      // Check if message with this ID or idempotency key already exists (idempotency)
      const existingMessage = state.chatHistory.find(m => 
        m.id === validatedMessage.id || 
        (validatedMessage.idempotencyKey && m.idempotencyKey === validatedMessage.idempotencyKey)
      );
      
      if (!existingMessage) {
        state.chatHistory.push(validatedMessage);
        
        // Stop typing indicator when a message is received from the same sender
        if (validatedMessage.sender === 'assistant' && state.typingIndicators.assistant) {
          delete state.typingIndicators.assistant;
        }
      }
    },
    updateMessageStatus(state, { messageId, status }) {
      const message = state.chatHistory.find(m => m.id === messageId);
      if (message) {
        message.status = status;
      }
    },
    updateMessageId(state, { oldId, newId }) {
      const message = state.chatHistory.find(m => m.id === oldId);
      if (message) {
        message.id = newId;
      }
    },
    
    // WebSocket mutations
    setWebSocket(state, websocket) {
      state.websocket = websocket;
    },
    setWebSocketConnected(state, isConnected) {
      state.isWebSocketConnected = isConnected;
    },
    setTypingIndicator(state, { userId, isTyping }) {
      if (isTyping) {
        state.typingIndicators[userId] = isTyping;
      } else {
        delete state.typingIndicators[userId];
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
        
        // Initialize WebSocket after successful login
        await dispatch('initializeWebSocket');
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
        const response = await signup(userData);
        commit('setToken', response.token);
        await dispatch('fetchUserProfile');
        
        // Initialize WebSocket after successful signup
        await dispatch('initializeWebSocket');
        
        return response;
      } catch (error) {
        commit('setError', error.message || 'Failed to sign up');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async logoutUser({ commit, dispatch }) {
      commit('setLoading', true);
      
      try {
        // Disconnect WebSocket first
        await dispatch('disconnectWebSocket');
        
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
    
    async sendMessage({ commit, state, dispatch }, messageText) {
      commit('clearError');
      try {
        const idempotencyKey = generateMessageId('msg');
        const userMessage = {
          id: idempotencyKey, sender: 'user', text: messageText,
          timestamp: new Date().toISOString(), status: 'sent', idempotencyKey: idempotencyKey
        };
        commit('addChatMessage', userMessage);
        
        if (state.websocket && state.isWebSocketConnected) {
          const success = state.websocket.send({ 
            type: 'CHAT_MESSAGE', 
            message: messageText, 
            idempotencyKey: idempotencyKey 
          });
          
          if (success) {
            commit('updateMessageStatus', { messageId: userMessage.id, status: 'sent' });
            return { success: true, message: 'Message sent via WebSocket' };
          }
        }
        
        // Fallback to REST API
        const response = await sendChatMessage(messageText, idempotencyKey);
        commit('updateMessageStatus', { messageId: userMessage.id, status: 'acknowledged' });
        commit('updateMessageId', { oldId: userMessage.id, newId: response.id });
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
    },
    
    // Retry sending a message with idempotency protection
    async retryMessage({ commit, state, dispatch }, { idempotencyKey, messageText }) {
      // Check if message already exists and was successful
      const existingMessage = state.chatHistory.find(m => 
        m.idempotencyKey === idempotencyKey || m.id === idempotencyKey
      );
      
      if (existingMessage && existingMessage.status === 'acknowledged') {
        return existingMessage;
      }
      
      // If message exists but failed, update its status
      if (existingMessage) {
        commit('updateMessageStatus', { messageId: existingMessage.id, status: 'sent' });
      }
      
      // Retry sending the message
      return await dispatch('sendMessage', messageText);
    },
    
    // WebSocket actions
    initializeWebSocket({ commit, state }) {
      if (!state.token) {
        return;
      }
      
      try {
        const websocket = new ChatWebSocket(state.token);
        commit('setWebSocket', websocket);
        
        // Connect to WebSocket
        websocket.connect();
      } catch (error) {
        commit('setError', 'Failed to initialize WebSocket connection');
      }
    },
    
    disconnectWebSocket({ commit, state }) {
      if (state.websocket) {
        state.websocket.disconnect();
        commit('setWebSocket', null);
        commit('setWebSocketConnected', false);
      }
    },
    
    sendTypingIndicator({ state }, isTyping) {
      if (state.websocket && state.isWebSocketConnected) {
        state.websocket.send({
          type: 'TYPING_INDICATOR',
          isTyping: isTyping
        });
      }
    }
  }
});

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
      console.log('📝 [Store] Adding chat message:', message);
      console.log('📝 [Store] Current chatHistory length before:', state.chatHistory.length);
      
      // Validate message structure
      if (!message || typeof message !== 'object') {
        console.error('❌ [Store] Invalid message format:', message);
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
      
      console.log('📝 [Store] Validated message:', validatedMessage);
      
      // Check if message with this ID or idempotency key already exists (idempotency)
      const existingMessage = state.chatHistory.find(m => 
        m.id === validatedMessage.id || 
        (validatedMessage.idempotencyKey && m.idempotencyKey === validatedMessage.idempotencyKey)
      );
      
      if (!existingMessage) {
        state.chatHistory.push(validatedMessage);
        console.log('✅ [Store] Message added successfully, new length:', state.chatHistory.length);
        
        // Stop typing indicator when a message is received from the same sender
        if (validatedMessage.sender === 'assistant' && state.typingIndicators.assistant) {
          console.log('⌨️ [Store] Stopping typing indicator for assistant after message received');
          delete state.typingIndicators.assistant;
        }
      } else {
        console.log('🔄 [Store] Duplicate message detected, skipping:', validatedMessage.id || validatedMessage.idempotencyKey);
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
      console.log('⌨️ [Store] Setting typing indicator:', { userId, isTyping });
      if (isTyping) {
        state.typingIndicators[userId] = isTyping;
      } else {
        delete state.typingIndicators[userId];
      }
      console.log('⌨️ [Store] Current typing indicators:', state.typingIndicators);
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
        console.log('🔵 [Store] Starting signup process...');
        const response = await signup(userData);
        console.log('✅ [Store] Signup successful, response:', response);
        
        console.log('🔵 [Store] Setting token...');
        commit('setToken', response.token);
        console.log('✅ [Store] Token set in store and localStorage');
        
        console.log('🔵 [Store] Starting profile fetch...');
        await dispatch('fetchUserProfile');
        console.log('✅ [Store] Profile fetch completed');
        
        // Initialize WebSocket after successful signup
        await dispatch('initializeWebSocket');
        
        return response;
      } catch (error) {
        console.error('❌ [Store] Signup error:', error);
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
    
    async sendMessage({ commit, state, dispatch }, messageText) {
      commit('clearError');
      try {
        const idempotencyKey = generateMessageId('msg');
        const userMessage = {
          id: idempotencyKey, sender: 'user', text: messageText,
          timestamp: new Date().toISOString(), status: 'sent', idempotencyKey: idempotencyKey
        };
        commit('addChatMessage', userMessage);
        
        // Debug WebSocket state
        console.log('🔍 [Store] WebSocket state check:', {
          hasWebSocket: !!state.websocket,
          isConnected: state.isWebSocketConnected,
          websocketState: state.websocket ? state.websocket.getConnectionStatus() : 'NO_WEBSOCKET'
        });
        
        if (state.websocket && state.isWebSocketConnected) {
          console.log('🌐 [Store] Sending message via WebSocket');
          const success = state.websocket.send({ 
            type: 'CHAT_MESSAGE', 
            message: messageText, 
            idempotencyKey: idempotencyKey 
          });
          
          if (success) {
            commit('updateMessageStatus', { messageId: userMessage.id, status: 'sent' });
            return { success: true, message: 'Message sent via WebSocket' };
          } else {
            console.warn('⚠️ [Store] WebSocket send failed, falling back to REST API');
          }
        }
        
        // Fallback to REST API
        console.log('🌐 [Store] Using REST API fallback');
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
        console.log('🔄 [Store] Message already processed successfully, skipping retry:', idempotencyKey);
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
        console.warn('⚠️ [Store] Cannot initialize WebSocket: no token available');
        return;
      }
      
      try {
        console.log('🔌 [Store] Initializing WebSocket connection');
        console.log('🔍 [Store] Current token:', state.token ? 'Present' : 'Missing');
        
        const websocket = new ChatWebSocket(state.token);
        commit('setWebSocket', websocket);
        
        // Connect to WebSocket
        websocket.connect();
        
        console.log('✅ [Store] WebSocket initialized successfully');
      } catch (error) {
        console.error('❌ [Store] Failed to initialize WebSocket:', error);
        commit('setError', 'Failed to initialize WebSocket connection');
      }
    },
    
    disconnectWebSocket({ commit, state }) {
      if (state.websocket) {
        console.log('🔌 [Store] Disconnecting WebSocket');
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

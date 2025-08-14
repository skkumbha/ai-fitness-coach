import store from '@/store';
import { generateMessageId } from '@/utils/messageUtils';

/**
 * WebSocket service for real-time chat communication
 * Handles connection, authentication, message handling, and reconnection
 */
class ChatWebSocket {
  constructor(token) {
    this.token = token;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.reconnectTimer = null;
    this.tokenRefreshTimer = null; // Timer for token refresh acknowledgment
    this.isIntentionalClose = false;
    
    // Bind methods to preserve context
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  /**
   * Establish WebSocket connection
   */
  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('🔌 [WebSocket] Already connected');
      return;
    }

    try {
      // Determine WebSocket URL based on environment
      const wsUrl = this.getWebSocketUrl();
      
      this.socket = new WebSocket(wsUrl);
      this.setupEventHandlers();
      
      // Add connection timeout
      setTimeout(() => {
        if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
          this.socket.close();
          this.handleReconnect();
        }
      }, 10000);
      
    } catch (error) {
      this.handleReconnect();
    }
  }

  /**
   * Get WebSocket URL based on environment
   */
  getWebSocketUrl() {
    // Always use localhost:8080 for development, regardless of environment variables
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
      const url = 'ws://localhost:8080/ws';
      return url;
    } else {
      // Production: use secure WebSocket on same domain
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/ws`;
      return url;
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.socket.onopen = this.handleOpen;
    this.socket.onmessage = this.handleMessage;
    this.socket.onclose = this.handleClose;
    this.socket.onerror = this.handleError;
  }

  /**
   * Handle WebSocket connection open
   */
  handleOpen() {
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    
    // Update store connection status
    store.commit('setWebSocketConnected', true);
    
    // Authenticate with the server
    this.authenticate();
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      console.log('📨 [WebSocket] Raw message received:', event.data);
      const data = JSON.parse(event.data);
      console.log('📨 [WebSocket] Parsed message:', data);
      
      this.processMessage(data);
    } catch (error) {
      console.error('❌ [WebSocket] Failed to parse message:', error);
    }
  }

  /**
   * Process different types of WebSocket messages
   */
  processMessage(data) {
    // If no type field, treat as a direct chat message
    if (!data.type) {
      store.commit('addChatMessage', data);
      return;
    }
    
    switch (data.type) {
      case 'AUTH_SUCCESS':
        // Don't add auth success messages to chat - just log them
        // This is a system-level message, not a user-facing message
        break;
        
      case 'AUTH_FAILED':
        console.error('❌ [WebSocket] Authentication failed:', data.message);
        // Don't add auth failure messages to chat - just set error state
        // This is a system-level message, not a user-facing message
        store.commit('setError', 'WebSocket authentication failed');
        break;
        
      case 'CHAT_MESSAGE':
        // Handle different message structures from backend
        let messageToAdd;
        if (data.payload) {
          // Backend sends { type: 'CHAT_MESSAGE', payload: {...} }
          messageToAdd = data.payload;
        } else if (data.message) {
          // Backend sends { type: 'CHAT_MESSAGE', message: {...} }
          messageToAdd = data.message;
        } else if (data.text) {
          // Backend sends { type: 'CHAT_MESSAGE', text: '...', sender: '...', ... }
          messageToAdd = data;
        } else {
          // Backend sends the message directly
          messageToAdd = data;
        }
        
        store.commit('addChatMessage', messageToAdd);
        break;
        
      case 'MESSAGE_STATUS_UPDATE':
        store.commit('updateMessageStatus', {
          messageId: data.messageId,
          status: data.status
        });
        break;
        
      case 'TYPING_START':
        store.commit('setTypingIndicator', {
          userId: data.userId || 'assistant',
          isTyping: true
        });
        break;
        
      case 'TYPING_STOP':
        store.commit('setTypingIndicator', {
          userId: data.userId || 'assistant',
          isTyping: false
        });
        break;
        
      case 'SYSTEM_MESSAGE':
        // Check if this is a session expiration message
        if (data.payload && data.payload.includes('Session expired')) {
          this.handleSessionExpiration();
        }
        break;
        
      case 'TOKEN_REFRESH':
        // Store the new JWT token
        this.handleTokenRefresh(data.payload);
        break;
        
      case 'ERROR_MESSAGE':
        // Don't add error messages to chat - just set error state
        // These are system errors, not user-facing messages
        store.commit('setError', data.payload);
        break;
        
      case 'ERROR':
        store.commit('setError', data.message);
        break;
        
      default:
        // Unknown message type - ignore silently
        break;
    }
  }

  /**
   * Handle WebSocket connection close
   */
  handleClose(event) {
    // Update store connection status
    store.commit('setWebSocketConnected', false);
    
    // Don't reconnect if it was an intentional close
    if (this.isIntentionalClose) {
      return;
    }
    
    // Handle reconnection for unexpected disconnections
    if (event.code !== 1000) { // 1000 = normal closure
      this.handleReconnect();
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    store.commit('setError', 'WebSocket connection error');
  }

  /**
   * Authenticate with the WebSocket server
   */
  authenticate() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Get current token from store (might have been refreshed)
      const currentToken = store.getters.token || this.token;
      
      const authMessage = {
        type: 'AUTH',
        token: currentToken
      };
      
          this.send(authMessage);
    }
  }

  /**
   * Send message through WebSocket
   */
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify(data);
        this.socket.send(message);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      // Fallback to REST API if WebSocket is not available
      this.fallbackToRestApi(data);
      return false;
    }
  }

  /**
   * Fallback to REST API when WebSocket is unavailable
   */
  fallbackToRestApi(data) {
    // This will be handled by the store's sendMessage action
  }

  /**
   * Handle token refresh from backend
   */
  handleTokenRefresh(newToken) {
    // Store the new token in the store
    store.commit('setToken', newToken);
    
    // Update the token in this instance
    this.token = newToken;
    
    // Send acknowledgment to backend
    this.sendTokenRefreshAck();
    
    // Set up timer to send acknowledgment within 2 minutes
    this.tokenRefreshTimer = setTimeout(() => {
      // If timer expires, we should have already sent the ack
      // This is just a safety check
    }, 120000); // 2 minutes
  }
  
  /**
   * Send token refresh acknowledgment to backend
   */
  sendTokenRefreshAck() {
    const ackMessage = {
      type: 'TOKEN_REFRESH_ACK',
      timestamp: Date.now()
    };
    
    this.send(ackMessage);
    
    // Clear the timer since we sent the ack
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }
  
  /**
   * Handle session expiration
   */
  handleSessionExpiration() {
    // Clear any existing timers
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    
    // Disconnect WebSocket
    this.disconnect();
    
    // Logout user from store
    store.dispatch('logoutUser');
  }
  
  /**
   * Handle automatic reconnection
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      store.commit('setError', 'WebSocket connection failed after multiple attempts');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Close WebSocket connection intentionally
   */
  disconnect() {
    this.isIntentionalClose = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    
    if (this.socket) {
      this.socket.close(1000, 'User initiated disconnect');
      this.socket = null;
    }
    
    store.commit('setWebSocketConnected', false);
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    if (!this.socket) return 'DISCONNECTED';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

export default ChatWebSocket; 
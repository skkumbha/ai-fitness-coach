import store from '@/store';
import { isStatusAckMessage } from '@/utils/messageUtils';

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
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.reconnectTimer = null;
    this.tokenRefreshTimer = null;
    this.isIntentionalClose = false;

    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  connect() {
    const readyState = this.socket?.readyState;
    if (readyState === WebSocket.OPEN || readyState === WebSocket.CONNECTING) {
      return;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      try {
        this.socket.close();
      } catch (_) {
        // ignore
      }
      this.socket = null;
    }

    try {
      const wsUrl = this.getWebSocketUrl();
      console.log('[WebSocket] Connecting to', wsUrl);
      this.socket = new WebSocket(wsUrl);
      this.setupEventHandlers();

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

  getWebSocketUrl() {
    if (import.meta.env.VITE_WEBSOCKET_URL) {
      return import.meta.env.VITE_WEBSOCKET_URL;
    }

    // Local dev + Docker: browser on host connects directly to backend on :8080
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
      return 'ws://localhost:8080/ws';
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }

  getMessageText(message) {
    if (!message) return '';
    if (typeof message === 'string') return message;
    return message.text || message.message || message.content || '';
  }

  setupEventHandlers() {
    this.socket.onopen = this.handleOpen;
    this.socket.onmessage = this.handleMessage;
    this.socket.onclose = this.handleClose;
    this.socket.onerror = this.handleError;
  }

  handleOpen() {
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.isIntentionalClose = false;
    console.log('[WebSocket] Connected');
    store.commit('setWebSocketConnected', true);
    this.authenticate();
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      this.processMessage(data);
    } catch (error) {
      console.error('❌ [WebSocket] Failed to parse message:', error);
    }
  }

  processMessage(data) {
    if (!data.type) {
      if (!isStatusAckMessage(this.getMessageText(data))) {
        store.commit('addChatMessage', data);
      }
      return;
    }

    switch (data.type) {
      case 'AUTH_SUCCESS':
        console.log('[WebSocket] Authenticated');
        break;

      case 'AUTH_FAILED':
        console.error('❌ [WebSocket] Authentication failed:', data.message);
        store.commit('setError', 'WebSocket authentication failed');
        break;

      case 'CHAT_MESSAGE': {
        let messageToAdd;
        if (data.payload) {
          messageToAdd = data.payload;
        } else if (data.message) {
          messageToAdd = typeof data.message === 'object'
            ? data.message
            : { text: data.message, sender: data.sender || 'assistant' };
        } else if (data.text) {
          messageToAdd = data;
        } else {
          messageToAdd = data;
        }

        if (isStatusAckMessage(this.getMessageText(messageToAdd))) {
          break;
        }

        store.commit('addChatMessage', messageToAdd);
        store.commit('setTypingIndicator', { userId: 'assistant', isTyping: false });
        break;
      }

      case 'MESSAGE_STATUS_UPDATE':
        store.commit('updateMessageStatus', {
          messageId: data.messageId,
          status: data.status
        });
        break;

      case 'TYPING_INDICATOR':
      case 'TYPING_START': {
        const typingUser = data.userId || data.payload || 'assistant';
        store.commit('setTypingIndicator', {
          userId: typingUser === 'assistant' ? 'assistant' : typingUser,
          isTyping: data.isTyping !== false
        });
        break;
      }

      case 'TYPING_STOP': {
        const typingUser = data.userId || data.payload || 'assistant';
        store.commit('setTypingIndicator', {
          userId: typingUser === 'assistant' ? 'assistant' : typingUser,
          isTyping: false
        });
        break;
      }

      case 'SYSTEM_MESSAGE':
        if (data.payload && data.payload.includes('Session expired')) {
          this.handleSessionExpiration();
        }
        break;

      case 'TOKEN_REFRESH':
        this.handleTokenRefresh(data.payload);
        break;

      case 'ERROR_MESSAGE':
        store.commit('setError', data.payload);
        break;

      case 'ERROR':
        store.commit('setError', data.message);
        break;

      default:
        break;
    }
  }

  handleClose(event) {
    console.log('[WebSocket] Closed', event.code, event.reason || '');
    store.commit('setWebSocketConnected', false);

    if (this.isIntentionalClose) {
      return;
    }

    this.handleReconnect();
  }

  handleError() {
    store.commit('setError', 'WebSocket connection error');
  }

  authenticate() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const currentToken = store.getters.token || this.token;
      this.send({ type: 'AUTH', token: currentToken });
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(data));
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  handleTokenRefresh(newToken) {
    store.commit('setToken', newToken);
    this.token = newToken;
    this.sendTokenRefreshAck();
    this.tokenRefreshTimer = setTimeout(() => {}, 120000);
  }

  sendTokenRefreshAck() {
    this.send({ type: 'TOKEN_REFRESH_ACK', timestamp: Date.now() });
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  handleSessionExpiration() {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    this.disconnect();
    store.dispatch('logoutUser');
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      store.commit('setError', 'WebSocket connection failed after multiple attempts');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

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

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

export default ChatWebSocket;

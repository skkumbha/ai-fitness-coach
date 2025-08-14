<template>
  <div class="chat-interface">
    <div class="chat-header">
      <div class="chat-info">
        <div class="assistant-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="assistant-details">
          <h3 class="assistant-name">FitCoach AI</h3>
          <div class="assistant-status">
            <span class="status-dot"></span>
            <span class="status-text">{{ loading ? 'Typing...' : 'Online' }}</span>
          </div>
        </div>
      </div>
      <div class="chat-actions">
        <button class="btn-icon" @click="scrollToBottom">
          <i class="fas fa-arrow-down"></i>
        </button>
        <button class="btn-icon" @click="$emit('clear-chat')">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
    
            <div class="chat-messages" ref="chatMessages">
      <div 
        v-for="message in messages" 
        :key="message.id" 
        class="message"
        :class="[
          message.sender === 'user' ? 'user-message' : 'assistant-message',
          message.status ? `message-${message.status}` : ''
        ]"


      >
        <div class="message-bubble">
          <div class="message-text">{{ message.text }}</div>
          <div class="message-timestamp">
            {{ formatTimestamp(message.timestamp) }}
          </div>
        </div>
      </div>
      
      <!-- Typing indicator -->
      <div v-if="isTyping" class="message message-assistant">
        <div class="message-bubble typing-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="typing-text">{{ typingIndicatorText }}</div>
        </div>
      </div>
    </div>
    
    <div class="chat-input-container">
      <div class="chat-input">
        <textarea
          ref="messageInput"
          v-model="newMessage"
          class="message-textarea"
          placeholder="Type your message here..."
          @keydown.enter.prevent="handleEnterKey"
          :disabled="loading"
        ></textarea>
        <button 
          class="send-button" 
          @click="sendMessage" 
          :disabled="!canSendMessage || loading"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatInterface',
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      newMessage: '',
      suggestionChips: [
        'Help me create a workout plan',
        'What should I eat after a workout?',
        'How can I lose weight?',
        'Give me a quick 15-minute workout',
        'What are good stretches for recovery?'
      ]
    };
  },
  computed: {
    canSendMessage() {
      return this.newMessage.trim().length > 0;
    },
    // Check if AI is typing based on WebSocket typing indicators
    isTyping() {
      return this.$store.getters.typingIndicators.assistant || false;
    },
    
    // Dynamic typing indicator text
    typingIndicatorText() {
      return 'FitCoach AI is thinking...';
    }
  },
  watch: {
    messages: {
      handler() {
        this.scheduleScroll();
      },
      deep: true
    }
  },
  mounted() {
    // Focus input on mount
    this.$refs.messageInput.focus();
    
    // Initial scroll to bottom
    this.scheduleScroll();
  },
  methods: {
    sendMessage() {
      if (!this.canSendMessage || this.loading) return;
      
      this.$emit('send-message', this.newMessage.trim());
      this.newMessage = '';
      
      // Refocus the input after sending
      this.$nextTick(() => {
        this.$refs.messageInput.focus();
      });
    },
    
    sendSuggestion(suggestion) {
      this.$emit('send-message', suggestion);
    },
    
    handleEnterKey(event) {
      // If shift+enter, allow new line
      if (event.shiftKey) return;
      
      // Otherwise send the message
      this.sendMessage();
    },
    
    scrollToBottom() {
      const container = this.$refs.chatMessages;
      
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    
    scheduleScroll() {
      // Use a single $nextTick with requestAnimationFrame for optimal timing
      this.$nextTick(() => {
        requestAnimationFrame(() => {
          this.scrollToBottom();
        });
      });
    },
    
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      
      try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          return ''; // Return empty string for invalid dates
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (error) {
        console.warn('Invalid timestamp:', timestamp);
        return '';
      }
    },
    
    formatMessage(text) {
      if (!text) return '';
      
      // Convert URLs to clickable links
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      let formattedText = text.replace(urlRegex, url => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      });
      
      // Convert newlines to <br>
      formattedText = formattedText.replace(/\n/g, '<br>');
      
      // Format basic markdown
      // Bold
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Italic
      formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Bullet lists
      formattedText = formattedText.replace(/• (.*?)(<br>|$)/g, '<li>$1</li>');
      
      // Handle workout sets/reps format e.g. "3x10 Push-ups"
      formattedText = formattedText.replace(/(\d+)x(\d+)\s+([A-Za-z\s-]+)/g, '<strong>$1×$2</strong> $3');
      
      return formattedText;
    }
  }
};
</script>

<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--card-background);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(76, 175, 80, 0.05);
  flex-shrink: 0;
}

.chat-info {
  display: flex;
  align-items: center;
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-right: var(--spacing-sm);
}

.assistant-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
}

.assistant-status {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--success-color);
  margin-right: var(--spacing-xs);
}

.chat-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  background-color: rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  /* Ensure proper flexbox behavior for messages */
  align-items: stretch;
  /* Force proper message alignment */
  justify-content: flex-start;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: var(--spacing-xl);
}

.welcome-message {
  max-width: 400px;
  margin-bottom: var(--spacing-lg);
}

.welcome-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin: 0 auto var(--spacing-md);
}

.welcome-message h3 {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-sm);
}

.welcome-message p {
  color: var(--text-secondary);
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-sm);
  max-width: 600px;
}

.suggestion-chip {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
  border: none;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.suggestion-chip:hover {
  background-color: rgba(76, 175, 80, 0.2);
}

/* Message layout and styling */
.chat-interface .chat-messages .message {
  display: flex !important;
  align-items: flex-start !important;
  margin-bottom: var(--spacing-md) !important;
  gap: var(--spacing-sm) !important;
  width: 100% !important;
  min-width: 100% !important;
  /* Ensure flexbox behavior */
  flex-shrink: 0 !important;
  flex-grow: 0 !important;
}

/* User message - right side */
.chat-interface .chat-messages .message.user-message {
  justify-content: flex-end !important;
  flex-direction: row-reverse !important;
  /* Force right alignment */
  margin-left: auto !important;
  margin-right: 0 !important;
  /* Ensure proper avatar positioning */
  align-items: flex-end !important;
}

/* Assistant message - left side */
.chat-interface .chat-messages .message.assistant-message {
  justify-content: flex-start !important;
  /* Force left alignment */
  margin-left: 0 !important;
  margin-right: auto !important;
}







.chat-interface .chat-messages .message-bubble {
  max-width: 70% !important;
  padding: var(--spacing-sm) var(--spacing-md) !important;
  border-radius: var(--border-radius-md) !important;
  position: relative !important;
  word-wrap: break-word !important;
  box-sizing: border-box !important;
  /* Ensure proper text alignment */
  text-align: left !important;
  /* Ensure proper flexbox behavior */
  flex-shrink: 1 !important;
  flex-grow: 0 !important;
}

.chat-interface .chat-messages .message.user-message .message-bubble {
  background-color: var(--primary-color) !important;
  color: white !important;
  border-radius: var(--border-radius-md) var(--border-radius-md) var(--border-radius-md) 0;
  /* Force right alignment for user messages */
  margin-left: auto !important;
  margin-right: 0 !important;
}

.chat-interface .chat-messages .message.assistant-message .message-bubble {
  background-color: rgba(76, 175, 80, 0.1) !important;
  color: var(--text-color) !important;
  border-radius: var(--border-radius-md) var(--border-radius-md) 0 var(--border-radius-md);
}

/* Message delivery states - using only colors */
.message-sent .message-bubble {
  background-color: #c3e0c3; /* Pale green for sent messages */
  color: #2c3e50;
}

.message-acknowledged .message-bubble {
  background-color: #268705;
  color: white;
}

.error-message .message-bubble {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--error-color);
}

.message-text {
  white-space: pre-wrap;
  line-height: 1.5;
}

.message-timestamp {
  font-size: var(--font-size-xs);
  opacity: 0.7;
  text-align: right;
  margin-top: var(--spacing-xs);
}

.error-text {
  display: flex;
  align-items: center;
  margin: 0;
}

.error-text i {
  margin-right: var(--spacing-xs);
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: rgba(0, 0, 0, 0.4);
}

.user-message .message-footer {
  color: rgba(255, 255, 255, 0.8);
}

.assistant-typing {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-md);
}

.typing-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-md);
  margin-right: var(--spacing-sm);
}

.typing-indicator {
  background-color: var(--card-background, #f8f9fa) !important;
  border: 1px solid var(--border-color, #dee2e6);
}

.typing-dots {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--text-secondary, #6c757d);
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-text {
  font-size: 0.875em;
  color: var(--text-secondary, #6c757d);
  font-style: italic;
}

.chat-input-container {
  flex-shrink: 0;
  padding: var(--spacing-md);
  background-color: var(--card-background);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.chat-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.message-textarea {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-md);
  resize: none;
  min-height: 60px;
  max-height: 150px;
  font-family: var(--font-family);
  line-height: 1.5;
  background-color: var(--background-color);
  color: var(--text-color);
}

.message-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.message-textarea:disabled {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
}

.send-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.send-button:hover {
  background-color: var(--primary-dark);
}

.send-button:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-interface {
    min-height: calc(100vh - 140px);
  }
  
  .message-content {
    max-width: 90%;
  }
  
  .suggestion-chips {
    flex-direction: column;
    align-items: stretch;
  }
  
  .suggestion-chip {
    text-align: left;
  }
}
</style>

<style>
/* Global styles for message content */
.message-text a {
  color: inherit;
  text-decoration: underline;
}

.message-text strong {
  font-weight: 600;
}

.message-text em {
  font-style: italic;
}

.message-text li {
  margin-left: 1.5em;
  margin-bottom: 0.5em;
  list-style-type: disc;
}

/* System message styling */
.message.message-system .message-bubble {
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #1e40af;
}

.message.message-system .message-text {
  font-style: italic;
}

/* Error message styling */
.message.message-error .message-bubble {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
}

.message.message-error .message-text {
  font-weight: 500;
}

/* Typing indicator styling */
.typing-indicator {
  background-color: rgba(156, 163, 175, 0.1);
  border: 1px solid rgba(156, 163, 175, 0.3);
}

.typing-dots {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #9ca3af;
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.typing-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}
</style>

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
    
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-chat">
        <div class="welcome-message">
          <div class="welcome-icon">
            <i class="fas fa-robot"></i>
          </div>
          <h3>Hi, I'm your FitCoach AI</h3>
          <p>How can I help with your fitness goals today?</p>
        </div>
        
        <div class="suggestion-chips">
          <button 
            v-for="(suggestion, index) in suggestionChips"
            :key="index"
            class="suggestion-chip"
            @click="sendSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
      
      <div v-else class="messages-list">
        <div 
          v-for="(message, index) in messages" 
          :key="message.id"
          class="message-item"
          :class="{ 
            'user-message': message.sender === 'user',
            'assistant-message': message.sender === 'assistant',
            'error-message': message.isError
          }"
        >
          <div class="message-avatar" v-if="message.sender === 'assistant'">
            <i class="fas fa-robot"></i>
          </div>
          <div class="message-content">
            <div class="message-bubble" ref="messageBubbles">
              <p v-if="message.isError" class="error-text">
                <i class="fas fa-exclamation-circle"></i> {{ message.text }}
              </p>
              <div v-else class="message-text" v-html="formatMessage(message.text)"></div>
              <div class="message-time">{{ formatTimestamp(message.timestamp) }}</div>
            </div>
          </div>
          <div class="message-avatar user-avatar" v-if="message.sender === 'user'">
            <i class="fas fa-user"></i>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="assistant-typing">
        <div class="typing-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
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
    }
  },
  watch: {
    messages: {
      handler(newMessages, oldMessages) {
        // Only scroll if we have messages and they've changed
        if (newMessages.length > 0) {
          this.scheduleScroll();
        }
      },
      deep: true,
      immediate: true
    },
    loading(newVal, oldVal) {
      if (oldVal && !newVal) {
        // If loading just ended, scroll to bottom
        this.scheduleScroll();
      }
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
      const container = this.$refs.messagesContainer;
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
      
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.message-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.user-message {
  justify-content: flex-end;
}

.message-avatar {
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

.user-avatar {
  margin-right: 0;
  margin-left: var(--spacing-sm);
  background-color: var(--secondary-color);
}

.message-content {
  max-width: 80%;
}

.message-bubble {
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  position: relative;
}

.user-message .message-bubble {
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-md) var(--border-radius-md) 0 var(--border-radius-md);
}

.assistant-message .message-bubble {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--text-color);
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) var(--border-radius-md);
}

.error-message .message-bubble {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--error-color);
}

.message-text {
  white-space: pre-wrap;
  line-height: 1.5;
}

.error-text {
  display: flex;
  align-items: center;
  margin: 0;
}

.error-text i {
  margin-right: var(--spacing-xs);
}

.message-time {
  font-size: var(--font-size-xs);
  color: rgba(0, 0, 0, 0.4);
  margin-top: var(--spacing-xs);
  text-align: right;
}

.user-message .message-time {
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
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-xs) var(--spacing-md);
  display: flex;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary-color);
  margin: 0 2px;
  animation: typing 1.4s infinite both;
  opacity: 0.6;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
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
</style>

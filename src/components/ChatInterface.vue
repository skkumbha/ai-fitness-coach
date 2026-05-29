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
            <span class="status-text">{{ isTyping ? 'Typing...' : 'Online' }}</span>
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
    
            <div class="chat-messages" ref="chatMessages" @scroll.passive="onMessagesScroll">
      <div v-if="currentDayLabel" class="sticky-day-header" aria-hidden="true">
        <span class="sticky-day-pill">{{ currentDayLabel }}</span>
      </div>
      <div 
        v-for="message in displayMessages" 
        :key="message.id" 
        class="message"
        :data-message-id="message.id"
        :class="[
          message.sender === 'user' ? 'user-message' : 'assistant-message',
          message.status ? `message-${message.status}` : ''
        ]"


      >
        <div class="message-bubble">
          <div
            v-if="message.sender === 'user'"
            class="message-text"
          >{{ message.text }}</div>
          <div
            v-else
            class="message-text message-text--formatted"
            v-html="formatMessage(message.text)"
          />
          <div class="message-timestamp">
            {{ formatMessageTimestamp(message) }}
          </div>
        </div>
      </div>
      
      <!-- Typing indicator -->
      <div v-if="isTyping" class="message assistant-message typing-message">
        <div class="message-bubble typing-indicator-bubble">
          <div class="typing-dots" aria-label="FitCoach AI is typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="typing-text">{{ typingIndicatorText }}</div>
        </div>
      </div>
      <div ref="messagesEnd" class="messages-anchor" aria-hidden="true"></div>
    </div>
    
    <div class="chat-input-container">
      <div class="chat-input">
        <textarea
          ref="messageInput"
          v-model="newMessage"
          class="message-textarea"
          placeholder="Message"
          rows="1"
          @input="autoResizeTextarea"
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
import { formatMessageDayLabel, formatMessageTimestamp as formatChatMessageTime, isStatusAckMessage } from '@/utils/messageUtils';

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
      currentDayLabel: '',
      _scrollRaf: null,
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
      return !!this.$store.getters.typingIndicators?.assistant;
    },
    
    displayMessages() {
      return this.messages.filter(m => !isStatusAckMessage(m.text || m.message));
    },

    typingIndicatorText() {
      return 'FitCoach AI is thinking...';
    }
  },
  watch: {
    messages: {
      handler() {
        this.scheduleScroll();
        this.$nextTick(() => this.updateStickyDayHeader());
      },
      deep: true
    },
    isTyping() {
      this.scheduleScroll();
    },
    loading() {
      this.scheduleScroll();
    }
  },
  mounted() {
    this.resetTextareaHeight();
    this.scheduleScroll();
    this.updateStickyDayHeader();
    this.$nextTick(() => {
      if (this.$refs.messageInput) {
        this.$refs.messageInput.focus();
      }
    });
  },
  methods: {
    formatMessageTimestamp(message) {
      return formatChatMessageTime(message);
    },

    onMessagesScroll() {
      if (this._scrollRaf) return;
      this._scrollRaf = requestAnimationFrame(() => {
        this._scrollRaf = null;
        this.updateStickyDayHeader();
      });
    },

    updateStickyDayHeader() {
      const container = this.$refs.chatMessages;
      if (!container) return;

      const messageEls = container.querySelectorAll('.message[data-message-id]');
      if (!messageEls || messageEls.length === 0) {
        this.currentDayLabel = '';
        return;
      }

      const containerTop = container.getBoundingClientRect().top;
      let activeEl = null;

      for (const el of messageEls) {
        const r = el.getBoundingClientRect();
        if (r.bottom > containerTop + 8) {
          activeEl = el;
          break;
        }
      }

      if (!activeEl) {
        activeEl = messageEls[messageEls.length - 1];
      }

      const id = activeEl.getAttribute('data-message-id');
      const msg = this.displayMessages.find(m => String(m.id) === String(id));
      this.currentDayLabel = formatMessageDayLabel(msg);
    },

    sendMessage() {
      if (!this.canSendMessage || this.loading) return;
      
      this.$emit('send-message', this.newMessage.trim());
      this.newMessage = '';
      
      this.$nextTick(() => {
        this.resetTextareaHeight();
        this.$refs.messageInput.focus();
      });
    },
    
    autoResizeTextarea() {
      const el = this.$refs.messageInput;
      if (!el) return;
      el.style.height = 'auto';
      const maxHeight = 120;
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    },
    
    resetTextareaHeight() {
      const el = this.$refs.messageInput;
      if (!el) return;
      el.style.height = '42px';
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
      const anchor = this.$refs.messagesEnd;

      if (anchor) {
        anchor.scrollIntoView({ block: 'end', behavior: 'auto' });
      }

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },

    scheduleScroll() {
      const run = () => this.scrollToBottom();

      this.$nextTick(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(run);
          setTimeout(run, 50);
          setTimeout(run, 150);
          setTimeout(run, 300);
        });
      });
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
      // Headers
      formattedText = formattedText.replace(/^### (.*?)$/gm, '<h4>$1</h4>');
      formattedText = formattedText.replace(/^## (.*?)$/gm, '<h3>$1</h3>');
      formattedText = formattedText.replace(/^# (.*?)$/gm, '<h2>$1</h2>');

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
  min-height: 0;
  background-color: #efeae2;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: #f0f2f5;
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

.messages-anchor {
  height: 1px;
  flex-shrink: 0;
  pointer-events: none;
}

.chat-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 16px;
  background-color: #efeae2;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4cfc7' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  -webkit-overflow-scrolling: touch;
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
  margin-bottom: 6px !important;
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
  max-width: min(88%, 560px) !important;
  padding: 8px 12px !important;
  border-radius: 8px !important;
  position: relative !important;
  word-wrap: break-word !important;
  overflow-wrap: anywhere !important;
  box-sizing: border-box !important;
  text-align: left !important;
  flex-shrink: 1 !important;
  flex-grow: 0 !important;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
}

.chat-interface .chat-messages .message.user-message .message-bubble {
  background-color: #d9fdd3 !important;
  color: #111b21 !important;
  border-radius: 8px 8px 0 8px;
  margin-left: auto !important;
  margin-right: 0 !important;
}

.chat-interface .chat-messages .message.assistant-message .message-bubble {
  background-color: #ffffff !important;
  color: #111b21 !important;
  border-radius: 8px 8px 8px 0;
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
  line-height: 1.45;
  font-size: 0.9375rem;
  overflow: visible;
}

.message-timestamp {
  font-size: 0.6875rem;
  color: rgba(17, 27, 33, 0.55);
  text-align: right;
  margin-top: 4px;
  line-height: 1.2;
  min-height: 0.875rem;
}

.user-message .message-timestamp {
  color: rgba(17, 27, 33, 0.5);
}

.message-acknowledged .message-timestamp {
  color: rgba(255, 255, 255, 0.8);
}

.sticky-day-header {
  position: sticky;
  top: 10px;
  z-index: 5;
  display: flex;
  justify-content: center;
  pointer-events: none;
  margin: 10px 0;
}

.sticky-day-pill {
  background: rgba(17, 27, 33, 0.12);
  color: rgba(255, 255, 255, 0.92);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.2px;
  backdrop-filter: blur(6px);
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

.typing-indicator-bubble {
  background-color: #ffffff !important;
  padding: 12px 16px !important;
  min-width: 56px;
}

.typing-message {
  margin-bottom: 6px !important;
}

.message-text--formatted :deep(h2),
.message-text--formatted :deep(h3),
.message-text--formatted :deep(h4) {
  margin: 0.5em 0 0.25em;
  font-size: 1em;
  font-weight: 600;
}

.message-text--formatted :deep(h2) {
  font-size: 1.05em;
}

.message-text--formatted :deep(p) {
  margin: 0.25em 0;
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
  padding: 8px 12px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  background-color: #f0f2f5;
  border-top: 1px solid var(--border-color);
}

.chat-input {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-textarea {
  flex: 1;
  border: none;
  border-radius: 24px;
  padding: 10px 16px;
  font-size: 0.9375rem;
  resize: none;
  min-height: 42px;
  max-height: 120px;
  height: 42px;
  overflow-y: auto;
  font-family: var(--font-family);
  line-height: 1.4;
  background-color: #ffffff;
  color: var(--text-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
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
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  margin-bottom: 0;
}

.send-button:hover {
  background-color: var(--primary-dark);
}

.send-button:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-interface .chat-messages .message-bubble {
    max-width: 92% !important;
  }

  .chat-messages {
    padding: 10px 12px;
  }

  .chat-header {
    padding: 8px 12px;
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

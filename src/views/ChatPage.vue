<template>
  <div class="chat-page">
    <div class="container">
      <div class="chat-container">
        <div class="chat-sidebar">
          <div class="sidebar-header">
            <h2 class="sidebar-title">Coach Chat</h2>
            <button class="btn btn-icon" @click="refreshChat">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshing }"></i>
            </button>
          </div>
          
          <div class="assistant-info">
            <div class="assistant-avatar">
              <i class="fas fa-robot"></i>
            </div>
            <div class="assistant-details">
              <h3 class="assistant-name">FitCoach AI</h3>
              <p class="assistant-desc">
                Your personal AI fitness coach, available 24/7 to help with workouts, nutrition, and motivation.
              </p>
            </div>
          </div>
          
          <div class="topic-list">
            <h3 class="topic-header">Popular Topics</h3>
            <div class="topic-buttons">
              <button 
                v-for="topic in suggestedTopics" 
                :key="topic.id"
                class="topic-button"
                @click="selectTopic(topic)"
              >
                <i :class="topic.icon"></i>
                {{ topic.label }}
              </button>
            </div>
          </div>
          
          <div class="sidebar-actions">
            <button class="btn btn-outline btn-block" @click="clearChat">
              <i class="fas fa-trash-alt"></i> Clear Chat
            </button>
          </div>
        </div>
        
        <div class="chat-main">
          <ChatInterface 
            ref="chatInterface"
            :messages="messages" 
            :loading="loading"
            @send-message="sendMessage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChatInterface from '@/components/ChatInterface.vue';

export default {
  name: 'ChatPage',
  components: {
    ChatInterface
  },
  data() {
    return {
      loading: false,
      refreshing: false,
      messages: [],
      suggestedTopics: [
        { 
          id: 'workout-plan', 
          label: 'Workout Plan', 
          icon: 'fas fa-dumbbell',
          prompt: 'I need a workout plan for this week.'
        },
        { 
          id: 'nutrition-advice', 
          label: 'Nutrition Advice', 
          icon: 'fas fa-apple-alt',
          prompt: 'What should I eat before and after workouts?'
        },
        { 
          id: 'weight-loss', 
          label: 'Weight Loss Tips', 
          icon: 'fas fa-weight',
          prompt: 'What are some effective strategies for weight loss?'
        },
        { 
          id: 'motivation', 
          label: 'Motivation', 
          icon: 'fas fa-bolt',
          prompt: 'I\'m feeling unmotivated today. Any advice?'
        },
        { 
          id: 'recovery', 
          label: 'Recovery Tips', 
          icon: 'fas fa-bed',
          prompt: 'How can I improve my recovery between workouts?'
        },
        { 
          id: 'form-check', 
          label: 'Exercise Form', 
          icon: 'fas fa-running',
          prompt: 'Can you help me with proper squat form?'
        }
      ]
    };
  },
  watch: {
    messages: {
      handler() {
        // Scroll to latest message whenever messages change
        this.$nextTick(() => {
          this.scrollToLatestMessage();
        });
      },
      deep: true
    }
  },
  async mounted() {
    await this.fetchChatHistory();
    
    // If there's a topic in the route query, use it
    if (this.$route.query.topic) {
      const topic = this.suggestedTopics.find(t => t.id === this.$route.query.topic);
      if (topic) {
        this.selectTopic(topic);
      }
    }
    
    // Add welcome message if chat is empty
    if (this.messages.length === 0) {
      this.messages = [
        {
          id: 'welcome',
          sender: 'assistant',
          text: 'Hello! I\'m your FitCoach AI assistant. How can I help you with your fitness journey today?',
          timestamp: new Date().toISOString()
        }
      ];
    }
    
    // Schedule scroll to latest message after everything is set up
    this.scrollToLatestMessage();
  },
  methods: {
    async fetchChatHistory() {
      this.loading = true;
      
      try {
        await this.$store.dispatch('fetchChatHistory');
        this.messages = this.$store.getters.chatHistory;
        
        // Schedule scroll to latest message after loading history
        this.scrollToLatestMessage();
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async refreshChat() {
      this.refreshing = true;
      await this.fetchChatHistory();
      this.refreshing = false;
    },
    
    async sendMessage(messageText) {
      if (!messageText.trim()) return;
      
      try {
        await this.$store.dispatch('sendMessage', messageText);
      } catch (error) {
        // Add error message to chat
        this.messages.push({
          id: Date.now().toString(),
          sender: 'assistant',
          text: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date().toISOString(),
          isError: true
        });
      }
    },
    
    selectTopic(topic) {
      this.sendMessage(topic.prompt);
    },
    
    async clearChat() {
      // Show confirmation dialog
      if (!confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
        return;
      }
      
      this.messages = [
        {
          id: 'welcome',
          sender: 'assistant',
          text: 'Chat cleared. How can I help you with your fitness journey today?',
          timestamp: new Date().toISOString()
        }
      ];
      
      // In a real app, would also call API to clear history
    },
    
    scrollToLatestMessage() {
      // Use a single $nextTick for optimal timing
      this.$nextTick(() => {
        const chatInterface = this.$refs.chatInterface;
        if (chatInterface && chatInterface.scheduleScroll) {
          chatInterface.scheduleScroll();
        }
      });
    }
  }
};
</script>

<style scoped>
.chat-page {
  height: 100vh;
  overflow: hidden;
  margin: -20px -20px -20px -20px;
  padding: 20px;
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  height: 100%;
}

.chat-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-md);
  height: 100%;
}

.chat-sidebar {
  display: flex;
  flex-direction: column;
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
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

.topic-list {
  margin-bottom: var(--spacing-md);
  flex-grow: 1;
}

.topic-header {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.topic-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.topic-button {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
  border: none;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  margin-bottom: var(--spacing-xs);
}

.topic-button i {
  margin-right: var(--spacing-xs);
}

.topic-button:hover {
  background-color: rgba(76, 175, 80, 0.2);
}

.assistant-info {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background-color: rgba(76, 175, 80, 0.05);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
}

.assistant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-right: var(--spacing-md);
}

.assistant-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin: 0 0 var(--spacing-xs);
  color: var(--text-color);
}

.assistant-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.sidebar-actions {
  margin-top: auto;
}

.chat-main {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

@media (max-width: 991px) {
  .chat-container {
    grid-template-columns: 1fr;
  }
  
  .chat-sidebar {
    display: none;
  }
}
</style>

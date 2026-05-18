<template>
  <div class="chat-page">
    <ChatInterface
      ref="chatInterface"
      :messages="messages"
      :loading="isSending"
      @send-message="sendMessage"
      @clear-chat="clearChat"
    />
  </div>
</template>

<script>
import ChatInterface from '@/components/ChatInterface.vue';
import { generateMessageId } from '@/utils/messageUtils';
import { mapGetters } from 'vuex';

export default {
  name: 'ChatPage',
  components: {
    ChatInterface
  },
  data() {
    return {
      isSending: false,
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
  computed: {
    ...mapGetters(['chatHistory', 'typingIndicators']),
    messages() {
      return this.chatHistory;
    },
    isAssistantTyping() {
      return !!this.typingIndicators?.assistant;
    }
  },
  watch: {
    messages: {
      handler() {
        this.scrollToLatestMessage();
      },
      deep: true
    },
    isAssistantTyping() {
      this.scrollToLatestMessage();
    }
  },
  async mounted() {
    await this.fetchChatHistory();

    if (this.$route.query.topic) {
      const topic = this.suggestedTopics.find(t => t.id === this.$route.query.topic);
      if (topic) {
        this.selectTopic(topic);
      }
    }

    if (this.messages.length === 0) {
      this.$store.commit('addChatMessage', {
        id: generateMessageId('welcome'),
        sender: 'assistant',
        text: 'Hello! I\'m your FitCoach AI assistant. How can I help you with your fitness journey today?',
        timestamp: new Date().toISOString()
      });
    }

    this.scrollToLatestMessage();
  },
  methods: {
    async fetchChatHistory() {
      try {
        await this.$store.dispatch('fetchChatHistory');
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        this.scrollToLatestMessage();
      }
    },

    async sendMessage(messageText) {
      if (!messageText.trim()) return;

      this.isSending = true;
      try {
        await this.$store.dispatch('sendMessage', messageText);
        this.scrollToLatestMessage();
      } catch (error) {
        console.error('Error sending message:', error);
        this.$store.commit('addChatMessage', {
          id: generateMessageId('error'),
          sender: 'assistant',
          text: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date().toISOString(),
          isError: true
        });
      } finally {
        this.isSending = false;
        this.scrollToLatestMessage();
      }
    },

    selectTopic(topic) {
      this.sendMessage(topic.prompt);
    },

    async clearChat() {
      if (!confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
        return;
      }

      this.$store.commit('setChatHistory', [
        {
          id: generateMessageId('welcome'),
          sender: 'assistant',
          text: 'Chat cleared. How can I help you with your fitness journey today?',
          timestamp: new Date().toISOString()
        }
      ]);
      this.$store.commit('setTypingIndicator', { userId: 'assistant', isTyping: false });
      this.scrollToLatestMessage();
    },

    scrollToLatestMessage() {
      const chatInterface = this.$refs.chatInterface;
      if (chatInterface?.scheduleScroll) {
        chatInterface.scheduleScroll();
      }
    }
  }
};
</script>

<style scoped>
.chat-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  height: 100%;
}
</style>

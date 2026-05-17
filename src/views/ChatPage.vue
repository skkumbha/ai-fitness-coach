<template>
  <div class="chat-page">
    <ChatInterface
      ref="chatInterface"
      :messages="messages"
      :loading="loading"
      @send-message="sendMessage"
      @clear-chat="clearChat"
    />
  </div>
</template>

<script>
import ChatInterface from '@/components/ChatInterface.vue';
import { generateMessageId } from '@/utils/messageUtils';

export default {
  name: 'ChatPage',
  components: {
    ChatInterface
  },
  data() {
    return {
      loading: false,
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
        this.scrollToLatestMessage();
      },
      deep: true
    },
    '$store.getters.chatHistory': {
      handler(newChatHistory) {
        this.messages = [...newChatHistory];
        this.scrollToLatestMessage();
      },
      deep: true,
      immediate: true
    },
    loading(isLoading) {
      if (!isLoading) {
        this.scrollToLatestMessage();
      }
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
      this.messages = [
        {
          id: generateMessageId('welcome'),
          sender: 'assistant',
          text: 'Hello! I\'m your FitCoach AI assistant. How can I help you with your fitness journey today?',
          timestamp: new Date().toISOString()
        }
      ];
    }

    this.scrollToLatestMessage();
  },
  methods: {
    async fetchChatHistory() {
      this.loading = true;

      try {
        await this.$store.dispatch('fetchChatHistory');
        this.messages = this.$store.getters.chatHistory;
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        this.loading = false;
        this.scrollToLatestMessage();
      }
    },

    async sendMessage(messageText) {
      if (!messageText.trim()) return;

      try {
        await this.$store.dispatch('sendMessage', messageText);
      } catch (error) {
        console.error('Error sending message:', error);
        this.messages.push({
          id: generateMessageId('error'),
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
      if (!confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
        return;
      }

      this.messages = [
        {
          id: generateMessageId('welcome'),
          sender: 'assistant',
          text: 'Chat cleared. How can I help you with your fitness journey today?',
          timestamp: new Date().toISOString()
        }
      ];
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

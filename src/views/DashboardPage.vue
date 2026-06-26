<template>
  <div class="dashboard-page">
    <div class="container">
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1 class="welcome-title">Welcome back, {{ userFirstName }}!</h1>
          <p class="welcome-subtitle">
            {{ welcomeMessage }}
          </p>
        </div>
        
        <div class="quick-actions">
          <button @click="$router.push('/chat')" class="btn btn-primary">
            <i class="fas fa-comment-dots"></i> Talk to Coach
          </button>
          <button @click="refreshDashboard" class="btn btn-outline">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshing }"></i> Refresh
          </button>
        </div>
      </div>
      
      <div class="dashboard-sections">
        <div class="section-col">
          <div class="section-card progress-section">
            <div class="section-header">
              <h2 class="section-title">Your Progress</h2>
            </div>
            
            <div v-if="hasProfileGoals" class="profile-goals">
              <div v-if="personalDetails.primaryGoal" class="goal-row">
                <span class="goal-label">Primary goal</span>
                <span class="goal-value">{{ personalDetails.primaryGoal }}</span>
              </div>
              <div v-if="personalDetails.fitnessLevel" class="goal-row">
                <span class="goal-label">Fitness level</span>
                <span class="goal-value">{{ personalDetails.fitnessLevel }}</span>
              </div>
              <div v-if="personalDetails.weight" class="goal-row">
                <span class="goal-label">Current weight</span>
                <span class="goal-value">{{ personalDetails.weight }} kg</span>
              </div>
              <div v-if="personalDetails.targetWeight" class="goal-row">
                <span class="goal-label">Target weight</span>
                <span class="goal-value">{{ personalDetails.targetWeight }} kg</span>
              </div>
              <div v-if="personalDetails.weeklyWorkOuts" class="goal-row">
                <span class="goal-label">Weekly workouts</span>
                <span class="goal-value">{{ personalDetails.weeklyWorkOuts }} per week</span>
              </div>
              <div v-if="personalDetails.height" class="goal-row">
                <span class="goal-label">Height</span>
                <span class="goal-value">{{ personalDetails.height }} cm</span>
              </div>
            </div>
            
            <div v-else class="empty-state">
              <div class="empty-icon">
                <i class="fas fa-bullseye"></i>
              </div>
              <p class="empty-text">Complete your profile to see your goals.</p>
              <router-link to="/profile" class="btn btn-primary">
                <i class="fas fa-user"></i> Go to Profile
              </router-link>
            </div>
            
            <ProgressChart 
              title="Weekly Activity"
              type="line"
              :chart-data="weeklyChartData"
              empty-message="No workouts logged yet."
            />
          </div>
        </div>
        
        <div class="section-col">
          <div class="section-card workouts-section">
            <div class="section-header">
              <h2 class="section-title">Today's Plan</h2>
              <div class="section-actions">
                <router-link to="/workouts" class="btn btn-sm btn-outline">
                  <i class="fas fa-calendar-alt"></i> View All
                </router-link>
              </div>
            </div>
            
            <div v-if="loading" class="section-loading">
              <LoadingSpinner />
            </div>
            
            <div v-else-if="todaysWorkout" class="today-workout">
              <WorkoutCard 
                :workout="todaysWorkout" 
                @complete="completeWorkout" 
                @details="viewWorkoutDetails"
              />
            </div>
            
            <div v-else class="empty-state">
              <div class="empty-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <p class="empty-text">
                Your workout plan will appear at your preferred reminder time, or ask your coach in chat.
              </p>
              <button @click="$router.push('/chat')" class="btn btn-primary">
                <i class="fas fa-comment-dots"></i> Talk to Coach
              </button>
            </div>
            
            <div class="section-header mt-4">
              <h2 class="section-title">Nutrition</h2>
            </div>
            
            <div class="nutrition-cta">
              <div class="empty-icon">
                <i class="fas fa-utensils"></i>
              </div>
              <p class="empty-text">Get personalized meal guidance from your coach.</p>
              <button @click="$router.push('/chat')" class="btn btn-primary">
                <i class="fas fa-comment-dots"></i> Ask about nutrition
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import WorkoutCard from '@/components/WorkoutCard.vue';
import ProgressChart from '@/components/ProgressChart.vue';
import { getTodaysWorkout } from '@/api/workouts';
import { mapTodayWorkoutToCard, aggregateActivityFromHistory } from '@/utils/workoutMapper';

export default {
  name: 'DashboardPage',
  components: {
    LoadingSpinner,
    WorkoutCard,
    ProgressChart
  },
  data() {
    return {
      loading: true,
      refreshing: false,
      todaysWorkout: null,
      workoutHistory: []
    };
  },
  computed: {
    userFirstName() {
      const user = this.$store.getters.currentUser;
      return user?.firstName || 'User';
    },

    personalDetails() {
      return this.$store.getters.currentUser?.personalDetails || {};
    },

    hasProfileGoals() {
      const pd = this.personalDetails;
      return !!(pd.primaryGoal || pd.fitnessLevel || pd.targetWeight || pd.weeklyWorkOuts);
    },

    weeklyChartData() {
      return aggregateActivityFromHistory(this.workoutHistory, 'week');
    },
    
    welcomeMessage() {
      const now = new Date();
      const hour = now.getHours();
      let message = '';
      
      if (hour < 12) {
        message = 'Good morning! Start your day with energy.';
      } else if (hour < 17) {
        message = 'Good afternoon! Keep up the momentum.';
      } else {
        message = 'Good evening! Finish your day strong.';
      }
      
      const dayOfWeek = now.getDay();
      if (dayOfWeek === 1) {
        message += ' Let\'s set the tone for a great week!';
      } else if (dayOfWeek === 5) {
        message += ' Ready for an active weekend?';
      }
      
      return message;
    }
  },
  async mounted() {
    await this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      this.loading = true;
      
      try {
        await this.$store.dispatch('fetchWorkoutHistory');
        this.workoutHistory = this.$store.getters.workoutHistory || [];

        const todayResponse = await getTodaysWorkout();
        this.todaysWorkout = mapTodayWorkoutToCard(todayResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async refreshDashboard() {
      this.refreshing = true;
      await this.fetchDashboardData();
      this.refreshing = false;
    },
    
    async completeWorkout(workoutId) {
      if (!this.todaysWorkout || this.todaysWorkout.id !== workoutId) {
        return;
      }

      try {
        const response = await this.$store.dispatch('completeWorkout', {
          durationMin: this.todaysWorkout.duration,
          notes: null
        });
        this.todaysWorkout = mapTodayWorkoutToCard(response);
        await this.$store.dispatch('fetchWorkoutHistory');
        this.workoutHistory = this.$store.getters.workoutHistory || [];
      } catch (error) {
        console.error('Error checking in workout:', error);
      }
    },
    
    viewWorkoutDetails() {
      this.$router.push('/workouts');
    }
  }
};
</script>

<style scoped>
.dashboard-page {
  padding: var(--spacing-md) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

.welcome-subtitle {
  color: var(--text-secondary);
  margin-bottom: 0;
}

.quick-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.dashboard-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.section-col {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.section-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.profile-goals {
  padding: var(--spacing-md);
}

.goal-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.goal-row:last-child {
  border-bottom: none;
}

.goal-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.goal-value {
  font-weight: 500;
  color: var(--text-color);
  text-align: right;
}

.today-workout {
  padding: var(--spacing-md);
}

.nutrition-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-md);
}

.empty-text {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.section-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg);
}

.mt-4 {
  margin-top: var(--spacing-lg);
}

@media (max-width: 991px) {
  .dashboard-sections {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .quick-actions {
    width: 100%;
  }
  
  .quick-actions button {
    flex: 1;
  }
}
</style>

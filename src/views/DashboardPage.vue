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
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-fire"></i>
          </div>
          <div class="stat-details">
            <h3 class="stat-value">{{ stats.calories || 0 }}</h3>
            <p class="stat-label">Calories Burned</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-dumbbell"></i>
          </div>
          <div class="stat-details">
            <h3 class="stat-value">{{ stats.workouts || 0 }}</h3>
            <p class="stat-label">Workouts Completed</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-details">
            <h3 class="stat-value">{{ stats.minutes || 0 }}</h3>
            <p class="stat-label">Active Minutes</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <div class="stat-details">
            <h3 class="stat-value">{{ stats.streak || 0 }}</h3>
            <p class="stat-label">Day Streak</p>
          </div>
        </div>
      </div>
      
      <div class="dashboard-sections">
        <!-- Progress Tracking -->
        <div class="section-col">
          <div class="section-card progress-section">
            <div class="section-header">
              <h2 class="section-title">Your Progress</h2>
              <div class="section-actions">
                <button @click="openGoalModal" class="btn btn-sm btn-outline">
                  <i class="fas fa-plus"></i> Set Goal
                </button>
              </div>
            </div>
            
            <div v-if="goals.length > 0" class="goals-list">
              <GoalTracker 
                v-for="goal in goals" 
                :key="goal.id"
                :goal="goal"
                @update="openGoalModal(goal)"
                @complete="completeGoal(goal.id)"
              />
            </div>
            
            <div v-else class="empty-state">
              <div class="empty-icon">
                <i class="fas fa-bullseye"></i>
              </div>
              <p class="empty-text">You haven't set any fitness goals yet.</p>
              <button @click="openGoalModal" class="btn btn-primary">
                <i class="fas fa-plus"></i> Set Your First Goal
              </button>
            </div>
            
            <ProgressChart 
              title="Weekly Activity"
              endpoint="workout-activity"
              type="line"
            />
          </div>
        </div>
        
        <!-- Upcoming Workouts & Recommendations -->
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
              <p class="empty-text">No workout planned for today.</p>
              <button @click="requestWorkout" class="btn btn-primary">
                <i class="fas fa-dumbbell"></i> Generate Workout
              </button>
            </div>
            
            <div class="section-header mt-4">
              <h2 class="section-title">Nutrition Suggestions</h2>
              <div class="section-actions">
                <router-link to="/nutrition" class="btn btn-sm btn-outline">
                  <i class="fas fa-utensils"></i> More Options
                </router-link>
              </div>
            </div>
            
            <div v-if="mealSuggestions.length > 0" class="meal-suggestions">
              <MealCard 
                :meal="mealSuggestions[0]" 
                @save="saveMeal" 
                @log="logMeal"
              />
            </div>
            
            <div v-else class="empty-state">
              <div class="empty-icon">
                <i class="fas fa-utensils"></i>
              </div>
              <p class="empty-text">No meal suggestions available.</p>
              <button @click="refreshMeals" class="btn btn-primary">
                <i class="fas fa-sync-alt"></i> Get Suggestions
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
import MealCard from '@/components/MealCard.vue';
import GoalTracker from '@/components/GoalTracker.vue';
import ProgressChart from '@/components/ProgressChart.vue';

export default {
  name: 'DashboardPage',
  components: {
    LoadingSpinner,
    WorkoutCard,
    MealCard,
    GoalTracker,
    ProgressChart
  },
  data() {
    return {
      loading: true,
      refreshing: false,
      stats: {
        calories: 0,
        workouts: 0,
        minutes: 0,
        streak: 0
      },
      todaysWorkout: null,
      mealSuggestions: [],
      goals: []
    };
  },
  computed: {
    userFirstName() {
      const user = this.$store.getters.currentUser;
      return user?.firstName || 'User';
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
      if (dayOfWeek === 1) { // Monday
        message += ' Let\'s set the tone for a great week!';
      } else if (dayOfWeek === 5) { // Friday
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
        // Fetch workout history
        await this.$store.dispatch('fetchWorkoutHistory');
        const workouts = this.$store.getters.workoutHistory;
        
        // Get today's workout if exists
        this.todaysWorkout = this.getTodaysWorkout(workouts);
        
        // Calculate stats
        this.calculateStats(workouts);
        
        // Fetch meal suggestions
        await this.$store.dispatch('fetchMealSuggestions');
        this.mealSuggestions = this.$store.getters.mealSuggestions;
        
        // Fetch goals (mock data for now)
        this.fetchGoals();
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
    
    getTodaysWorkout(workouts) {
      // Check if any workout is scheduled for today
      const today = new Date().toISOString().split('T')[0];
      return workouts.find(w => !w.completed && w.scheduledFor?.startsWith(today)) || null;
    },
    
    calculateStats(workouts) {
      // This would be replaced with actual API data
      this.stats = {
        calories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
        workouts: workouts.filter(w => w.completed).length,
        minutes: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        streak: this.calculateStreak(workouts)
      };
    },
    
    calculateStreak(workouts) {
      // Basic streak calculation
      // In a real app, this would be more sophisticated
      return 5; // Mock data
    },
    
    fetchGoals() {
      // This would be replaced with an API call
      // Mock data for now
      this.goals = [
        {
          id: '1',
          title: 'Weight Loss Goal',
          description: 'Lose weight through consistent exercise and nutrition',
          startDate: '2023-06-01',
          endDate: '2023-09-01',
          startValue: 185,
          currentValue: 175,
          targetValue: 170,
          unit: 'lbs',
          isReduceGoal: true,
          metrics: [
            { label: 'Starting', value: '185 lbs' },
            { label: 'Current', value: '175 lbs' },
            { label: 'Target', value: '170 lbs' }
          ]
        },
        {
          id: '2',
          title: 'Strength Training',
          description: 'Increase bench press max weight',
          startDate: '2023-06-01',
          endDate: '2023-09-01',
          startValue: 135,
          currentValue: 155,
          targetValue: 180,
          unit: 'lbs',
          metrics: [
            { label: 'Starting', value: '135 lbs' },
            { label: 'Current', value: '155 lbs' },
            { label: 'Target', value: '180 lbs' }
          ]
        }
      ];
    },
    
    completeWorkout(workoutId) {
      // This is just UI update for demo
      if (this.todaysWorkout && this.todaysWorkout.id === workoutId) {
        this.todaysWorkout = {
          ...this.todaysWorkout,
          completed: true,
          completedAt: new Date().toISOString()
        };
        
        // Update stats
        this.stats.workouts += 1;
        this.stats.calories += this.todaysWorkout.calories || 0;
        this.stats.minutes += this.todaysWorkout.duration || 0;
      }
    },
    
    viewWorkoutDetails(workoutId) {
      // Navigate to workout details
      this.$router.push(`/workouts/${workoutId}`);
    },
    
    saveMeal(mealId) {
      // Just UI update for demo
      this.mealSuggestions = this.mealSuggestions.map(meal => {
        if (meal.id === mealId) {
          return { ...meal, saved: true };
        }
        return meal;
      });
    },
    
    logMeal(mealId) {
      // Just UI update for demo
      this.mealSuggestions = this.mealSuggestions.map(meal => {
        if (meal.id === mealId) {
          return { ...meal, logged: true };
        }
        return meal;
      });
    },
    
    openGoalModal(goal = null) {
      // Would show a modal to add/edit goal
      alert(goal ? 'Edit goal: ' + goal.title : 'Create new goal');
    },
    
    completeGoal(goalId) {
      // Mark goal as completed
      this.goals = this.goals.map(goal => {
        if (goal.id === goalId) {
          return { ...goal, completed: true, completedAt: new Date().toISOString() };
        }
        return goal;
      });
    },
    
    requestWorkout() {
      // Would normally open a modal or navigate to create workout page
      // For demo, just create a workout
      this.todaysWorkout = {
        id: 'new-workout-' + Date.now(),
        title: 'Quick Full Body Workout',
        description: 'A balanced full body workout focusing on major muscle groups.',
        category: 'Strength',
        duration: 45,
        calories: 350,
        scheduledFor: new Date().toISOString(),
        completed: false,
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 12 },
          { name: 'Squats', sets: 3, reps: 15 },
          { name: 'Planks', sets: 3, reps: '30 sec' },
          { name: 'Lunges', sets: 3, reps: 10 }
        ]
      };
    },
    
    refreshMeals() {
      // For demo, just create a meal suggestion
      this.mealSuggestions = [
        {
          id: 'meal-' + Date.now(),
          title: 'High-Protein Chicken Bowl',
          type: 'Lunch',
          description: 'A nutrient-rich bowl with lean protein, complex carbs, and healthy fats.',
          calories: 520,
          protein: 38,
          carbs: 45,
          fat: 18,
          ingredients: [
            'Grilled chicken breast (6oz)',
            'Brown rice (1 cup)',
            'Roasted vegetables',
            'Avocado (1/4)',
            'Olive oil (1 tbsp)',
            'Lemon juice',
            'Herbs and spices'
          ],
          tags: ['High-Protein', 'Low-Carb', 'Meal-Prep Friendly']
        }
      ];
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

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(76,175,80,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
  color: var(--primary-color);
  font-size: 1.25rem;
}

.stat-details {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
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

.goals-list {
  padding: var(--spacing-md);
}

.today-workout, .meal-suggestions {
  padding: var(--spacing-md);
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

@media (max-width: 576px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
}
</style>

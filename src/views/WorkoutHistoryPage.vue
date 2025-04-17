<template>
  <div class="workout-history-page">
    <div class="container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Workout History</h1>
          <p class="page-subtitle">
            Track your fitness journey and see your progress over time
          </p>
        </div>
        
        <div class="header-actions">
          <button @click="openFilterOptions" class="btn btn-outline">
            <i class="fas fa-filter"></i> Filter
          </button>
          <button @click="generatePrintableReport" class="btn btn-outline d-md-inline d-none">
            <i class="fas fa-print"></i> Export
          </button>
          <button @click="createWorkout" class="btn btn-primary">
            <i class="fas fa-plus"></i> New Workout
          </button>
        </div>
      </div>
      
      <div class="workout-stats">
        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Total Workouts</h3>
            <i class="fas fa-dumbbell stat-icon"></i>
          </div>
          <div class="stat-value">{{ stats.totalWorkouts }}</div>
          <div class="stat-trend">
            <i class="fas fa-arrow-up"></i> {{ stats.workoutIncrease }}% from last month
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Calories Burned</h3>
            <i class="fas fa-fire-alt stat-icon"></i>
          </div>
          <div class="stat-value">{{ stats.totalCalories }}</div>
          <div class="stat-trend">
            <i class="fas fa-arrow-up"></i> {{ stats.caloriesIncrease }}% from last month
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Active Minutes</h3>
            <i class="fas fa-clock stat-icon"></i>
          </div>
          <div class="stat-value">{{ stats.totalMinutes }}</div>
          <div class="stat-trend">
            <i class="fas fa-arrow-up"></i> {{ stats.minutesIncrease }}% from last month
          </div>
        </div>
      </div>
      
      <div class="workout-chart-section">
        <ProgressChart 
          title="Workout Activity"
          endpoint="workout-activity"
          type="bar"
        />
      </div>
      
      <div class="filters-bar" v-if="showFilters">
        <div class="filter-group">
          <label for="categoryFilter">Category:</label>
          <select id="categoryFilter" v-model="filters.category" class="form-select">
            <option value="">All Categories</option>
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
            <option value="flexibility">Flexibility</option>
            <option value="hiit">HIIT</option>
            <option value="yoga">Yoga</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="dateFilter">Date Range:</label>
          <select id="dateFilter" v-model="filters.dateRange" class="form-select">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="statusFilter">Status:</label>
          <select id="statusFilter" v-model="filters.status" class="form-select">
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        
        <button @click="applyFilters" class="btn btn-primary">Apply</button>
        <button @click="resetFilters" class="btn btn-outline">Reset</button>
      </div>
      
      <div class="workouts-section">
        <div v-if="loading" class="loading-container">
          <LoadingSpinner message="Loading workout history..." />
        </div>
        
        <div v-else-if="filteredWorkouts.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-dumbbell"></i>
          </div>
          <h3>No workouts found</h3>
          <p v-if="isFiltered">Try adjusting your filters or search criteria.</p>
          <p v-else>Let's start your fitness journey! Create your first workout.</p>
          <button @click="createWorkout" class="btn btn-primary">
            <i class="fas fa-plus"></i> Add Workout
          </button>
        </div>
        
        <div v-else class="workout-list">
          <WorkoutCard 
            v-for="workout in filteredWorkouts" 
            :key="workout.id"
            :workout="workout"
            @complete="completeWorkout"
            @details="viewWorkoutDetails"
          />
        </div>
      </div>
      
      <div v-if="filteredWorkouts.length > 0" class="pagination">
        <button 
          class="pagination-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <i class="fas fa-chevron-left"></i> Previous
        </button>
        
        <div class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        
        <button 
          class="pagination-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import WorkoutCard from '@/components/WorkoutCard.vue';
import ProgressChart from '@/components/ProgressChart.vue';

export default {
  name: 'WorkoutHistoryPage',
  components: {
    LoadingSpinner,
    WorkoutCard,
    ProgressChart
  },
  data() {
    return {
      loading: true,
      showFilters: false,
      filters: {
        category: '',
        dateRange: 'month',
        status: ''
      },
      currentPage: 1,
      itemsPerPage: 5,
      stats: {
        totalWorkouts: 0,
        workoutIncrease: 0,
        totalCalories: 0,
        caloriesIncrease: 0,
        totalMinutes: 0,
        minutesIncrease: 0
      }
    };
  },
  computed: {
    workouts() {
      return this.$store.getters.workoutHistory || [];
    },
    
    isFiltered() {
      return this.filters.category !== '' || 
             this.filters.dateRange !== 'all' || 
             this.filters.status !== '';
    },
    
    filteredWorkouts() {
      let filtered = [...this.workouts];
      
      // Apply category filter
      if (this.filters.category) {
        filtered = filtered.filter(w => 
          w.category?.toLowerCase() === this.filters.category.toLowerCase()
        );
      }
      
      // Apply status filter
      if (this.filters.status) {
        if (this.filters.status === 'completed') {
          filtered = filtered.filter(w => w.completed);
        } else if (this.filters.status === 'scheduled') {
          filtered = filtered.filter(w => !w.completed);
        }
      }
      
      // Apply date range filter
      if (this.filters.dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (this.filters.dateRange) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case '3months':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        filtered = filtered.filter(w => {
          const workoutDate = new Date(w.completedAt || w.scheduledFor);
          return workoutDate >= startDate && workoutDate <= now;
        });
      }
      
      // Sort by date (most recent first)
      filtered.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.scheduledFor);
        const dateB = new Date(b.completedAt || b.scheduledFor);
        return dateB - dateA;
      });
      
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      
      return filtered.slice(startIndex, endIndex);
    },
    
    totalPages() {
      const filteredTotal = this.workouts.length;
      return Math.ceil(filteredTotal / this.itemsPerPage) || 1;
    }
  },
  async mounted() {
    await this.fetchWorkoutData();
  },
  methods: {
    async fetchWorkoutData() {
      this.loading = true;
      
      try {
        // Fetch workout history
        await this.$store.dispatch('fetchWorkoutHistory');
        
        // Calculate stats
        this.calculateStats();
      } catch (error) {
        console.error('Error fetching workout data:', error);
      } finally {
        this.loading = false;
      }
    },
    
    calculateStats() {
      // Calculate workout statistics from the workout data
      const completedWorkouts = this.workouts.filter(w => w.completed);
      
      this.stats = {
        totalWorkouts: completedWorkouts.length,
        workoutIncrease: 15, // Mock data
        totalCalories: completedWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
        caloriesIncrease: 8, // Mock data
        totalMinutes: completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        minutesIncrease: 12 // Mock data
      };
    },
    
    openFilterOptions() {
      this.showFilters = !this.showFilters;
    },
    
    applyFilters() {
      // Reset to first page when applying filters
      this.currentPage = 1;
    },
    
    resetFilters() {
      this.filters = {
        category: '',
        dateRange: 'month',
        status: ''
      };
      this.currentPage = 1;
    },
    
    completeWorkout(workoutId) {
      // This would normally call the store action to complete a workout
      // For demo purposes, we'll just update the UI
      const workoutIndex = this.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex >= 0) {
        const updatedWorkouts = [...this.workouts];
        updatedWorkouts[workoutIndex] = {
          ...updatedWorkouts[workoutIndex],
          completed: true,
          completedAt: new Date().toISOString()
        };
        
        // Update store (in a real app, this would be done by the API)
        this.$store.commit('setWorkouts', updatedWorkouts);
        
        // Recalculate stats
        this.calculateStats();
      }
    },
    
    viewWorkoutDetails(workoutId) {
      // Navigate to workout details
      alert(`View workout details for ID: ${workoutId}`);
    },
    
    createWorkout() {
      // Navigate to workout creation page or open modal
      alert('Create new workout');
    },
    
    generatePrintableReport() {
      // Generate a printable report
      alert('Generate printable report');
    }
  }
};
</script>

<style scoped>
.workout-history-page {
  padding: var(--spacing-md) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

.page-subtitle {
  color: var(--text-secondary);
  margin-bottom: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.workout-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.stat-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.stat-icon {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

.stat-trend {
  font-size: var(--font-size-sm);
  color: var(--success-color);
  display: flex;
  align-items: center;
}

.stat-trend i {
  margin-right: var(--spacing-xs);
}

.workout-chart-section {
  margin-bottom: var(--spacing-lg);
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  background-color: rgba(76, 175, 80, 0.05);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-group label {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.form-select {
  padding: 0.375rem 0.75rem;
  font-size: var(--font-size-md);
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
}

.workouts-section {
  margin-bottom: var(--spacing-lg);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl) 0;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.empty-icon {
  font-size: 3rem;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-lg);
}

.pagination-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    margin-top: var(--spacing-md);
    width: 100%;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  
  .filters-bar {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filters-bar button {
    width: 100%;
  }
}
</style>

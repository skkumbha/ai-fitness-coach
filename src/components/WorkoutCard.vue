<template>
  <div class="workout-card" :class="{ completed: workout.completed }">
    <div class="workout-header">
      <div class="workout-icon">
        <i :class="workoutIcon"></i>
      </div>
      <div class="workout-info">
        <h3 class="workout-title">{{ workout.title }}</h3>
        <p class="workout-meta">
          <span class="workout-category">{{ workout.category }}</span>
          <span class="workout-duration">
            <i class="far fa-clock"></i> {{ workout.duration }} min
          </span>
        </p>
      </div>
      <div v-if="workout.completed" class="workout-completed-badge">
        <i class="fas fa-check-circle"></i>
      </div>
    </div>
    
    <div class="workout-body">
      <p class="workout-description">{{ workout.description }}</p>
      
      <div v-if="workout.exercises && workout.exercises.length" class="workout-exercises">
        <h4 class="exercises-title">Exercises:</h4>
        <ul class="exercises-list">
          <li v-for="(exercise, index) in workout.exercises" :key="index" class="exercise-item">
            <div class="exercise-name">{{ exercise.name }}</div>
            <div class="exercise-detail">{{ exercise.sets }} sets × {{ exercise.reps }} reps</div>
          </li>
        </ul>
      </div>
      
      <div v-if="workout.completed" class="workout-completion">
        <p class="completion-text">
          <i class="fas fa-trophy"></i>
          Completed on {{ formatDate(workout.completedAt) }}
        </p>
        <div v-if="workout.calories" class="workout-stats">
          <div class="stat-item">
            <div class="stat-value">{{ workout.calories }}</div>
            <div class="stat-label">Calories</div>
          </div>
          <div v-if="workout.duration" class="stat-item">
            <div class="stat-value">{{ workout.duration }}</div>
            <div class="stat-label">Minutes</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="workout-footer">
      <button 
        v-if="!workout.completed" 
        @click="markAsCompleted"
        class="btn btn-primary btn-sm"
        :disabled="loading"
      >
        <i class="fas fa-check"></i> Mark as Complete
      </button>
      <button 
        v-else 
        @click="showDetails"
        class="btn btn-outline btn-sm"
      >
        <i class="fas fa-eye"></i> View Details
      </button>
      <button 
        v-if="!workout.completed" 
        @click="showDetails"
        class="btn btn-outline btn-sm"
      >
        <i class="fas fa-play"></i> Start Workout
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkoutCard',
  props: {
    workout: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    workoutIcon() {
      // Map workout categories to appropriate icons
      const iconMap = {
        cardio: 'fas fa-running',
        strength: 'fas fa-dumbbell',
        flexibility: 'fas fa-child',
        hiit: 'fas fa-bolt',
        yoga: 'fas fa-pray',
        default: 'fas fa-dumbbell'
      };
      
      return iconMap[this.workout.category.toLowerCase()] || iconMap.default;
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    async markAsCompleted() {
      this.loading = true;
      
      try {
        // This would call store action to mark workout as completed
        // For example:
        // await this.$store.dispatch('completeWorkout', {
        //   workoutId: this.workout.id,
        //   completedAt: new Date().toISOString()
        // });
        
        // For demo purposes, emit an event that parent can handle
        this.$emit('complete', this.workout.id);
      } catch (error) {
        console.error('Error completing workout:', error);
      } finally {
        this.loading = false;
      }
    },
    
    showDetails() {
      // Navigate to workout details page or emit event to show modal
      this.$emit('details', this.workout.id);
    }
  }
};
</script>

<style scoped>
.workout-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-md);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  border-left: 4px solid transparent;
}

.workout-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.workout-card.completed {
  border-left-color: var(--success-color);
}

.workout-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.workout-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: var(--border-radius-round);
  color: var(--primary-color);
  font-size: var(--font-size-lg);
  margin-right: var(--spacing-md);
}

.workout-info {
  flex: 1;
}

.workout-title {
  font-size: var(--font-size-md);
  margin: 0 0 var(--spacing-xs);
}

.workout-meta {
  display: flex;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.workout-category {
  margin-right: var(--spacing-md);
}

.workout-duration i {
  margin-right: var(--spacing-xs);
}

.workout-completed-badge {
  color: var(--success-color);
  font-size: var(--font-size-lg);
}

.workout-body {
  padding: var(--spacing-md);
}

.workout-description {
  margin-bottom: var(--spacing-md);
}

.workout-exercises {
  margin-bottom: var(--spacing-md);
}

.exercises-title {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

.exercises-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exercise-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  border-bottom: 1px dashed var(--border-color);
}

.exercise-name {
  font-weight: 500;
}

.exercise-detail {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.workout-completion {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.completion-text {
  color: var(--success-color);
  font-weight: 500;
  display: flex;
  align-items: center;
}

.completion-text i {
  margin-right: var(--spacing-xs);
}

.workout-stats {
  display: flex;
  margin-top: var(--spacing-sm);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: var(--border-radius-sm);
  margin-right: var(--spacing-sm);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.workout-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.workout-footer button {
  margin-left: var(--spacing-sm);
}

@media (max-width: 576px) {
  .workout-header {
    flex-wrap: wrap;
  }
  
  .workout-completed-badge {
    margin-left: auto;
  }
  
  .workout-footer {
    flex-direction: column;
  }
  
  .workout-footer button {
    margin: 0 0 var(--spacing-sm);
    width: 100%;
  }
  
  .workout-footer button:last-child {
    margin-bottom: 0;
  }
}
</style>

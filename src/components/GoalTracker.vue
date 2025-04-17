<template>
  <div class="goal-tracker">
    <div class="goal-header">
      <h3 class="goal-title">{{ goal.title }}</h3>
      <div class="goal-timeframe">
        <i class="far fa-calendar-alt"></i>
        {{ formatDate(goal.startDate) }} - {{ formatDate(goal.endDate) }}
      </div>
    </div>
    
    <div class="goal-progress">
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="progress-stats">
        <div class="progress-percentage">{{ Math.round(progress) }}%</div>
        <div class="progress-values">
          {{ goalCurrentValue }} / {{ goal.targetValue }} {{ goal.unit }}
        </div>
      </div>
    </div>
    
    <div class="goal-details">
      <div class="goal-metrics" v-if="goal.metrics && goal.metrics.length">
        <div 
          v-for="(metric, index) in goal.metrics" 
          :key="index"
          class="metric-item"
        >
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-value">{{ metric.value }}</div>
        </div>
      </div>
      
      <div class="goal-description" v-if="goal.description">
        <p>{{ goal.description }}</p>
      </div>
    </div>
    
    <div class="goal-footer">
      <button 
        @click="updateGoal"
        class="btn btn-outline btn-sm"
      >
        <i class="fas fa-edit"></i> Update
      </button>
      <button 
        v-if="!goal.completed && progress >= 100" 
        @click="completeGoal"
        class="btn btn-primary btn-sm"
      >
        <i class="fas fa-trophy"></i> Mark as Achieved
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoalTracker',
  props: {
    goal: {
      type: Object,
      required: true
    }
  },
  computed: {
    goalCurrentValue() {
      return this.goal.currentValue || 0;
    },
    progress() {
      // Calculate progress percentage
      if (!this.goal.targetValue) return 0;
      
      const current = this.goalCurrentValue;
      const target = this.goal.targetValue;
      
      // If it's a reduce goal (like weight loss), invert the calculation
      if (this.goal.isReduceGoal) {
        const total = this.goal.startValue - target;
        const achieved = this.goal.startValue - current;
        return Math.min(100, Math.max(0, (achieved / total) * 100));
      }
      
      // Regular goal (increasing value)
      return Math.min(100, Math.max(0, (current / target) * 100));
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return 'N/A';
      
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    updateGoal() {
      // Emit event to update goal (open modal/form)
      this.$emit('update', this.goal.id);
    },
    
    completeGoal() {
      // Emit event to mark goal as completed
      this.$emit('complete', this.goal.id);
    }
  }
};
</script>

<style scoped>
.goal-tracker {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-md);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  border-left: 4px solid var(--primary-color);
}

.goal-tracker:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.goal-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.goal-title {
  font-size: var(--font-size-md);
  margin: 0 0 var(--spacing-xs);
}

.goal-timeframe {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.goal-timeframe i {
  margin-right: var(--spacing-xs);
}

.goal-progress {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.progress-bar-container {
  height: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: var(--border-radius-lg);
  transition: width 0.5s ease-out;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-percentage {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
}

.progress-values {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.goal-details {
  padding: var(--spacing-md);
}

.goal-metrics {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -var(--spacing-xs) var(--spacing-md);
}

.metric-item {
  flex: 1;
  min-width: 100px;
  padding: var(--spacing-sm);
  margin: 0 var(--spacing-xs) var(--spacing-xs);
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: var(--border-radius-sm);
  text-align: center;
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.metric-value {
  font-size: var(--font-size-md);
  font-weight: 600;
}

.goal-description {
  font-size: var(--font-size-sm);
  color: var(--text-color);
}

.goal-description p {
  margin: 0;
}

.goal-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.goal-footer button {
  margin-left: var(--spacing-sm);
}

@media (max-width: 576px) {
  .goal-footer {
    flex-direction: column;
  }
  
  .goal-footer button {
    margin: 0 0 var(--spacing-sm);
    width: 100%;
  }
  
  .goal-footer button:last-child {
    margin-bottom: 0;
  }
}
</style>

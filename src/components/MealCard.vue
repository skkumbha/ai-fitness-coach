<template>
  <div class="meal-card">
    <div class="meal-header">
      <div class="meal-type-badge" :class="mealTypeClass">
        {{ meal.type }}
      </div>
      <h3 class="meal-title">{{ meal.title }}</h3>
      <div class="meal-macros">
        <div class="macro-item">
          <span class="macro-value">{{ meal.calories }}</span>
          <span class="macro-label">cal</span>
        </div>
        <div class="macro-item">
          <span class="macro-value">{{ meal.protein }}g</span>
          <span class="macro-label">protein</span>
        </div>
        <div class="macro-item">
          <span class="macro-value">{{ meal.carbs }}g</span>
          <span class="macro-label">carbs</span>
        </div>
        <div class="macro-item">
          <span class="macro-value">{{ meal.fat }}g</span>
          <span class="macro-label">fat</span>
        </div>
      </div>
    </div>
    
    <div class="meal-body">
      <p class="meal-description">{{ meal.description }}</p>
      
      <div v-if="meal.ingredients && meal.ingredients.length" class="meal-ingredients">
        <h4 class="ingredients-title">Ingredients:</h4>
        <ul class="ingredients-list">
          <li v-for="(ingredient, index) in meal.ingredients" :key="index" class="ingredient-item">
            {{ ingredient }}
          </li>
        </ul>
      </div>
      
      <div v-if="meal.instructions && meal.instructions.length" class="meal-instructions">
        <h4 class="instructions-title">Instructions:</h4>
        <ol class="instructions-list">
          <li v-for="(instruction, index) in meal.instructions" :key="index" class="instruction-item">
            {{ instruction }}
          </li>
        </ol>
      </div>
      
      <div v-if="meal.tags && meal.tags.length" class="meal-tags">
        <span 
          v-for="(tag, index) in meal.tags" 
          :key="index" 
          class="meal-tag"
        >
          {{ tag }}
        </span>
      </div>
    </div>
    
    <div class="meal-footer">
      <button 
        v-if="!meal.saved" 
        @click="saveMeal"
        class="btn btn-outline btn-sm"
        :disabled="loading"
      >
        <i class="far fa-bookmark"></i> Save Recipe
      </button>
      <button 
        v-else 
        @click="unsaveMeal"
        class="btn btn-outline btn-sm saved"
        :disabled="loading"
      >
        <i class="fas fa-bookmark"></i> Saved
      </button>
      <button 
        @click="logMeal"
        class="btn btn-primary btn-sm"
        :disabled="loading"
      >
        <i class="fas fa-utensils"></i> Log Meal
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MealCard',
  props: {
    meal: {
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
    mealTypeClass() {
      // Map meal types to CSS classes
      const classMap = {
        breakfast: 'breakfast',
        lunch: 'lunch',
        dinner: 'dinner',
        snack: 'snack',
        default: 'default'
      };
      
      return classMap[this.meal.type.toLowerCase()] || classMap.default;
    }
  },
  methods: {
    async saveMeal() {
      this.loading = true;
      
      try {
        // This would call store action to save meal
        // For example:
        // await this.$store.dispatch('saveMeal', this.meal.id);
        
        // For demo purposes, emit an event that parent can handle
        this.$emit('save', this.meal.id);
      } catch (error) {
        console.error('Error saving meal:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async unsaveMeal() {
      this.loading = true;
      
      try {
        // This would call store action to unsave meal
        // For example:
        // await this.$store.dispatch('unsaveMeal', this.meal.id);
        
        // For demo purposes, emit an event that parent can handle
        this.$emit('unsave', this.meal.id);
      } catch (error) {
        console.error('Error unsaving meal:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async logMeal() {
      this.loading = true;
      
      try {
        // This would call store action to log meal
        // For example:
        // await this.$store.dispatch('logMeal', {
        //   mealId: this.meal.id,
        //   consumedAt: new Date().toISOString()
        // });
        
        // For demo purposes, emit an event that parent can handle
        this.$emit('log', this.meal.id);
      } catch (error) {
        console.error('Error logging meal:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.meal-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-md);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.meal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.meal-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.meal-type-badge {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.meal-type-badge.breakfast {
  background-color: rgba(255, 193, 7, 0.2);
  color: #f57c00;
}

.meal-type-badge.lunch {
  background-color: rgba(33, 150, 243, 0.2);
  color: #1976d2;
}

.meal-type-badge.dinner {
  background-color: rgba(156, 39, 176, 0.2);
  color: #7b1fa2;
}

.meal-type-badge.snack {
  background-color: rgba(76, 175, 80, 0.2);
  color: #388e3c;
}

.meal-type-badge.default {
  background-color: rgba(158, 158, 158, 0.2);
  color: #616161;
}

.meal-title {
  font-size: var(--font-size-md);
  margin: 0 0 var(--spacing-md);
  padding-right: 80px; /* Make room for the type badge */
}

.meal-macros {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -var(--spacing-xs);
}

.macro-item {
  padding: var(--spacing-xs);
  margin: 0 var(--spacing-xs) var(--spacing-xs);
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: var(--border-radius-sm);
  text-align: center;
  min-width: 60px;
}

.macro-value {
  display: block;
  font-weight: 700;
  color: var(--text-color);
}

.macro-label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.meal-body {
  padding: var(--spacing-md);
}

.meal-description {
  margin-bottom: var(--spacing-md);
}

.meal-ingredients,
.meal-instructions {
  margin-bottom: var(--spacing-md);
}

.ingredients-title,
.instructions-title {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

.ingredients-list,
.instructions-list {
  padding-left: 1.5rem;
  margin: 0;
}

.ingredient-item,
.instruction-item {
  margin-bottom: var(--spacing-xs);
}

.meal-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--spacing-md);
}

.meal-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin: 0 var(--spacing-xs) var(--spacing-xs) 0;
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-secondary);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
}

.meal-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.meal-footer button {
  margin-left: var(--spacing-sm);
}

.btn.saved {
  color: var(--primary-color);
}

@media (max-width: 576px) {
  .meal-macros {
    justify-content: space-between;
  }
  
  .macro-item {
    min-width: calc(50% - var(--spacing-md));
  }
  
  .meal-footer {
    flex-direction: column;
  }
  
  .meal-footer button {
    margin: 0 0 var(--spacing-sm);
    width: 100%;
  }
  
  .meal-footer button:last-child {
    margin-bottom: 0;
  }
}
</style>

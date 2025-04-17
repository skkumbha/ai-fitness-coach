<template>
  <div class="nutrition-page">
    <div class="container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Nutrition</h1>
          <p class="page-subtitle">
            Personalized meal suggestions and nutrition tracking to fuel your fitness goals
          </p>
        </div>
        
        <div class="header-actions">
          <button @click="openFilterOptions" class="btn btn-outline">
            <i class="fas fa-filter"></i> Filter
          </button>
          <button @click="refreshMeals" class="btn btn-primary">
            <i :class="refreshing ? 'fas fa-circle-notch fa-spin' : 'fas fa-sync-alt'"></i> 
            Refresh Suggestions
          </button>
        </div>
      </div>
      
      <div class="nutrition-stats">
        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Daily Calories</h3>
            <i class="fas fa-fire-alt stat-icon"></i>
          </div>
          <div class="stat-value">{{ macroSummary.calories }} / {{ macroSummary.calorieGoal }}</div>
          <div class="stat-progress">
            <div class="progress-bar" 
                :style="{ width: `${Math.min(100, (macroSummary.calories / macroSummary.calorieGoal) * 100)}%` }">
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Protein</h3>
            <i class="fas fa-drumstick-bite stat-icon"></i>
          </div>
          <div class="stat-value">{{ macroSummary.protein }}g / {{ macroSummary.proteinGoal }}g</div>
          <div class="stat-progress">
            <div class="progress-bar" 
                :style="{ width: `${Math.min(100, (macroSummary.protein / macroSummary.proteinGoal) * 100)}%` }">
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Carbs</h3>
            <i class="fas fa-bread-slice stat-icon"></i>
          </div>
          <div class="stat-value">{{ macroSummary.carbs }}g / {{ macroSummary.carbsGoal }}g</div>
          <div class="stat-progress">
            <div class="progress-bar" 
                :style="{ width: `${Math.min(100, (macroSummary.carbs / macroSummary.carbsGoal) * 100)}%` }">
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Fat</h3>
            <i class="fas fa-cheese stat-icon"></i>
          </div>
          <div class="stat-value">{{ macroSummary.fat }}g / {{ macroSummary.fatGoal }}g</div>
          <div class="stat-progress">
            <div class="progress-bar" 
                :style="{ width: `${Math.min(100, (macroSummary.fat / macroSummary.fatGoal) * 100)}%` }">
            </div>
          </div>
        </div>
      </div>
      
      <div class="filters-bar" v-if="showFilters">
        <div class="filter-group">
          <label for="mealType">Meal Type:</label>
          <select id="mealType" v-model="filters.mealType" class="form-select">
            <option value="">All Meal Types</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="dietRestriction">Dietary Restrictions:</label>
          <select id="dietRestriction" v-model="filters.dietaryRestriction" class="form-select">
            <option value="">None</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten-free">Gluten-Free</option>
            <option value="dairy-free">Dairy-Free</option>
            <option value="keto">Keto</option>
            <option value="paleo">Paleo</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="maxCalories">Max Calories:</label>
          <input 
            id="maxCalories" 
            v-model="filters.maxCalories" 
            type="number" 
            min="0" 
            step="50" 
            class="form-control"
            placeholder="Any"
          />
        </div>
        
        <div class="filter-group">
          <label for="minProtein">Min Protein (g):</label>
          <input 
            id="minProtein" 
            v-model="filters.minProtein" 
            type="number" 
            min="0" 
            step="5" 
            class="form-control"
            placeholder="Any"
          />
        </div>
        
        <button @click="applyFilters" class="btn btn-primary">Apply</button>
        <button @click="resetFilters" class="btn btn-outline">Reset</button>
      </div>
      
      <div class="meals-section">
        <div class="section-header">
          <h2 class="section-title">Today's Meal Log</h2>
          <button @click="openMealLogModal" class="btn btn-outline btn-sm">
            <i class="fas fa-plus"></i> Log Meal
          </button>
        </div>
        
        <div v-if="loading" class="loading-container">
          <LoadingSpinner message="Loading meal data..." />
        </div>
        
        <div v-else-if="loggedMeals.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-utensils"></i>
          </div>
          <h3>No meals logged today</h3>
          <p>Start tracking your nutrition by logging your meals.</p>
          <button @click="openMealLogModal" class="btn btn-primary">
            <i class="fas fa-plus"></i> Log Your First Meal
          </button>
        </div>
        
        <div v-else class="meal-log-summary">
          <div v-for="(meal, index) in loggedMeals" :key="index" class="logged-meal-card">
            <div class="meal-time">{{ formatTime(meal.loggedAt) }}</div>
            <div class="meal-content">
              <h3 class="meal-title">{{ meal.title }}</h3>
              <div class="meal-macros">
                <span class="macro-item">{{ meal.calories }} cal</span>
                <span class="macro-item">{{ meal.protein }}g protein</span>
                <span class="macro-item">{{ meal.carbs }}g carbs</span>
                <span class="macro-item">{{ meal.fat }}g fat</span>
              </div>
            </div>
            <div class="meal-actions">
              <button @click="editMeal(meal)" class="btn-icon">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteMeal(meal.id)" class="btn-icon text-error">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="meal-suggestions">
        <div class="section-header">
          <h2 class="section-title">Meal Suggestions</h2>
          <div class="section-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        
        <div v-if="loading" class="loading-container">
          <LoadingSpinner message="Loading meal suggestions..." />
        </div>
        
        <div v-else-if="filteredMealSuggestions.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-hamburger"></i>
          </div>
          <h3>No meal suggestions available</h3>
          <p v-if="isFiltered">Try adjusting your filters or dietary preferences.</p>
          <p v-else>We'll create personalized meal suggestions based on your goals.</p>
          <button @click="refreshMeals" class="btn btn-primary">
            <i class="fas fa-sync-alt"></i> Get Suggestions
          </button>
        </div>
        
        <div v-else class="meal-cards">
          <MealCard 
            v-for="meal in filteredMealSuggestions" 
            :key="meal.id"
            :meal="meal"
            @save="saveMeal"
            @unsave="unsaveMeal"
            @log="logMealFromSuggestion"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import MealCard from '@/components/MealCard.vue';
import { getMealHistory, logMeal } from '@/api/nutrition';

export default {
  name: 'NutritionPage',
  components: {
    LoadingSpinner,
    MealCard
  },
  data() {
    return {
      loading: true,
      refreshing: false,
      showFilters: false,
      filters: {
        mealType: '',
        dietaryRestriction: '',
        maxCalories: '',
        minProtein: ''
      },
      loggedMeals: [],
      activeTab: 'all',
      tabs: [
        { id: 'all', label: 'All Meals' },
        { id: 'breakfast', label: 'Breakfast' },
        { id: 'lunch', label: 'Lunch' },
        { id: 'dinner', label: 'Dinner' },
        { id: 'snack', label: 'Snacks' }
      ],
      macroSummary: {
        calories: 1250,
        calorieGoal: 2000,
        protein: 85,
        proteinGoal: 120,
        carbs: 110,
        carbsGoal: 200,
        fat: 50,
        fatGoal: 65
      }
    };
  },
  computed: {
    mealSuggestions() {
      return this.$store.getters.mealSuggestions || [];
    },
    
    isFiltered() {
      return this.filters.mealType !== '' || 
             this.filters.dietaryRestriction !== '' || 
             this.filters.maxCalories !== '' || 
             this.filters.minProtein !== '';
    },
    
    filteredMealSuggestions() {
      let filtered = [...this.mealSuggestions];
      
      // First filter by tab (meal type)
      if (this.activeTab !== 'all') {
        filtered = filtered.filter(meal => 
          meal.type?.toLowerCase() === this.activeTab.toLowerCase()
        );
      }
      
      // Then apply other filters
      if (this.filters.mealType) {
        filtered = filtered.filter(meal => 
          meal.type?.toLowerCase() === this.filters.mealType.toLowerCase()
        );
      }
      
      if (this.filters.dietaryRestriction) {
        filtered = filtered.filter(meal => 
          meal.tags?.some(tag => 
            tag.toLowerCase().includes(this.filters.dietaryRestriction.toLowerCase())
          )
        );
      }
      
      if (this.filters.maxCalories) {
        const maxCal = parseInt(this.filters.maxCalories);
        filtered = filtered.filter(meal => 
          !meal.calories || meal.calories <= maxCal
        );
      }
      
      if (this.filters.minProtein) {
        const minProt = parseInt(this.filters.minProtein);
        filtered = filtered.filter(meal => 
          meal.protein && meal.protein >= minProt
        );
      }
      
      return filtered;
    }
  },
  async mounted() {
    await this.fetchNutritionData();
  },
  methods: {
    async fetchNutritionData() {
      this.loading = true;
      
      try {
        // Fetch meal suggestions
        await this.$store.dispatch('fetchMealSuggestions');
        
        // Fetch meal history
        await this.fetchMealHistory();
        
        // For demo purposes, we'll calculate macro summary from logged meals
        this.calculateMacroSummary();
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async refreshMeals() {
      this.refreshing = true;
      await this.$store.dispatch('fetchMealSuggestions');
      this.refreshing = false;
    },
    
    async fetchMealHistory() {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // In a real app, we'd fetch from the API
        // const response = await getMealHistory({ date: today });
        // this.loggedMeals = response;
        
        // For demo purposes, use sample data
        this.loggedMeals = [
          {
            id: 'meal-log-1',
            title: 'Overnight Oats with Berries',
            type: 'breakfast',
            calories: 320,
            protein: 15,
            carbs: 42,
            fat: 8,
            loggedAt: '2023-07-20T07:30:00.000Z'
          },
          {
            id: 'meal-log-2',
            title: 'Grilled Chicken Salad',
            type: 'lunch',
            calories: 420,
            protein: 35,
            carbs: 25,
            fat: 18,
            loggedAt: '2023-07-20T12:15:00.000Z'
          },
          {
            id: 'meal-log-3',
            title: 'Protein Shake',
            type: 'snack',
            calories: 180,
            protein: 25,
            carbs: 10,
            fat: 3,
            loggedAt: '2023-07-20T15:45:00.000Z'
          }
        ];
      } catch (error) {
        console.error('Error fetching meal history:', error);
      }
    },
    
    calculateMacroSummary() {
      // In a real app, this would be fetched from the API
      // This is just a placeholder for the demo
      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      
      this.loggedMeals.forEach(meal => {
        calories += meal.calories || 0;
        protein += meal.protein || 0;
        carbs += meal.carbs || 0;
        fat += meal.fat || 0;
      });
      
      this.macroSummary = {
        ...this.macroSummary,
        calories,
        protein,
        carbs,
        fat
      };
    },
    
    openFilterOptions() {
      this.showFilters = !this.showFilters;
    },
    
    applyFilters() {
      // Logic to apply filters
      // Reset active tab if meal type is selected
      if (this.filters.mealType) {
        this.activeTab = 'all';
      }
    },
    
    resetFilters() {
      this.filters = {
        mealType: '',
        dietaryRestriction: '',
        maxCalories: '',
        minProtein: ''
      };
    },
    
    saveMeal(mealId) {
      // Just UI update for demo
      const updatedMeals = this.mealSuggestions.map(meal => {
        if (meal.id === mealId) {
          return { ...meal, saved: true };
        }
        return meal;
      });
      
      this.$store.commit('setMealSuggestions', updatedMeals);
    },
    
    unsaveMeal(mealId) {
      // Just UI update for demo
      const updatedMeals = this.mealSuggestions.map(meal => {
        if (meal.id === mealId) {
          return { ...meal, saved: false };
        }
        return meal;
      });
      
      this.$store.commit('setMealSuggestions', updatedMeals);
    },
    
    logMealFromSuggestion(mealId) {
      const meal = this.mealSuggestions.find(m => m.id === mealId);
      if (meal) {
        // In a real app, we'd call the API
        // For demo, just add to logged meals
        const loggedMeal = {
          id: `logged-${meal.id}`,
          title: meal.title,
          type: meal.type,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          loggedAt: new Date().toISOString()
        };
        
        this.loggedMeals.push(loggedMeal);
        this.calculateMacroSummary();
        
        // Show success message
        alert(`${meal.title} logged successfully!`);
      }
    },
    
    openMealLogModal() {
      // Would open a modal to log a custom meal
      alert('Open meal log modal');
    },
    
    editMeal(meal) {
      // Would open a modal to edit a logged meal
      alert(`Edit meal: ${meal.title}`);
    },
    
    deleteMeal(mealId) {
      // Confirm deletion
      if (!confirm('Are you sure you want to remove this meal from your log?')) {
        return;
      }
      
      // Remove from logged meals
      this.loggedMeals = this.loggedMeals.filter(meal => meal.id !== mealId);
      
      // Recalculate macros
      this.calculateMacroSummary();
    },
    
    formatTime(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
};
</script>

<style scoped>
.nutrition-page {
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

.nutrition-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.stat-progress {
  height: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: var(--border-radius-lg);
  transition: width 0.5s ease-out;
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
  flex: 1;
}

.filter-group label {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.form-select, .form-control {
  padding: 0.375rem 0.75rem;
  font-size: var(--font-size-md);
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.section-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  margin-bottom: -1px;
}

.section-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.tab-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--primary-color);
}

.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.meals-section, .meal-suggestions {
  margin-bottom: var(--spacing-xl);
}

.logged-meal-card {
  display: flex;
  align-items: center;
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
}

.meal-time {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  margin-right: var(--spacing-md);
  font-size: var(--font-size-sm);
  min-width: 80px;
  text-align: center;
}

.meal-content {
  flex: 1;
}

.meal-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin: 0 0 var(--spacing-xs);
}

.meal-macros {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.macro-item {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.meal-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
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

.btn-icon.text-error:hover {
  color: var(--error-color);
}

.meal-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-md);
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
  
  .meal-cards {
    grid-template-columns: 1fr;
  }
  
  .logged-meal-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .meal-time {
    margin-right: 0;
    margin-bottom: var(--spacing-sm);
  }
  
  .meal-actions {
    margin-top: var(--spacing-sm);
    align-self: flex-end;
  }
}
</style>

import API from './index';

/**
 * Get meal suggestions based on user profile and preferences
 * @param {Object} preferences - Optional meal preferences
 * @returns {Promise} - Promise with meal suggestions
 */
export const getMealSuggestions = async (preferences = {}) => {
  try {
    const response = await API.get('/nutrition/meal-suggestions', {
      params: preferences
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch meal suggestions.');
  }
};

/**
 * Get detailed nutrition information for a specific meal
 * @param {string} mealId - Meal ID
 * @returns {Promise} - Promise with meal details
 */
export const getMealDetails = async (mealId) => {
  try {
    const response = await API.get(`/nutrition/meals/${mealId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch meal details.');
  }
};

/**
 * Log a meal that the user has consumed
 * @param {Object} mealData - Meal data to log
 * @returns {Promise} - Promise with logged meal data
 */
export const logMeal = async (mealData) => {
  try {
    const response = await API.post('/nutrition/log-meal', mealData);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to log meal.');
  }
};

/**
 * Get user's meal history
 * @param {Object} params - Query parameters (date range, etc.)
 * @returns {Promise} - Promise with meal history data
 */
export const getMealHistory = async (params = {}) => {
  try {
    const response = await API.get('/nutrition/meal-history', {
      params
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch meal history.');
  }
};

/**
 * Get nutrition statistics
 * @param {Object} params - Query parameters (timeframe, etc.)
 * @returns {Promise} - Promise with nutrition statistics
 */
export const getNutritionStats = async (params = {}) => {
  try {
    const response = await API.get('/nutrition/stats', {
      params
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch nutrition statistics.');
  }
};

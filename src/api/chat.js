import API from './index';

/**
 * Get the user's chat history with the AI assistant
 * @returns {Promise} - Promise with chat message history
 */
export const getChatHistory = async () => {
  try {
    const response = await API.get('/chat/history');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch chat history.');
  }
};

/**
 * Send a message to the AI assistant
 * @param {string} message - Message text to send
 * @param {string} idempotencyKey - Unique key for idempotency (client-generated)
 * @returns {Promise} - Promise with AI response message
 */
export const sendChatMessage = async (message, idempotencyKey) => {
  try {
    const response = await API.post('/chat/message', { 
      message,
      idempotencyKey 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to send message to assistant.');
  }
};

/**
 * Get AI assistant fitness suggestions
 * @returns {Promise} - Promise with fitness suggestions
 */
export const getFitnessSuggestions = async () => {
  try {
    const response = await API.get('/chat/suggestions/fitness');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch fitness suggestions.');
  }
};

/**
 * Get AI assistant nutrition suggestions
 * @returns {Promise} - Promise with nutrition suggestions
 */
export const getNutritionSuggestions = async () => {
  try {
    const response = await API.get('/chat/suggestions/nutrition');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch nutrition suggestions.');
  }
};

/**
 * Request a custom AI-generated workout plan
 * @param {Object} requirements - Workout plan requirements
 * @returns {Promise} - Promise with generated workout plan
 */
export const requestWorkoutPlan = async (requirements) => {
  try {
    const response = await API.post('/chat/generate-workout-plan', requirements);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to generate workout plan.');
  }
};

/**
 * Request a custom AI-generated meal plan
 * @param {Object} requirements - Meal plan requirements
 * @returns {Promise} - Promise with generated meal plan
 */
export const requestMealPlan = async (requirements) => {
  try {
    const response = await API.post('/chat/generate-meal-plan', requirements);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to generate meal plan.');
  }
};

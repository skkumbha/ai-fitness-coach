import API from './index';

/**
 * Get the user's workout history
 * @returns {Promise} - Promise with workout history data
 */
export const getWorkoutHistory = async () => {
  try {
    const response = await API.get('/workouts/history');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch workout history.');
  }
};

/**
 * Get details for a specific workout
 * @param {string} workoutId - Workout ID
 * @returns {Promise} - Promise with workout details data
 */
export const getWorkoutById = async (workoutId) => {
  try {
    const response = await API.get(`/workouts/${workoutId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch workout details.');
  }
};

/**
 * Get recommended workouts for the user
 * @returns {Promise} - Promise with recommended workouts data
 */
export const getRecommendedWorkouts = async () => {
  try {
    const response = await API.get('/workouts/recommended');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch workout recommendations.');
  }
};

/**
 * Track a completed workout
 * @param {Object} workoutData - Workout completion data
 * @returns {Promise} - Promise with tracked workout data
 */
export const trackWorkoutCompletion = async (workoutData) => {
  try {
    const response = await API.post('/workouts/track', workoutData);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to track workout completion.');
  }
};

/**
 * Get workout statistics
 * @param {Object} params - Query parameters (timeframe, etc)
 * @returns {Promise} - Promise with workout statistics data
 */
export const getWorkoutStats = async (params = {}) => {
  try {
    const response = await API.get('/workouts/stats', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch workout statistics.');
  }
};

/**
 * Get progress for a specific goal
 * @param {string} goalId - Goal ID
 * @returns {Promise} - Promise with goal progress data
 */
export const getGoalProgress = async (goalId) => {
  try {
    const response = await API.get(`/workouts/goals/${goalId}/progress`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch goal progress.');
  }
};

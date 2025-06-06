import API from './index';

/**
 * Get the current user's profile
 * @returns {Promise} - Promise with user data
 */
export const getProfile = async () => {
  try {
    const response = await API.get('/auth/user/profile');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch user profile.');
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} - Promise with updated user data
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await API.put('/auth/user/profile', profileData);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update profile.');
  }
};

/**
 * Update user profile picture
 * @param {File} imageFile - Profile image file
 * @returns {Promise} - Promise with updated user data including image URL
 */
export const updateProfilePicture = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', imageFile);
    
    const response = await API.post('/auth/user/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to upload profile picture.');
  }
};

/**
 * Complete user onboarding
 * @param {Object} onboardingData - User onboarding responses
 * @returns {Promise} - Promise with updated user data
 */
export const completeOnboarding = async (onboardingData) => {
  try {
    const response = await API.post('/auth/user/onboarding', onboardingData);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to complete onboarding.');
  }
};

/**
 * Get user fitness goals
 * @returns {Promise} - Promise with user goals data
 */
export const getFitnessGoals = async () => {
  try {
    const response = await API.get('/auth/user/goals');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch fitness goals.');
  }
};

/**
 * Update user fitness goals
 * @param {Object} goalsData - Updated goals data
 * @returns {Promise} - Promise with updated goals data
 */
export const updateFitnessGoals = async (goalsData) => {
  try {
    const response = await API.put('/user/goals', goalsData);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update fitness goals.');
  }
};

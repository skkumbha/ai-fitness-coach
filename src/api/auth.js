import API from './index';

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Promise with auth token and user data
 */
export const login = async (userName, password) => {
  try {
    const response = await API.post('/auth/login', { userName, password });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Login failed. Please check your credentials.');
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Promise with auth token and user data
 */
export const signup = async (userData) => {
  try {
    const response = await API.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
};

/**
 * Logout the current user
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    const response = await API.post('/auth/logout');
    return response.data;
  } catch (error) {
    // Even if the server logout fails, we still want to clear local data
    console.error('Logout error:', error);
    // Don't throw an error as we want to complete the local logout
    return { success: true };
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise}
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await API.post('/auth/password-reset-request', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to request password reset.');
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise}
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await API.post('/auth/password-reset', { 
      token, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to reset password.');
  }
};

// Staging/QA Environment Configuration
export const stagingConfig = {
  NODE_ENV: 'staging',
  VITE_APP_TITLE: 'FitCoach AI - Staging',
  
  // Staging API endpoints (can be same as production for testing)
  VITE_API_BASE_URL: 'https://fit.kish.rs/api',
  VITE_WEBSOCKET_URL: 'wss://fit.kish.rs/ws',
  
  // Staging settings
  VITE_APP_ENVIRONMENT: 'staging',
  VITE_ENABLE_DEBUG: true,
  VITE_ENABLE_LOGGING: true,
  
  // Security settings
  VITE_ENABLE_HTTPS: true,
  VITE_ENABLE_CSP: true
};

export default stagingConfig;

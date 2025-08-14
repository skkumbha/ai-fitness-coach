// Production Environment Configuration
export const productionConfig = {
  NODE_ENV: 'production',
  VITE_APP_TITLE: 'FitCoach AI - Production',
  
  // Production API endpoints
  VITE_API_BASE_URL: 'https://fit.kish.rs/api',
  VITE_WEBSOCKET_URL: 'wss://fit.kish.rs/ws',
  
  // Production settings
  VITE_APP_ENVIRONMENT: 'production',
  VITE_ENABLE_DEBUG: false,
  VITE_ENABLE_LOGGING: false,
  
  // Security settings
  VITE_ENABLE_HTTPS: true,
  VITE_ENABLE_CSP: true
};

export default productionConfig;

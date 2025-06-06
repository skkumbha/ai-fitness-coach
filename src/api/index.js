import axios from 'axios';
import store from '@/store';
import router from '@/router';

// Create axios instance with default config
const API = axios.create({
  baseURL: 'http://localhost:8080/api', // Backend API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for API calls
API.interceptors.request.use(
  (config) => {
    const token = store.state.token;
    console.log('🔵 [API] Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      headers: config.headers
    });
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ [API] Authorization header set');
    } else {
      console.log('⚠️ [API] No token available for request');
    }
    return config;
  },
  (error) => {
    console.error('❌ [API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
API.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('❌ [API] Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log('⚠️ [API] 401 Unauthorized error, clearing token');
      originalRequest._retry = true;
      
      // If token has expired, redirect to login
      store.commit('setToken', null);
      store.commit('setUser', null);
      
      if (router.currentRoute.value.meta.requiresAuth) {
        console.log('🔵 [API] Redirecting to login page');
        router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
      }
    }
    
    // Handle errors with custom messages from the backend
    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message;
    }
    
    return Promise.reject(error);
  }
);

export default API;

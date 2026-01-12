// Jamendo API Client
import axios from 'axios';
import { JAMENDO_CONFIG } from './config';

const jamendoClient = axios.create({
  baseURL: JAMENDO_CONFIG.BASE_URL,
  params: {
    client_id: JAMENDO_CONFIG.CLIENT_ID,
    format: JAMENDO_CONFIG.FORMAT,
  },
  timeout: 15000, // Tăng timeout lên 15s
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function to delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Request interceptor for logging
jamendoClient.interceptors.request.use(
  (config) => {
    console.log('[Jamendo API]', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling with retry logic
jamendoClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }
    
    // Check if we should retry (only for network errors or 5xx errors)
    const shouldRetry = 
      (error.message === 'Network Error' || 
       (error.response && error.response.status >= 500)) &&
      config.__retryCount < MAX_RETRIES;
    
    if (shouldRetry) {
      config.__retryCount += 1;
      console.log(`[Jamendo API] Retrying request (${config.__retryCount}/${MAX_RETRIES})...`);
      
      // Wait before retrying
      await delay(RETRY_DELAY * config.__retryCount);
      
      // Create new instance for retry to avoid interceptor loop
      return axios(config);
    }
    
    console.error('[Jamendo API Error]', error.message);
    return Promise.reject(error);
  }
);

export default jamendoClient;

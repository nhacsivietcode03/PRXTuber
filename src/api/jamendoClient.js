// Jamendo API Client
import axios from 'axios';
import { JAMENDO_CONFIG } from './config';

const jamendoClient = axios.create({
  baseURL: JAMENDO_CONFIG.BASE_URL,
  params: {
    client_id: JAMENDO_CONFIG.CLIENT_ID,
    format: JAMENDO_CONFIG.FORMAT,
  },
  timeout: 10000,
});

// Request interceptor for logging
jamendoClient.interceptors.request.use(
  (config) => {
    console.log('[Jamendo API]', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
jamendoClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Jamendo API Error]', error.message);
    return Promise.reject(error);
  }
);

export default jamendoClient;

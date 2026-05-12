import axios from 'axios';
import { API_URL } from '../config/env';

let store: any;

export const injectStore = (_store: any) => {
  store = _store;
};

/**
 * 🚀 CENTRAL API INSTANCE
 * 
 * Automatically attaches the EcomToken from the auth state
 * to all outgoing requests via an interceptor.
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Dynamically fetch the token from the current state if store is available
    if (store) {
      const state = store.getState();
      const token = state.auth.token;

      if (token) {
        if (config.headers.set) {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

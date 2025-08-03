import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  withCredentials: true, // Important for sending cookies
});

// Interceptor to add the access token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// We don't need a response interceptor for token refresh
// because the social login flow handles the token directly.
// A full refresh token flow for local login would be added here if needed.

export default api;
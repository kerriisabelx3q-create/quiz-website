import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Tự động nhận diện local hoặc internet
});

// Interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

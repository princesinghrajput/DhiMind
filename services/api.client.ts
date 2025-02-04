import axios from 'axios';

// Create axios instance
export const apiClient = axios.create({
  baseURL: 'http://192.168.1.5:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set auth token
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}; 
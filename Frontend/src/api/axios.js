import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Update this when deploying
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry or global errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized, could mean token expired. Handle logout here or let the context handle it.
      // Usually we dispatch a logout action if it's token expiry, but we'll let AuthContext handle the state for now.
    }
    return Promise.reject(error);
  }
);

export default api;

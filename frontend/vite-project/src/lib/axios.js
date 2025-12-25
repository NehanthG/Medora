import axios from "axios"

// Create axios instance with default config
export const axiosInstance = axios.create({
  baseURL: "http://localhost:5002/api",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is needed for cookies
});

// Request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip adding token for user authentication endpoints
    if (config.url.includes('/user/')) {
      return config;
    }
    
    // Only add doctor token for doctor endpoints
    if (config.url.includes('/doctor/')) {
      const token = localStorage.getItem('doctorToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized responses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only handle 401 for doctor endpoints
    if (error.response?.status === 401 && 
        originalRequest.url.includes('/doctor/') && 
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await axios.get(`${originalRequest.baseURL}/doctor/refresh-token`, {
          withCredentials: true
        });
        
        if (response.data.token) {
          const { token } = response.data;
          localStorage.setItem('doctorToken', token);
          
          // Update the Authorization header
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          // Retry the original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear auth data and redirect to login
        localStorage.removeItem('doctorToken');
        if (window.location.pathname !== '/doctor/login') {
          window.location.href = '/doctor/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

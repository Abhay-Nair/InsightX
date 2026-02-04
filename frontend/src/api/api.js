/**
 * Secure API client for InsightX
 * Implements HTTPS enforcement, secure error handling, and token management
 */

import axios from "axios";
import { getToken, getRefreshToken, saveTokens, logout, checkTokenExpiration } from "../utils/auth.js";

// Determine base URL based on environment
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // In production, enforce HTTPS
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `https://${hostname}:8000`;
    }
  }
  
  // Development fallback
  return "http://127.0.0.1:8000";
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  // Security headers
  withCredentials: false, // Set to true if using httpOnly cookies
});

// Request interceptor to add auth token and security checks
api.interceptors.request.use(
  (config) => {
    // Check token expiration before making request
    if (!checkTokenExpiration()) {
      return Promise.reject(new Error('Token expired'));
    }
    
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add security headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle different error scenarios
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${getBaseURL()}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token } = response.data;
          saveTokens(access_token, refreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout
        logout();
        return Promise.reject(error);
      }
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.warn(`Rate limited. Retry after: ${retryAfter} seconds`);
      
      // You could implement automatic retry with exponential backoff here
      return Promise.reject(new Error('Rate limit exceeded. Please try again later.'));
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
      return Promise.reject(new Error('Server error. Please try again later.'));
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    return Promise.reject(error);
  }
);

// Auth functions with enhanced security
export const login = async (email, password) => {
  try {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (email.length > 254 || password.length > 128) {
      throw new Error('Invalid input length');
    }
    
    const formData = new URLSearchParams();
    formData.append("username", email.toLowerCase().trim());
    formData.append("password", password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    
    const { access_token, refresh_token, user } = response.data;
    
    // Save tokens securely
    saveTokens(access_token, refresh_token, user);
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    
    // Sanitize error messages
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    } else if (error.response?.status === 429) {
      throw new Error('Too many login attempts. Please try again later.');
    } else if (error.response?.status === 423) {
      throw new Error('Account temporarily locked. Please try again later.');
    } else {
      throw new Error('Login failed. Please try again.');
    }
  }
};

export const register = async (name, email, password) => {
  try {
    // Validate input
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }
    
    if (name.length > 100 || email.length > 254 || password.length > 128) {
      throw new Error('Input too long');
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    const response = await api.post('/auth/register', { 
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password 
    });
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      const detail = error.response.data?.detail;
      if (typeof detail === 'object' && detail.errors) {
        throw new Error(detail.errors[0]);
      } else if (typeof detail === 'string') {
        throw new Error(detail);
      }
    } else if (error.response?.status === 429) {
      throw new Error('Too many registration attempts. Please try again later.');
    }
    
    throw new Error('Registration failed. Please try again.');
  }
};

// Dataset functions with enhanced security
export const uploadDataset = async (file) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file selected');
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }
    
    // Check file type
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedTypes.some(type => fileName.endsWith(type));
    
    if (!isValidType) {
      throw new Error('Invalid file type. Only CSV and Excel files are allowed.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 second timeout for uploads
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    
    if (error.response?.status === 413) {
      throw new Error('File too large');
    } else if (error.response?.status === 429) {
      throw new Error('Too many upload attempts. Please try again later.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.detail || 'Invalid file');
    }
    
    throw new Error('Upload failed. Please try again.');
  }
};

export const getUserDatasets = async () => {
  try {
    const response = await api.get('/datasets/');
    return response.data;
  } catch (error) {
    console.error('Get datasets error:', error.response?.data || error.message);
    throw new Error('Failed to load datasets');
  }
};

// Alias for consistency
export const getAllDatasets = getUserDatasets;

export const getDatasetAnalytics = async (datasetId) => {
  try {
    // Validate dataset ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(datasetId)) {
      throw new Error('Invalid dataset ID');
    }
    
    const response = await api.get(`/analytics/${datasetId}/summary`);
    return response.data;
  } catch (error) {
    console.error('Get analytics error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Dataset not found');
    }
    
    throw new Error('Failed to load analytics');
  }
};

export const getDatasetPreview = async (datasetId) => {
  try {
    // Validate dataset ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(datasetId)) {
      throw new Error('Invalid dataset ID');
    }
    
    const response = await api.get(`/datasets/${datasetId}/preview`);
    return response.data;
  } catch (error) {
    console.error('Get preview error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Dataset not found');
    }
    
    throw new Error('Failed to load dataset preview');
  }
};

export const deleteDataset = async (datasetId) => {
  try {
    // Validate dataset ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(datasetId)) {
      throw new Error('Invalid dataset ID');
    }
    
    const response = await api.delete(`/datasets/${datasetId}`);
    return response.data;
  } catch (error) {
    console.error('Delete dataset error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Dataset not found');
    }
    
    throw new Error('Failed to delete dataset');
  }
};

export default api;
// Enhanced Analytics API functions
export const getCorrelationAnalysis = async (datasetId) => {
  try {
    // Validate dataset ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(datasetId)) {
      throw new Error('Invalid dataset ID');
    }
    
    const response = await api.get(`/analytics/${datasetId}/correlation`);
    return response.data;
  } catch (error) {
    console.error('Get correlation analysis error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Dataset not found');
    }
    
    throw new Error('Failed to load correlation analysis');
  }
};

export const getOutlierAnalysis = async (datasetId) => {
  try {
    // Validate dataset ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(datasetId)) {
      throw new Error('Invalid dataset ID');
    }
    
    const response = await api.get(`/analytics/${datasetId}/outliers`);
    return response.data;
  } catch (error) {
    console.error('Get outlier analysis error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Dataset not found');
    }
    
    throw new Error('Failed to load outlier analysis');
  }
};

export const refreshAnalyticsCache = async (datasetId) => {
  try {
    // Validate dataset ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(datasetId)) {
      throw new Error('Invalid dataset ID');
    }
    
    const response = await api.post(`/analytics/${datasetId}/refresh`);
    return response.data;
  } catch (error) {
    console.error('Refresh analytics cache error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Dataset not found');
    }
    
    throw new Error('Failed to refresh analytics cache');
  }
};
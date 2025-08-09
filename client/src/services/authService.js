import axios from 'axios';


const API_URL = '/api/auth';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Allow cookies to be sent with requests
});

/**
 * @param {string} token ken
 */
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Response with user data and token
 */
const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    
    if (response.data.success && response.data.data.token) {
      setAuthToken(response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Setup first admin user
 * @param {Object} userData - User setup data
 * @returns {Promise} - Response with user data and token
 */
const setup = async (userData) => {
  try {
    const response = await api.post('/setup', userData);
    
    if (response.data.success && response.data.data.token) {
      setAuthToken(response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Response with user data and token
 */
const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    
    if (response.data.success && response.data.data.token) {
      setAuthToken(response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Logout user
 * @returns {Promise} - Response with logout status
 */
const logout = async () => {
  try {
    const response = await api.post('/logout');
    setAuthToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return response.data;
  } catch (error) {
    // Even if the server call fails, clear local storage
    setAuthToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Get current user profile
 * @returns {Promise} - Response with user data
 */
const getCurrentUser = async () => {
  try {
    const response = await api.get('/me');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Check if user is logged in
 * @returns {boolean} - True if user is logged in
 */
const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get current user from local storage
 * @returns {Object|null} - User object or null
 */
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Initialize authentication from localStorage
 */
const initAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }
};

// Initialize auth on service import
initAuth();

const authService = {
  login,
  register,
  setup,
  logout,
  getCurrentUser,
  isLoggedIn,
  getUser,
  setAuthToken
};

export default authService;

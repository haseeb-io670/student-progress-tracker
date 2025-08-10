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
    // We don't store the token in localStorage since we're using httpOnly cookies
  } else {
    delete api.defaults.headers.common['Authorization'];
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
      // Store the token in localStorage
      localStorage.setItem('token', response.data.data.token);
      // Set the auth token in the API headers
      setAuthToken(response.data.data.token);
      // Store the user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      console.log('User logged in and token stored');
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
      // Store the token in localStorage
      localStorage.setItem('token', response.data.data.token);
      // Set the auth token in the API headers
      setAuthToken(response.data.data.token);
      // Store the user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      console.log('User setup completed and token stored');
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
      // Store the token in localStorage
      localStorage.setItem('token', response.data.data.token);
      // Set the auth token in the API headers
      setAuthToken(response.data.data.token);
      // Store the user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      console.log('User registered and token stored');
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
  // Check if we have a current user stored in memory or a token in localStorage
  return api.defaults.headers.common['Authorization'] ? true : localStorage.getItem('token') ? true : false;
};

/**
 * Get current user from localStorage
 * @returns {Object|null} - User object or null
 */
const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

/**
 * Initialize authentication from localStorage
 */
const initAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
    // Also set the user in memory if available
    const user = getUser();
    if (user) {
      console.log('Initializing auth with stored user:', user);
    }
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

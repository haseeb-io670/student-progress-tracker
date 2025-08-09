import axios from 'axios';

const API_URL = '/api/subjects';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Allow cookies to be sent with requests
});

// Add a request interceptor to get the latest token
api.interceptors.request.use((config) => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const token = userData.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Get all subjects with their units and topics
 * @returns {Promise} - Response with subjects data
 */
const getAllSubjects = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Create a new subject
 * @param {Object} subjectData - Subject data (name)
 * @returns {Promise} - Response with created subject data
 */
const createSubject = async (subjectData) => {
  try {
    const response = await api.post('/', subjectData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Add a unit to a subject
 * @param {string} subjectId - Subject ID
 * @param {Object} unitData - Unit data (name)
 * @returns {Promise} - Response with created unit data
 */
const addUnit = async (subjectId, unitData) => {
  try {
    const response = await api.post(`/${subjectId}/units`, unitData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Add a topic to a unit
 * @param {string} subjectId - Subject ID
 * @param {string} unitId - Unit ID
 * @param {Object} topicData - Topic data (name)
 * @returns {Promise} - Response with created topic data
 */
const addTopic = async (subjectId, unitId, topicData) => {
  try {
    const response = await api.post(`/${subjectId}/units/${unitId}/topics`, topicData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

const subjectService = {
  getAllSubjects,
  createSubject,
  addUnit,
  addTopic
};

export default subjectService;

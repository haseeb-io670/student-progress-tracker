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
    // Only send the name, let the server generate the ID
    const response = await api.post('/', { name: subjectData.name });
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
    // Only send the name, let the server generate the ID
    const response = await api.post(`/${subjectId}/units`, { name: unitData.name });
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
    if (!subjectId) {
      console.error('Missing subjectId in addTopic');
      throw { success: false, message: 'Subject ID is required' };
    }
    
    if (!unitId) {
      console.error('Missing unitId in addTopic');
      throw { success: false, message: 'Unit ID is required' };
    }
    
    if (!topicData || !topicData.name) {
      console.error('Missing topic name in addTopic');
      throw { success: false, message: 'Topic name is required' };
    }
    
    console.log(`Sending request to: ${API_URL}/${subjectId}/units/${unitId}/topics`);
    console.log('With data:', { name: topicData.name });
    
    // Only send the name, let the server generate the ID
    const response = await api.post(`/${subjectId}/units/${unitId}/topics`, { name: topicData.name });
    console.log('Topic creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in addTopic:', error);
    if (error.response) {
      console.error('Server response error:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw { success: false, message: 'No response from server' };
    } else {
      console.error('Request setup error:', error.message);
      throw { success: false, message: error.message || 'Network error' };
    }
  }
};

/**
 * Update a subject
 * @param {string} subjectId - Subject ID
 * @param {Object} subjectData - Subject data (name)
 * @returns {Promise} - Response with updated subject data
 */
const updateSubject = async (subjectId, subjectData) => {
  try {
    const response = await api.put(`/${subjectId}`, { name: subjectData.name });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Delete a subject
 * @param {string} subjectId - Subject ID
 * @returns {Promise} - Response with success message
 */
const deleteSubject = async (subjectId) => {
  try {
    const response = await api.delete(`/${subjectId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Update a unit
 * @param {string} subjectId - Subject ID
 * @param {string} unitId - Unit ID
 * @param {Object} unitData - Unit data (name)
 * @returns {Promise} - Response with updated unit data
 */
const updateUnit = async (subjectId, unitId, unitData) => {
  try {
    const response = await api.put(`/${subjectId}/units/${unitId}`, { name: unitData.name });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Delete a unit
 * @param {string} subjectId - Subject ID
 * @param {string} unitId - Unit ID
 * @returns {Promise} - Response with success message
 */
const deleteUnit = async (subjectId, unitId) => {
  try {
    const response = await api.delete(`/${subjectId}/units/${unitId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Update a topic
 * @param {string} subjectId - Subject ID
 * @param {string} unitId - Unit ID
 * @param {string} topicId - Topic ID
 * @param {Object} topicData - Topic data (name)
 * @returns {Promise} - Response with updated topic data
 */
const updateTopic = async (subjectId, unitId, topicId, topicData) => {
  try {
    const response = await api.put(`/${subjectId}/units/${unitId}/topics/${topicId}`, { name: topicData.name });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

/**
 * Delete a topic
 * @param {string} subjectId - Subject ID
 * @param {string} unitId - Unit ID
 * @param {string} topicId - Topic ID
 * @returns {Promise} - Response with success message
 */
const deleteTopic = async (subjectId, unitId, topicId) => {
  try {
    const response = await api.delete(`/${subjectId}/units/${unitId}/topics/${topicId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Network error' };
  }
};

const subjectService = {
  getAllSubjects,
  createSubject,
  addUnit,
  addTopic,
  updateSubject,
  deleteSubject,
  updateUnit,
  deleteUnit,
  updateTopic,
  deleteTopic
};

export default subjectService;

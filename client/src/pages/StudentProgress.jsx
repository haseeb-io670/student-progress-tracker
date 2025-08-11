import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { FaEdit, FaPlus, FaSave, FaTimes, FaLock, FaBook, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Retry mechanism for failed API calls
const retryFetch = async (fetchFunction, maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fetchFunction();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) throw error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
};

const StudentProgress = () => {
  const { currentUser, isParentOf } = useAuth();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');
  
  // State for students data
  const [allStudents, setAllStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for student modal
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('');
  const [newStudentParentId, setNewStudentParentId] = useState('');
  const [availableParents, setAvailableParents] = useState([]);
  
  // Fetch students data
  const fetchStudents = async () => {
    try {
      setLoading(true);
      let studentsData = [];
      
      if (currentUser?.role === 'user') {
        // For parents, fetch only their children
        const response = await axios.get('/api/users/me/children');
        studentsData = response.data;
      } else if (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
        // For admins, fetch all students
        const response = await axios.get('/api/students');
        studentsData = response.data;
      } else {
        // Not authenticated or unknown role
        navigate('/login');
        return;
      }
      
      setAllStudents(studentsData);
      setAvailableStudents(studentsData);
      
      // Set initial selected student if none is selected
      if ((!selectedStudent || selectedStudent === '') && studentsData.length > 0) {
        setSelectedStudent(studentsData[0]._id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students data');
      setLoading(false);
    }
  };
  
  // Fetch parents for student creation
  const fetchParents = async () => {
    try {
      // Only fetch parents if user is admin or super_admin
      if (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
        const response = await axios.get('/api/users?role=user');
        setAvailableParents(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching parents:', err);
      // Don't set error state here to avoid disrupting the UI
    }
  };
  
  useEffect(() => {
    if (currentUser) {
      retryFetch(() => fetchStudents());
      retryFetch(() => fetchParents());
    }
  }, [currentUser, navigate, selectedStudent]);
  
  // State for subjects data
  const [subjects, setSubjects] = useState([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  
  // Fetch subjects data
  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/subjects');
      // Check if response has data property and it's an array
      // The API returns either { success: true, data: [...] } or directly the array
      const subjectsData = response.data?.data || response.data || [];
      
      // Log the response structure to help with debugging
      console.log('Subjects API response:', response.data);
      
      // Ensure subjectsData is an array
      const subjectsArray = Array.isArray(subjectsData) ? subjectsData : [];
      setSubjects(subjectsArray);
      
      // Set initial selected subject if none is selected
      if ((!selectedSubject || selectedSubject === '') && subjectsArray.length > 0) {
        // Ensure we're setting a valid MongoDB ObjectId
        const validSubject = subjectsArray.find(subject => {
          const objectIdPattern = /^[0-9a-fA-F]{24}$/;
          return objectIdPattern.test(subject._id);
        });
        
        if (validSubject) {
          setSelectedSubject(validSubject._id);
        }
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects data');
    }
  };
  
  useEffect(() => {
    if (currentUser) {
      retryFetch(() => fetchSubjects());
    }
  }, [currentUser]); // Fetch subjects when user changes
  
  // Also fetch subjects when selectedSubject changes
  useEffect(() => {
    if (selectedSubject) {
      retryFetch(() => fetchSubjects());
    }
  }, [selectedSubject]);
  
  // Function to handle adding a new subject
  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    
    try {
      await axios.post('/api/subjects', { name: newSubjectName });
      setNewSubjectName('');
      setShowSubjectModal(false);
      fetchSubjects();
    } catch (err) {
      console.error('Error adding subject:', err);
      setError('Failed to add subject');
    }
  };
  
  // Function to handle editing a subject
  const handleEditSubject = async () => {
    if (!editingSubject || !newSubjectName.trim()) return;
    
    try {
      await axios.put(`/api/subjects/${editingSubject._id}`, { name: newSubjectName });
      setNewSubjectName('');
      setEditingSubject(null);
      setShowSubjectModal(false);
      fetchSubjects();
    } catch (err) {
      console.error('Error updating subject:', err);
      setError('Failed to update subject');
    }
  };
  
  // Function to handle deleting a subject
  const handleDeleteSubject = async (subjectId) => {
    // Validate subject ID format
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(subjectId)) {
      setError('Invalid subject ID format. Cannot delete subject.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this subject? This will also delete all units and topics within it.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/subjects/${subjectId}`);
      fetchSubjects();
      if (selectedSubject === subjectId) {
        setSelectedSubject('');
      }
    } catch (err) {
      console.error('Error deleting subject:', err);
      setError('Failed to delete subject');
    }
  };
  
  // Function to handle adding a unit to a subject
  const handleAddUnit = async () => {
    if (!selectedSubject || !newUnitName.trim()) return;
    
    // Validate subject ID format
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(selectedSubject)) {
      setError('Invalid subject ID format. Cannot add unit.');
      setShowUnitModal(false);
      return;
    }
    
    try {
      await axios.post(`/api/subjects/${selectedSubject}/units`, { name: newUnitName });
      setNewUnitName('');
      setShowUnitModal(false);
      // Refresh the current subject data
      fetchProgressData();
    } catch (err) {
      console.error('Error adding unit:', err);
      setError('Failed to add unit');
    }
  };
  
  // Function to handle adding a topic to a unit
  const handleAddTopic = async (unitId) => {
    if (!selectedSubject || !unitId || !newTopicName.trim()) return;
    
    // Validate subject ID and unit ID format
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(selectedSubject)) {
      setError('Invalid subject ID format. Cannot add topic.');
      setShowTopicModal(false);
      return;
    }
    
    if (!objectIdPattern.test(unitId)) {
      setError('Invalid unit ID format. Cannot add topic.');
      setShowTopicModal(false);
      return;
    }
    
    try {
      await axios.post(`/api/subjects/${selectedSubject}/units/${unitId}/topics`, { name: newTopicName });
      setNewTopicName('');
      setShowTopicModal(false);
      // Refresh the current subject data
      fetchProgressData();
    } catch (err) {
      console.error('Error adding topic:', err);
      setError('Failed to add topic');
    }
  };
  
  // Available status options
  const statusOptions = [
    { value: 'started', label: 'Unit covered / started in School' },
    { value: 'difficult', label: 'I Find Difficult' },
    { value: 'ok', label: 'I am OK with this topic' },
    { value: 'confident', label: 'I am confident' },
    { value: 'not_studied', label: 'Not studied' }
  ];
  
  // State for progress data
  const [progressData, setProgressData] = useState({
    aahil: {
      biology: {
        title: 'KEY STAGE 4 (AQA Combined) Biology',
        units: [
          {
            id: 1,
            name: 'Cell biology',
            topics: [
              { id: 1, name: 'Cell structure', status: 'started' },
              { id: 2, name: 'Eukaryotes and prokaryotes', status: 'ok' },
              { id: 3, name: 'Animal and plant cells', status: 'confident' },
              { id: 4, name: 'Cell specialisation', status: 'ok' },
              { id: 5, name: 'Cell differentiation', status: 'ok' },
              { id: 6, name: 'Microscopy', status: 'difficult' }
            ]
          },
          {
            id: 2,
            name: 'Organisation',
            topics: [
              { id: 1, name: 'Principles of organisation', status: 'ok' },
              { id: 2, name: 'Animal tissues, organs and organ systems', status: 'ok' }
            ]
          }
        ]
      },
      chemistry: {
        title: 'KEY STAGE 4 (AQA Combined) Chemistry',
        units: [
          {
            id: 1,
            name: 'Atomic structure and the periodic table',
            topics: [
              { id: 1, name: 'A simple model of the atom, symbols, relative atomic mass, electronic charge and isotopes', status: 'started' },
              { id: 2, name: 'Atoms, elements and compounds', status: 'confident' },
              { id: 3, name: 'Mixtures', status: 'confident' }
            ]
          },
          {
            id: 2,
            name: 'Bonding, structure, and the properties of matter',
            topics: [
              { id: 1, name: 'Chemical bonds, ionic, covalent and metallic', status: 'ok' }
            ]
          }
        ]
      },
      physics: {
        title: 'KEY STAGE 4 (AQA Combined) Physics',
        units: [
          {
            id: 1,
            name: 'Energy',
            topics: [
              { id: 1, name: 'Energy changes in a system, and the ways energy is stored before and after such changes', status: 'started' },
              { id: 2, name: 'Energy stores and systems', status: 'ok' },
              { id: 3, name: 'Changes in energy', status: 'ok' }
            ]
          },
          {
            id: 2,
            name: 'Electricity',
            topics: [
              { id: 1, name: 'Current, potential difference and resistance', status: 'ok' },
              { id: 2, name: 'Standard circuit diagram symbols', status: 'confident' }
            ]
          }
        ]
      }
    }
  });
  
  // State for current student's progress data
  const [currentStudentData, setCurrentStudentData] = useState({
    title: 'Loading...',
    units: []
  });
  
  // Function to fetch progress data for selected student and subject
  // Enhance error handling in fetchProgressData
  const fetchProgressData = async () => {
    if (!selectedStudent || !selectedSubject) {
      // Set empty data when no student or subject is selected
      setCurrentStudentData({
        title: 'Please select a student and subject',
        units: []
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      // Validate that selectedSubject is a valid MongoDB ObjectId format (24 character hex string)
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (!objectIdPattern.test(selectedSubject)) {
        setError(`Invalid subject ID format: ${selectedSubject}`);
        setCurrentStudentData({
          title: 'Error: Invalid subject ID',
          units: []
        });
        setLoading(false);
        return;
      }
      
      // Get subject details
      const subjectResponse = await axios.get(`/api/subjects/${selectedSubject}`);
      
      // Log the subject response for debugging
      console.log('Subject API response:', subjectResponse.data);
      
      // Handle different response formats
      // The API might return { success: true, data: {...} } or directly the subject object
      const subject = subjectResponse.data?.data || subjectResponse.data || { name: 'Unknown Subject', units: [] };
      
      // Ensure subject has units array
      if (!subject.units) {
        subject.units = [];
      }
      
      // Get progress for this student and subject
      const progressResponse = await axios.get(`/api/progress/student/${selectedStudent}/subject/${selectedSubject}`);
      const progressEntries = progressResponse.data || [];
      
      // Map progress data to the format expected by the UI
      const formattedData = {
        title: `${subject.name}`,
        units: subject.units.map(unit => ({
          id: unit._id,
          name: unit.name,
          topics: unit.topics.map(topic => {
            // Find progress entry for this topic - using proper object ID comparison
            const progressEntry = progressEntries.find(p => p.topicId?._id.toString() === topic._id.toString());
            
            return {
              id: topic._id,
              name: topic.name,
              status: progressEntry ? progressEntry.status : 'not_studied'
            };
          })
        }))
      };
      
      setCurrentStudentData(formattedData);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      
      // Log detailed error information for debugging
      console.log('Error details:', {
        message: err.message,
        response: err.response,
        request: err.request
      });
      
      // More descriptive error message based on error type
      if (err.response) {
        if (err.response.status === 404) {
          setError(`Resource not found: ${err.response.data?.message || 'Check if the student or subject exists'}`); 
        } else if (err.response.status === 403) {
          setError(`Access denied: ${err.response.data?.message || 'You do not have permission to view this data'}`); 
        } else if (err.response.status === 500) {
          setError(`Server error: ${err.response.data?.message || 'Internal server error'}`); 
        } else {
          setError(`Error (${err.response.status}): ${err.response.data?.message || 'Unknown error'}`); 
        }
      } else if (err.request) {
        setError('Network error: No response received from server. Please check your internet connection.');
      } else {
        setError(`Error: ${err.message || 'Unknown error'}`); 
      }
      
      // Set empty data on error
      setCurrentStudentData({
        title: 'Error loading data',
        units: []
      });
      
      // Retry fetching subjects if that might be the issue
      if (err.response && err.response.status === 404) {
        fetchSubjects();
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch progress data when selected student or subject changes
  useEffect(() => {
    // Only fetch data if we have a valid subject ID
    if (selectedSubject) {
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (objectIdPattern.test(selectedSubject)) {
        retryFetch(() => fetchProgressData());
      } else {
        // Clear current data if subject ID is invalid
        setCurrentStudentData({
          title: 'Please select a valid subject',
          units: []
        });
        setError('Invalid subject ID format');
      }
    }
  }, [selectedStudent, selectedSubject]);
  
  // Function to get status color class
  const getStatusColorClass = (status) => {
    switch(status) {
      case 'started': return 'bg-purple-200';
      case 'difficult': return 'bg-red-200';
      case 'ok': return 'bg-yellow-200';
      case 'confident': return 'bg-green-200';
      case 'not_studied': return 'bg-white border border-gray-300';
      default: return 'bg-gray-200';
    }
  };
  
  // Function to get status label
  const getStatusLabel = (status) => {
    switch(status) {
      case 'started': return 'Unit covered / started in School';
      case 'difficult': return 'I Find Difficult';
      case 'ok': return 'I am OK with this topic';
      case 'confident': return 'I am confident';
      case 'not_studied': return 'Not studied';
      default: return 'Not studied';
    }
  };
  
  // Function to start editing a topic
  const handleEditTopic = (unitId, topicId, currentStatus) => {
    setEditingUnitId(unitId);
    setEditingTopicId(topicId);
    setEditingStatus(currentStatus);
  };
  
  // Function to save topic status changes
  const handleSaveTopicStatus = async (unitId, topicId) => {
    try {
      // Call API to update progress
      const response = await axios.post('/api/progress', {
        studentId: selectedStudent,
        topicId: topicId,
        status: editingStatus
      });
      
      // Verify response before updating UI
      if (response && response.data) {
        // Update local state to reflect the change
        const updatedData = { ...currentStudentData };
        const unitIndex = updatedData.units.findIndex(u => u.id === unitId);
        const topicIndex = unitIndex !== -1 ? 
          updatedData.units[unitIndex].topics.findIndex(t => t.id === topicId) : -1;
        
        if (unitIndex !== -1 && topicIndex !== -1) {
          updatedData.units[unitIndex].topics[topicIndex].status = editingStatus;
          setCurrentStudentData(updatedData);
        }
        
        // Reset editing state
        setEditingUnitId(null);
        setEditingTopicId(null);
        setEditingStatus('');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to update progress. ';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 404) {
          errorMessage += 'Student or topic not found. Please refresh the page and try again.';
        } else if (err.response.status === 403) {
          errorMessage += 'You do not have permission to update this progress.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage += err.response.data.message;
        } else {
          errorMessage += `Server error (${err.response.status}). Please try again later.`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += 'An unexpected error occurred. Please try again.';
      }
      
      // Use a more user-friendly notification instead of alert
      setError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };
  
  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingUnitId(null);
    setEditingTopicId(null);
    setEditingStatus('');
  };
  
  // Function to handle editing unit name
  const handleEditUnit = (unitId) => {
    // For now, just show an alert
    alert(`Editing unit ${unitId} - This functionality will be implemented soon.`);
  };
  
  // Function to handle adding a new student
  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      setError('Student name is required');
      return;
    }
    
    try {
      const studentData = {
        name: newStudentName,
        grade: newStudentGrade
      };
      
      // Add parent ID if selected
      if (newStudentParentId) {
        studentData.parentId = newStudentParentId;
      }
      
      // Call API to create student
      await axios.post('/api/students', studentData);
      
      // Reset form and close modal
      setNewStudentName('');
      setNewStudentGrade('');
      setNewStudentParentId('');
      setShowStudentModal(false);
      
      // Refresh students list
      fetchStudents();
      
      setError(null);
    } catch (err) {
      console.error('Error adding student:', err);
      setError('Failed to add student: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>
        
        {/* Only show add button for teachers and super admins */}
        {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
          <button 
            onClick={() => setShowStudentModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
            <FaPlus className="-ml-1 mr-2 h-4 w-4" />
            Add Student
          </button>
        )}
      </div>
      
      {/* Error message display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-sm">
          <div className="flex items-center">
            <FaExclamationCircle className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <div className="mb-4">
              <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">
                Subject Name
              </label>
              <input
                type="text"
                id="subjectName"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter subject name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSubjectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={editingSubject ? handleEditSubject : handleAddSubject}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                disabled={!newSubjectName.trim()}
              >
                {editingSubject ? 'Save Changes' : 'Add Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Unit Modal */}
      {showUnitModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Unit</h2>
            <div className="mb-4">
              <label htmlFor="unitName" className="block text-sm font-medium text-gray-700 mb-1">
                Unit Name
              </label>
              <input
                type="text"
                id="unitName"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter unit name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUnitModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUnit}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                disabled={!newUnitName.trim()}
              >
                Add Unit
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Topic</h2>
            <div className="mb-4">
              <label htmlFor="topicName" className="block text-sm font-medium text-gray-700 mb-1">
                Topic Name
              </label>
              <input
                type="text"
                id="topicName"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter topic name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTopicModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddTopic(editingUnitId)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                disabled={!newTopicName.trim()}
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Student</h2>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                Student Name *
              </label>
              <input
                type="text"
                id="studentName"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter student name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="studentGrade" className="block text-sm font-medium text-gray-700 mb-1">
                Grade/Year (Optional)
              </label>
              <input
                type="text"
                id="studentGrade"
                value={newStudentGrade}
                onChange={(e) => setNewStudentGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter grade or year"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
                Parent (Optional)
              </label>
              <select
                id="parentId"
                value={newStudentParentId}
                onChange={(e) => setNewStudentParentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select Parent --</option>
                {availableParents.map(parent => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name} ({parent.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStudentModal(false);
                  setNewStudentName('');
                  setNewStudentGrade('');
                  setNewStudentParentId('');
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                disabled={!newStudentName.trim()}
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters and Legend - Sidebar on desktop, top section on mobile */}
        <div className="lg:col-span-1 space-y-6">
          {/* Filters Card */}
          <div className="bg-white shadow-md rounded-lg p-5 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-1 h-5 bg-indigo-600 rounded-full mr-2"></span>
              Filters
            </h2>
            
            {/* Student Filter */}
            <div className="mb-4">
              <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
                Student
              </label>
              {availableStudents.length > 0 ? (
                <div className="relative">
                  <select
                    id="student"
                    name="student"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    disabled={loading}
                  >
                    {availableStudents.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="mt-1 flex items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <FaLock className="mr-2 text-gray-400" />
                  No students available
                </div>
              )}
            </div>
            
            {/* Subject Filter with Management */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                  <button
                    onClick={() => {
                      setEditingSubject(null);
                      setNewSubjectName('');
                      setShowSubjectModal(true);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-900 flex items-center"
                  >
                    <FaPlus className="mr-1" /> Add Subject
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  id="subject"
                  name="subject"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={loading}
                >
                  {subjects.length === 0 && (
                    <option value="">No subjects available</option>
                  )}
                  {subjects
                    .filter(subject => {
                      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
                      return objectIdPattern.test(subject._id);
                    })
                    .map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && selectedSubject && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => {
                      // Validate subject ID format
                      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
                      if (!objectIdPattern.test(selectedSubject)) {
                        setError('Invalid subject ID format. Cannot edit subject.');
                        return;
                      }
                      
                      const subject = subjects.find(s => s._id === selectedSubject);
                      if (subject) {
                        setEditingSubject(subject);
                        setNewSubjectName(subject.name);
                        setShowSubjectModal(true);
                      } else {
                        setError('Subject not found. Cannot edit subject.');
                      }
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-900 flex items-center"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(selectedSubject)}
                    className="text-xs text-red-600 hover:text-red-900 flex items-center"
                  >
                    <FaTimes className="mr-1" /> Delete
                  </button>
                  <button
                    onClick={() => {
                      setNewUnitName('');
                      setShowUnitModal(true);
                    }}
                    className="text-xs text-green-600 hover:text-green-900 flex items-center"
                  >
                    <FaPlus className="mr-1" /> Add Unit
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Legend Card */}
          <div className="bg-white shadow-md rounded-lg p-5 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-1 h-5 bg-indigo-600 rounded-full mr-2"></span>
              Legend
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              <div className="flex items-center p-2 rounded-md hover:bg-gray-50">
                <div className="w-4 h-4 bg-purple-200 mr-2 rounded-sm"></div>
                <span className="text-sm text-gray-600">Started in School</span>
              </div>
              <div className="flex items-center p-2 rounded-md hover:bg-gray-50">
                <div className="w-4 h-4 bg-red-200 mr-2 rounded-sm"></div>
                <span className="text-sm text-gray-600">Find Difficult</span>
              </div>
              <div className="flex items-center p-2 rounded-md hover:bg-gray-50">
                <div className="w-4 h-4 bg-yellow-200 mr-2 rounded-sm"></div>
                <span className="text-sm text-gray-600">OK with topic</span>
              </div>
              <div className="flex items-center p-2 rounded-md hover:bg-gray-50">
                <div className="w-4 h-4 bg-green-200 mr-2 rounded-sm"></div>
                <span className="text-sm text-gray-600">Confident</span>
              </div>
              <div className="flex items-center p-2 rounded-md hover:bg-gray-50">
                <div className="w-4 h-4 bg-white border border-gray-300 mr-2 rounded-sm"></div>
                <span className="text-sm text-gray-600">Not studied</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content - Progress Data */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentStudentData.title}
                {selectedStudent && selectedSubject && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    {availableStudents.find(s => s._id === selectedStudent)?.name || ''}
                  </span>
                )}
              </h2>
            </div>
            
            {currentStudentData.units.length > 0 ? (
              <div className="p-4">
                {/* Spreadsheet-like table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 bg-green-100 px-4 py-2 text-left text-sm font-medium" colSpan="2">
                          {subjects.find(s => s._id === selectedSubject)?.name || 'Subject'}
                        </th>
                        <th className="border border-gray-300 bg-purple-100 px-4 py-2 text-center text-sm font-medium">
                          RAG
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStudentData.units.map((unit, unitIndex) => (
                        <React.Fragment key={unit.id}>
                          {/* Unit Row */}
                          <tr>
                            <td 
                              colSpan="3" 
                              className="border border-gray-300 bg-orange-200 px-4 py-2 text-sm font-medium"
                            >
                              <div className="flex justify-between items-center">
                                <span>Unit {unit.id}: {unit.name}</span>
                                
                                {/* Only show edit buttons for teachers and super admins */}
                                {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => handleEditUnit(unit.id)}
                                      className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-full transition-colors"
                                      aria-label="Edit unit"
                                    >
                                      <FaEdit className="h-4 w-4" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setNewTopicName('');
                                        setShowTopicModal(true);
                                        // Store the current unit ID for adding a topic
                                        setEditingUnitId(unit.id);
                                      }}
                                      className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full transition-colors"
                                      aria-label="Add topic"
                                    >
                                      <FaPlus className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                          
                          {/* Topic Rows */}
                          {unit.topics.map((topic, topicIndex) => (
                            <tr key={topic.id} className="hover:bg-gray-50 transition-colors">
                              <td className="border border-gray-300 px-1 py-1 text-center text-sm w-16">
                                {unitIndex + 1}.{topicIndex + 1}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-sm">
                                {topic.name}
                              </td>
                              <td className="border border-gray-300 px-2 py-2 text-center">
                                {editingUnitId === unit.id && editingTopicId === topic.id ? (
                                  <div className="flex items-center justify-center">
                                    <select
                                      value={editingStatus}
                                      onChange={(e) => setEditingStatus(e.target.value)}
                                      className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                                    >
                                      {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                    
                                    <div className="flex ml-2">
                                      <button
                                        onClick={() => handleSaveTopicStatus(unit.id, topic.id)}
                                        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                                        aria-label="Save changes"
                                      >
                                        <FaSave className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                        aria-label="Cancel editing"
                                      >
                                        <FaTimes className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <div className={`w-6 h-6 rounded-sm ${getStatusColorClass(topic.status)}`}></div>
                                    
                                    {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                                      <button
                                        onClick={() => handleEditTopic(unit.id, topic.id, topic.status)}
                                        className="ml-2 p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                                        aria-label="Edit topic"
                                      >
                                        <FaEdit className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                  <FaBook className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No data available for this student and subject.</p>
                <p className="text-sm text-gray-400 mt-1">Try selecting a different student or subject.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;

import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { FaEdit, FaPlus, FaSave, FaTimes, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StudentProgress = () => {
  const { currentUser, isParentOf } = useAuth();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('biology');
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');
  
  // Mock data for students
  const allStudents = [
    { id: 'aahil', name: 'Aahil' },
    { id: 'sara', name: 'Sara' },
    { id: 'john', name: 'John' }
  ];
  
  // Filter students based on user role
  const [availableStudents, setAvailableStudents] = useState([]);
  
  useEffect(() => {
    // If user is a parent, only show their children
    if (currentUser?.role === 'user' && currentUser?.children) {
      const parentStudents = allStudents.filter(student => 
        currentUser.children.includes(student.id)
      );
      
      setAvailableStudents(parentStudents);
      
      // If no students available or selected student is not a child of this parent
      if (parentStudents.length > 0) {
        if (!selectedStudent || !isParentOf(selectedStudent)) {
          setSelectedStudent(parentStudents[0].id);
        }
      } else {
        // No students available for this parent
        setSelectedStudent('');
      }
    } else if (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
      // Admins and super admins can see all students
      setAvailableStudents(allStudents);
      if (!selectedStudent && allStudents.length > 0) {
        setSelectedStudent(allStudents[0].id);
      }
    } else {
      // Not authenticated or unknown role
      navigate('/login');
    }
  }, [currentUser, selectedStudent, isParentOf, navigate]);
  
  // Mock data for subjects
  const subjects = [
    { id: 'biology', name: 'Biology' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'physics', name: 'Physics' }
  ];
  
  // Available status options
  const statusOptions = [
    { value: 'started', label: 'Unit covered / started in School' },
    { value: 'difficult', label: 'I Find Difficult' },
    { value: 'ok', label: 'I am OK with this topic' },
    { value: 'confident', label: 'I am confident' },
    { value: 'not_studied', label: 'Not studied' }
  ];
  
  // Mock data for progress tracking (based on the image)
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
  
  // Get the current student's progress data
  const currentStudentData = progressData[selectedStudent]?.[selectedSubject] || { 
    title: 'No data available',
    units: [] 
  };
  
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
  const handleSaveTopicStatus = (unitId, topicId) => {
    // Create a deep copy of the progress data
    const updatedProgressData = JSON.parse(JSON.stringify(progressData));
    
    // Find the topic and update its status
    const unitIndex = updatedProgressData[selectedStudent][selectedSubject].units.findIndex(u => u.id === unitId);
    const topicIndex = updatedProgressData[selectedStudent][selectedSubject].units[unitIndex].topics.findIndex(t => t.id === topicId);
    
    if (unitIndex !== -1 && topicIndex !== -1) {
      updatedProgressData[selectedStudent][selectedSubject].units[unitIndex].topics[topicIndex].status = editingStatus;
      setProgressData(updatedProgressData);
    }
    
    // Reset editing state
    setEditingUnitId(null);
    setEditingTopicId(null);
    setEditingStatus('');
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
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>
        
        {/* Only show add button for teachers and super admins */}
        {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
            <FaPlus className="-ml-1 mr-2 h-4 w-4" />
            Add Student
          </button>
        )}
      </div>
      
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
                  >
                    {availableStudents.map((student) => (
                      <option key={student.id} value={student.id}>
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
            
            {/* Subject Filter */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <div className="relative">
                <select
                  id="subject"
                  name="subject"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
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
              <h2 className="text-lg font-semibold text-gray-900">{currentStudentData.title}</h2>
            </div>
            
            {currentStudentData.units.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {currentStudentData.units.map((unit) => (
                  <div key={unit.id} className="p-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-medium text-gray-900 flex items-center">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                        Unit {unit.id}: {unit.name}
                      </h3>
                      
                      {/* Only show edit button for teachers and super admins */}
                      {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                        <button 
                          onClick={() => handleEditUnit(unit.id)}
                          className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-full transition-colors"
                          aria-label="Edit unit"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Topic
                            </th>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                              <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {unit.topics.map((topic) => (
                            <tr key={topic.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                                <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg truncate">
                                  {topic.name}
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                {editingUnitId === unit.id && editingTopicId === topic.id ? (
                                  <select
                                    value={editingStatus}
                                    onChange={(e) => setEditingStatus(e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                                  >
                                    {statusOptions.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(topic.status)}`}>
                                    {getStatusLabel(topic.status)}
                                  </div>
                                )}
                              </td>
                              {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  {editingUnitId === unit.id && editingTopicId === topic.id ? (
                                    <div className="flex justify-end space-x-2">
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
                                  ) : (
                                    <button
                                      onClick={() => handleEditTopic(unit.id, topic.id, topic.status)}
                                      className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                                      aria-label="Edit topic"
                                    >
                                      <FaEdit className="h-4 w-4" />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
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

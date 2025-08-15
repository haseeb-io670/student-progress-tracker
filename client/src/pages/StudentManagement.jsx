import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';

const StudentManagement = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    grade: '',
    parentId: '',
    subjects: []
  });
  
  const [subjects, setSubjects] = useState([]);
  
  const [availableParents, setAvailableParents] = useState([]);
  
  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/students');
        setStudents(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);
  
  // Fetch available subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/api/subjects');
        // API returns {success: true, data: subjects}
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setSubjects(response.data.data);
        } else {
          console.error('Unexpected subjects data format:', response.data);
          setSubjects([]);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        // Set empty array on error
        setSubjects([]);
      }
    };
    
    fetchSubjects();
  }, []);
  
  // Fetch available parents
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const response = await axios.get('/api/users?role=user');
        setAvailableParents(response.data || []);
      } catch (err) {
        console.error('Error fetching parents:', err);
      }
    };
    
    if (currentUser?.role === 'super_admin' || currentUser?.role === 'admin') {
      fetchParents();
    }
  }, [currentUser]);
  
  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    return (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.grade && student.grade.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  const handleAddStudent = async () => {
    if (!newStudent.name) return;
    
    if (!newStudent.parentId) {
      setError('Parent selection is required');
      return;
    }
    
    try {
      const response = await axios.post('/api/students', {
        name: newStudent.name,
        grade: newStudent.grade,
        parentId: newStudent.parentId,
        subjects: newStudent.subjects
      });
      
      // Add the new student to the state
      setStudents([...students, response.data]);
      setNewStudent({ name: '', grade: '', parentId: '', subjects: [] });
      setIsAddingStudent(false);
      setError(null);
    } catch (err) {
      console.error('Error adding student:', err);
      setError('Failed to add student. ' + (err.response?.data?.message || 'Please try again.'));
    }
  };
  
  const handleEditStudent = async () => {
    if (!selectedStudent || !newStudent.name) return;
    
    if (!newStudent.parentId) {
      setError('Parent selection is required');
      return;
    }
    
    try {
      const studentData = {
        name: newStudent.name,
        grade: newStudent.grade,
        parentId: newStudent.parentId,
        subjects: newStudent.subjects
      };
      
      await axios.put(`/api/students/${selectedStudent._id}`, studentData);
      
      // Update the student in the state
      setStudents(students.map(student => 
        student._id === selectedStudent._id ? { ...student, ...studentData } : student
      ));
      
      setNewStudent({ name: '', grade: '', parentId: '', subjects: [] });
      setSelectedStudent(null);
      setIsEditingStudent(false);
      setError(null);
    } catch (err) {
      console.error('Error updating student:', err);
      setError('Failed to update student. ' + (err.response?.data?.message || 'Please try again.'));
    }
  };
  
  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await axios.delete(`/api/students/${studentId}`);
      
      // Remove the student from the state
      const updatedStudents = students.filter(student => student._id !== studentId);
      setStudents(updatedStudents);
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student. ' + (err.response?.data?.message || 'Please try again.'));
    }
  };
  
  const startEditStudent = (student) => {
    setSelectedStudent(student);
    setNewStudent({
      name: student.name,
      grade: student.grade || '',
      parentId: student.parentId || '',
      subjects: student.subjects || []
    });
    setIsEditingStudent(true);
    setIsAddingStudent(false);
  };
  
  const cancelForm = () => {
    setIsAddingStudent(false);
    setIsEditingStudent(false);
    setSelectedStudent(null);
    setNewStudent({ name: '', grade: '', parentId: '', subjects: [] });
    setError(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Management</h1>
        {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
          <button
            onClick={() => {
              setIsAddingStudent(true);
              setIsEditingStudent(false);
              setSelectedStudent(null);
              setNewStudent({ name: '', grade: '', parentId: '', subjects: [] });
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Add Student
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mt-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <FaSpinner className="animate-spin h-8 w-8 text-indigo-500" />
                <span className="ml-2 text-gray-500">Loading students...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No students found</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{student.grade || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                               <button
                                 onClick={() => startEditStudent(student)}
                                 className="text-indigo-600 hover:text-indigo-900 mr-4"
                               >
                                 <FaEdit className="h-5 w-5" />
                               </button>
                             )}
                            {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                              <button
                                onClick={() => handleDeleteStudent(student._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTrash className="h-5 w-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add/Edit Student Form */}
      {(isAddingStudent || isEditingStudent) && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {isAddingStudent ? 'Add New Student' : 'Edit Student'}
          </h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                Grade
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="grade"
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
              <div className="sm:col-span-3">
                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                  Parent <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="parentId"
                    value={newStudent.parentId}
                    onChange={(e) => setNewStudent({ ...newStudent, parentId: e.target.value })}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select a parent</option>
                    {availableParents.map((parent) => (
                      <option key={parent._id} value={parent._id}>
                        {parent.name} ({parent.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div className="sm:col-span-6 mt-4">
            <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 mb-2">
              Allocated Subjects
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto grid grid-cols-2 gap-2">
              {!Array.isArray(subjects) || subjects.length === 0 ? (
                <p className="text-sm text-gray-500 col-span-2">No subjects available</p>
              ) : (
                subjects.map(subject => (
                  <div key={subject._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`subject-${subject._id}`}
                      value={subject._id}
                      checked={newStudent.subjects.includes(subject._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewStudent({
                            ...newStudent,
                            subjects: [...newStudent.subjects, subject._id]
                          });
                        } else {
                          setNewStudent({
                            ...newStudent,
                            subjects: newStudent.subjects.filter(id => id !== subject._id)
                          });
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                    />
                    <label htmlFor={`subject-${subject._id}`} className="text-sm text-gray-700">
                      {subject.name}
                    </label>
                  </div>
                ))
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">Select subjects to allocate to this student</p>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={cancelForm}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={isAddingStudent ? handleAddStudent : handleEditStudent}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isAddingStudent ? 'Add Student' : 'Update Student'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
import { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { FaEdit, FaPlus } from 'react-icons/fa';

const StudentProgress = () => {
  const { currentUser } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState('aahil');
  const [selectedSubject, setSelectedSubject] = useState('biology');
  
  // Mock data for students
  const students = [
    { id: 'aahil', name: 'Aahil' },
    { id: 'sara', name: 'Sara' },
    { id: 'john', name: 'John' }
  ];
  
  // Mock data for subjects
  const subjects = [
    { id: 'biology', name: 'Biology' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'physics', name: 'Physics' }
  ];
  
  // Mock data for progress tracking (based on the image)
  const progressData = {
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
  };
  
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
      default: return 'Not studied';
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Student Progress</h1>
        
        {/* Only show add button for teachers and super admins */}
        {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <FaPlus className="-ml-1 mr-2 h-5 w-5" />
            Add Student
          </button>
        )}
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
            
            <div className="mb-4">
              <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
                Student
              </label>
              <select
                id="student"
                name="student"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Legend</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-200 mr-2"></div>
                <span className="text-sm text-gray-600">Unit covered / started in School</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-200 mr-2"></div>
                <span className="text-sm text-gray-600">I Find Difficult</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-200 mr-2"></div>
                <span className="text-sm text-gray-600">I am OK with this topic</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-200 mr-2"></div>
                <span className="text-sm text-gray-600">I am confident</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-white border border-gray-300 mr-2"></div>
                <span className="text-sm text-gray-600">Not studied</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-green-100 px-4 py-2 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">{currentStudentData.title}</h2>
            </div>
            
            {currentStudentData.units.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {currentStudentData.units.map((unit) => (
                  <div key={unit.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-medium text-gray-900">Unit {unit.id}: {unit.name}</h3>
                      
                      {/* Only show edit button for teachers and super admins */}
                      {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FaEdit />
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Topic
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {unit.topics.map((topic) => (
                            <tr key={topic.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {topic.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColorClass(topic.status)}`}>
                                  {getStatusLabel(topic.status)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No data available for this student and subject.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;

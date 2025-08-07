import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([
    { 
      id: 'biology', 
      name: 'Biology',
      units: [
        { 
          id: 1, 
          name: 'Cell biology',
          topics: [
            { id: 1, name: 'Cell structure' },
            { id: 2, name: 'Eukaryotes and prokaryotes' },
            { id: 3, name: 'Animal and plant cells' }
          ]
        },
        { 
          id: 2, 
          name: 'Organisation',
          topics: [
            { id: 1, name: 'Principles of organisation' },
            { id: 2, name: 'Animal tissues, organs and organ systems' }
          ]
        }
      ]
    },
    { 
      id: 'chemistry', 
      name: 'Chemistry',
      units: [
        { 
          id: 1, 
          name: 'Atomic structure and the periodic table',
          topics: [
            { id: 1, name: 'A simple model of the atom, symbols, relative atomic mass, electronic charge and isotopes' },
            { id: 2, name: 'Atoms, elements and compounds' }
          ]
        }
      ]
    },
    { 
      id: 'physics', 
      name: 'Physics',
      units: [
        { 
          id: 1, 
          name: 'Energy',
          topics: [
            { id: 1, name: 'Energy changes in a system, and the ways energy is stored before and after such changes' },
            { id: 2, name: 'Energy stores and systems' }
          ]
        }
      ]
    }
  ]);
  
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '' });
  const [newUnit, setNewUnit] = useState({ name: '' });
  const [newTopic, setNewTopic] = useState({ name: '' });
  
  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
  };
  
  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
  };
  
  const handleAddSubject = () => {
    if (newSubject.name.trim() === '') return;
    
    const id = newSubject.name.toLowerCase().replace(/\\s+/g, '-');
    const subject = {
      id,
      name: newSubject.name,
      units: []
    };
    
    setSubjects([...subjects, subject]);
    setNewSubject({ name: '' });
    setIsAddingSubject(false);
  };
  
  const handleAddUnit = () => {
    if (newUnit.name.trim() === '' || !selectedSubject) return;
    
    const unit = {
      id: selectedSubject.units.length + 1,
      name: newUnit.name,
      topics: []
    };
    
    const updatedSubjects = subjects.map(subject => {
      if (subject.id === selectedSubject.id) {
        return {
          ...subject,
          units: [...subject.units, unit]
        };
      }
      return subject;
    });
    
    setSubjects(updatedSubjects);
    setSelectedSubject(updatedSubjects.find(s => s.id === selectedSubject.id));
    setNewUnit({ name: '' });
    setIsAddingUnit(false);
  };
  
  const handleAddTopic = () => {
    if (newTopic.name.trim() === '' || !selectedSubject || !selectedUnit) return;
    
    const topic = {
      id: selectedUnit.topics.length + 1,
      name: newTopic.name
    };
    
    const updatedSubjects = subjects.map(subject => {
      if (subject.id === selectedSubject.id) {
        return {
          ...subject,
          units: subject.units.map(unit => {
            if (unit.id === selectedUnit.id) {
              return {
                ...unit,
                topics: [...unit.topics, topic]
              };
            }
            return unit;
          })
        };
      }
      return subject;
    });
    
    setSubjects(updatedSubjects);
    setSelectedSubject(updatedSubjects.find(s => s.id === selectedSubject.id));
    setSelectedUnit(
      updatedSubjects
        .find(s => s.id === selectedSubject.id)
        .units.find(u => u.id === selectedUnit.id)
    );
    setNewTopic({ name: '' });
    setIsAddingTopic(false);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Subject Management</h1>
        <button
          onClick={() => setIsAddingSubject(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FaPlus className="-ml-1 mr-2 h-5 w-5" />
          Add Subject
        </button>
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Subjects List */}
        <div className="lg:col-span-1 bg-white shadow rounded-lg p-4 h-fit">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Subjects</h2>
          <ul className="space-y-2">
            {subjects.map((subject) => (
              <li 
                key={subject.id}
                className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${selectedSubject?.id === subject.id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                onClick={() => handleSelectSubject(subject)}
              >
                <span>{subject.name}</span>
                <div className="flex space-x-2">
                  <button className="text-indigo-600 hover:text-indigo-900">
                    <FaEdit />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          
          {/* Add Subject Form */}
          {isAddingSubject && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-md font-medium text-gray-900 mb-2">Add New Subject</h3>
              <div className="flex">
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ name: e.target.value })}
                  placeholder="Subject Name"
                  className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                />
                <button
                  onClick={handleAddSubject}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingSubject(false)}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Units List */}
        <div className="lg:col-span-1 bg-white shadow rounded-lg p-4 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Units</h2>
            {selectedSubject && (
              <button
                onClick={() => setIsAddingUnit(true)}
                className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaPlus className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {selectedSubject ? (
            <>
              <ul className="space-y-2">
                {selectedSubject.units.map((unit) => (
                  <li 
                    key={unit.id}
                    className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${selectedUnit?.id === unit.id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSelectUnit(unit)}
                  >
                    <span>Unit {unit.id}: {unit.name}</span>
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <FaEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Add Unit Form */}
              {isAddingUnit && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Add New Unit</h3>
                  <div className="flex">
                    <input
                      type="text"
                      value={newUnit.name}
                      onChange={(e) => setNewUnit({ name: e.target.value })}
                      placeholder="Unit Name"
                      className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                    />
                    <button
                      onClick={handleAddUnit}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsAddingUnit(false)}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center">Select a subject to view units</p>
          )}
        </div>
        
        {/* Topics List */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Topics</h2>
            {selectedUnit && (
              <button
                onClick={() => setIsAddingTopic(true)}
                className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaPlus className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {selectedUnit ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Topic Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedUnit.topics.map((topic) => (
                      <tr key={topic.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {topic.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {topic.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <FaEdit />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Add Topic Form */}
              {isAddingTopic && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Add New Topic</h3>
                  <div className="flex">
                    <input
                      type="text"
                      value={newTopic.name}
                      onChange={(e) => setNewTopic({ name: e.target.value })}
                      placeholder="Topic Name"
                      className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                    />
                    <button
                      onClick={handleAddTopic}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsAddingTopic(false)}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center">Select a unit to view topics</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectManagement;

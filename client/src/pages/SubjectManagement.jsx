import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import subjectService from '../services/subjectService';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '' });
  const [newUnit, setNewUnit] = useState({ name: '' });
  const [newTopic, setNewTopic] = useState({ name: '' });
  
  // States for editing
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editingSubject, setEditingSubject] = useState({ name: '' });
  const [editingUnit, setEditingUnit] = useState({ name: '' });
  const [editingTopic, setEditingTopic] = useState({ name: '' });
  const [editingTopicId, setEditingTopicId] = useState(null);
  
  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
  };
  
  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
  };
  
    // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      const updatedSubject = subjects.find(s => s._id === selectedSubject._id);
      setSelectedSubject(updatedSubject);
      if (selectedUnit && updatedSubject) {
        const updatedUnit = updatedSubject.units.find(u => u._id === selectedUnit._id);
        setSelectedUnit(updatedUnit);
      }
    }
  }, [subjects]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subjectService.getAllSubjects();
      if (response.success) {
        setSubjects(response.data);
      }
    } catch (err) {
      setError(err.message || 'Error loading subjects');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (newSubject.name.trim() === '') {
      setError('Subject name is required');
      return;
    }
    
    try {
      setError(null);
      const response = await subjectService.createSubject({
        name: newSubject.name
      });
      
      if (response.success) {
        await fetchSubjects();
        setNewSubject({ name: '' });
        setIsAddingSubject(false);
      }
    } catch (err) {
      setError(err.message || 'Error adding subject');
      console.error('Error adding subject:', err);
    }
  };
  
  const handleEditSubject = async () => {
    if (editingSubject.name.trim() === '' || !selectedSubject) {
      setError('Subject name is required');
      return;
    }
    
    try {
      setError(null);
      const response = await subjectService.updateSubject(selectedSubject._id, {
        name: editingSubject.name
      });
      
      if (response.success) {
        await fetchSubjects();
        setEditingSubject({ name: '' });
        setIsEditingSubject(false);
      }
    } catch (err) {
      setError(err.message || 'Error updating subject');
      console.error('Error updating subject:', err);
    }
  };
  
  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject? This will also delete all units and topics within it.')) {
      return;
    }
    
    try {
      setError(null);
      const response = await subjectService.deleteSubject(subjectId);
      
      if (response.success) {
        if (selectedSubject && selectedSubject._id === subjectId) {
          setSelectedSubject(null);
          setSelectedUnit(null);
        }
        await fetchSubjects();
      }
    } catch (err) {
      setError(err.message || 'Error deleting subject');
      console.error('Error deleting subject:', err);
    }
  };
  
  const handleAddUnit = async () => {
    if (newUnit.name.trim() === '' || !selectedSubject) {
      setError('Unit name is required');
      return;
    }
    
    try {
      setError(null);
      const response = await subjectService.addUnit(selectedSubject._id, {
        name: newUnit.name
      });
      
      if (response.success) {
        await fetchSubjects();
        setNewUnit({ name: '' });
        setIsAddingUnit(false);
      }
    } catch (err) {
      setError(err.message || 'Error adding unit');
      console.error('Error adding unit:', err);
    }
  };
  
  const handleEditUnit = async () => {
    if (editingUnit.name.trim() === '' || !selectedSubject || !selectedUnit) {
      setError('Unit name is required');
      return;
    }
    
    try {
      setError(null);
      const response = await subjectService.updateUnit(
        selectedSubject._id,
        selectedUnit._id,
        { name: editingUnit.name }
      );
      
      if (response.success) {
        await fetchSubjects();
        setEditingUnit({ name: '' });
        setIsEditingUnit(false);
      }
    } catch (err) {
      setError(err.message || 'Error updating unit');
      console.error('Error updating unit:', err);
    }
  };
  
  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this unit? This will also delete all topics within it.')) {
      return;
    }
    
    try {
      setError(null);
      const response = await subjectService.deleteUnit(selectedSubject._id, unitId);
      
      if (response.success) {
        if (selectedUnit && selectedUnit._id === unitId) {
          setSelectedUnit(null);
        }
        await fetchSubjects();
      }
    } catch (err) {
      setError(err.message || 'Error deleting unit');
      console.error('Error deleting unit:', err);
    }
  };
  
  const handleAddTopic = async () => {
    if (newTopic.name.trim() === '') {
      setError('Topic name is required');
      return;
    }
    
    if (!selectedSubject) {
      setError('Please select a subject first');
      return;
    }
    
    if (!selectedUnit) {
      setError('Please select a unit first');
      return;
    }
    
    try {
      setError(null);
      console.log('Adding topic with:', {
        subjectId: selectedSubject._id,
        unitId: selectedUnit._id,
        topicData: { name: newTopic.name }
      });
      
      const response = await subjectService.addTopic(
        selectedSubject._id,
        selectedUnit._id,
        { name: newTopic.name }
      );
      
      if (response.success) {
        await fetchSubjects();
        setNewTopic({ name: '' });
        setIsAddingTopic(false);
      } else {
        setError(response.message || 'Failed to add topic');
        console.error('Server returned error:', response);
      }
    } catch (err) {
      const errorMessage = err.message || 'Error adding topic';
      setError(errorMessage);
      console.error('Error adding topic:', err);
    }
  };
  
  const handleEditTopic = async () => {
    if (editingTopic.name.trim() === '' || !selectedSubject || !selectedUnit || !editingTopicId) {
      setError('Topic name is required');
      return;
    }
    
    try {
      setError(null);
      const response = await subjectService.updateTopic(
        selectedSubject._id,
        selectedUnit._id,
        editingTopicId,
        { name: editingTopic.name }
      );
      
      if (response.success) {
        await fetchSubjects();
        setEditingTopic({ name: '' });
        setEditingTopicId(null);
        setIsEditingTopic(false);
      }
    } catch (err) {
      setError(err.message || 'Error updating topic');
      console.error('Error updating topic:', err);
    }
  };
  
  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) {
      return;
    }
    
    try {
      setError(null);
      const response = await subjectService.deleteTopic(
        selectedSubject._id,
        selectedUnit._id,
        topicId
      );
      
      if (response.success) {
        await fetchSubjects();
      }
    } catch (err) {
      setError(err.message || 'Error deleting topic');
      console.error('Error deleting topic:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      )}
      
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
                key={subject._id}
                className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${selectedSubject?._id === subject._id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                onClick={() => handleSelectSubject(subject)}
              >
                <span>{subject.name}</span>
                <div className="flex space-x-2">
                  <button 
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSubject({ name: subject.name });
                      setSelectedSubject(subject);
                      setIsEditingSubject(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubject(subject._id);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          
          {/* Edit Subject Form */}
          {isEditingSubject && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-md font-medium text-gray-900 mb-2">Edit Subject</h3>
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                    placeholder="Subject Name"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  />
                </div>
                <div className="flex">
                  <button
                    onClick={handleEditSubject}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setIsEditingSubject(false)}
                    className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Add Subject Form */}
          {isAddingSubject && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-md font-medium text-gray-900 mb-2">Add New Subject</h3>
              <div className="space-y-2">

                <div>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    placeholder="Subject Name"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  />
                </div>
                <div className="flex">
                  <button
                    onClick={handleAddSubject}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                    key={unit._id}
                    className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${selectedUnit?._id === unit._id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSelectUnit(unit)}
                  >
                    <span>{unit.name}</span>
                    <div className="flex space-x-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingUnit({ name: unit.name });
                          setSelectedUnit(unit);
                          setIsEditingUnit(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUnit(unit._id);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Edit Unit Form */}
              {isEditingUnit && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Edit Unit</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <input
                        type="text"
                        value={editingUnit.name}
                        onChange={(e) => setEditingUnit({...editingUnit, name: e.target.value})}
                        placeholder="Unit Name"
                        className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                      />
                      <button
                        onClick={handleEditUnit}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setIsEditingUnit(false)}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add Unit Form */}
              {isAddingUnit && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Add New Unit</h3>
                  <div className="space-y-2">

                    <div className="flex">
                      <input
                        type="text"
                        value={newUnit.name}
                        onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
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
                        Topic Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedUnit.topics.map((topic) => (
                      <tr key={topic._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {topic.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 justify-end">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => {
                                setEditingTopic({ name: topic.name });
                                setEditingTopicId(topic._id);
                                setIsEditingTopic(true);
                              }}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteTopic(topic._id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Edit Topic Form */}
              {isEditingTopic && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Edit Topic</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <input
                        type="text"
                        value={editingTopic.name}
                        onChange={(e) => setEditingTopic({...editingTopic, name: e.target.value})}
                        placeholder="Topic Name"
                        className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                      />
                      <button
                        onClick={handleEditTopic}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingTopic(false);
                          setEditingTopicId(null);
                        }}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add Topic Form */}
              {isAddingTopic && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Add New Topic</h3>
                  <div className="space-y-2">

                    <div className="flex">
                      <input
                        type="text"
                        value={newTopic.name}
                        onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
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

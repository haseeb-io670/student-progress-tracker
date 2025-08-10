import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';

const UserManagement = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  
  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users');
        setUsers(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    
    try {
      const response = await axios.post('/api/users', {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role
      });
      
      // Add the new user to the state
      setUsers([...users, response.data]);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setIsAddingUser(false);
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Failed to add user. ' + (err.response?.data?.message || 'Please try again.'));
    }
  };
  
  const handleEditUser = async () => {
    if (!selectedUser || !newUser.name || !newUser.email) return;
    
    try {
      const userData = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      };
      
      // Only include password if it was changed
      if (newUser.password) {
        userData.password = newUser.password;
      }
      
      await axios.put(`/api/users/${selectedUser._id}`, userData);
      
      // Update the user in the state
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, ...userData } : user
      ));
      
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setSelectedUser(null);
      setIsEditingUser(false);
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user. ' + (err.response?.data?.message || 'Please try again.'));
    }
  };
  
  
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`/api/users/${userId}`);
      
      // Remove the user from the state
      const updatedUsers = users.filter(user => user._id !== userId);
      setUsers(updatedUsers);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. ' + (err.response?.data?.message || 'Please try again.'));
    }
  };
  
  const startEditUser = (user) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      password: '', // Don't show the password
      role: user.role
    });
    setIsEditingUser(true);
    setIsAddingUser(false);
  };
  
  const cancelForm = () => {
    setIsAddingUser(false);
    setIsEditingUser(false);
    setSelectedUser(null);
    setNewUser({ name: '', email: '', password: '', role: 'user' });
  };
  
  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Teacher';
      case 'user':
        return 'Parent/Student';
      default:
        return role;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {currentUser?.role === 'super_admin' && (
          <button
            onClick={() => {
              setIsAddingUser(true);
              setIsEditingUser(false);
              setSelectedUser(null);
              setNewUser({ name: '', email: '', password: '', role: 'user' });
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Add User
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <FaSpinner className="animate-spin h-8 w-8 text-indigo-500" />
                <span className="ml-2 text-gray-500">Loading users...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No users found</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {/* Only allow editing if current user is super_admin or if it's their own account */}
                            {(currentUser?.role === 'super_admin' || currentUser?._id === user._id) && (
                               <button
                                 onClick={() => startEditUser(user)}
                                 className="text-indigo-600 hover:text-indigo-900 mr-4"
                               >
                                 <FaEdit className="h-5 w-5" />
                               </button>
                             )}
                            {/* Only allow deletion if current user is super_admin and not deleting themselves */}
                            {currentUser?.role === 'super_admin' && currentUser?._id !== user._id && (
                              <button
                                onClick={() => handleDeleteUser(user._id)}
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
      
      {/* Add/Edit User Form */}
      {(isAddingUser || isEditingUser) && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {isAddingUser ? 'Add New User' : 'Edit User'}
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
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password {isEditingUser && '(Leave blank to keep current)'}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required={!isEditingUser}
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="user">Parent/Student</option>
                  <option value="admin">Teacher</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={cancelForm}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={isAddingUser ? handleAddUser : handleEditUser}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isAddingUser ? 'Add User' : 'Update User'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



export default UserManagement;

import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isLoggedIn()) {
          // Get user from local storage first for quick UI loading
          const storedUser = authService.getUser();
          if (storedUser) {
            setCurrentUser(storedUser);
          }
          
          // Then verify with the server
          try {
            const response = await authService.getCurrentUser();
            if (response.success) {
              setCurrentUser(response.data);
            } else {
              // Token might be invalid, clear auth state
              await logout();
            }
          } catch (err) {
            console.error('Error verifying token:', err);
            // Don't log out on network errors to allow offline usage
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      
      if (response.success) {
        setCurrentUser(response.data.user);
        return { success: true, data: response.data.user };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Setup function
  const setup = async (userData) => {
    try {
      setError(null);
      const response = await authService.setup(userData);
      
      if (response.success) {
        setCurrentUser(response.data.user);
        return { success: true, data: response.data.user };
      } else {
        setError(response.message || 'Setup failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Setup failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      
      if (response.success) {
        setCurrentUser(response.data.user);
        return { success: true, data: response.data.user };
      } else {
        setError(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      setError(null);
    }
  };

  // Check user role
  const hasRole = (role) => {
    if (Array.isArray(role)) {
      return role.includes(currentUser?.role);
    }
    return currentUser?.role === role;
  };

  // Check if user is parent of a student
  const isParentOf = (studentId) => {
    if (!currentUser || currentUser.role !== 'user') {
      return false;
    }
    
    return currentUser.children?.includes(studentId);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    setup,
    logout,
    hasRole,
    isParentOf,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // If still loading auth state, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!isAuthenticated || !currentUser) {
    console.log('Not authenticated, redirecting to login...');
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // If role is required and user doesn't have it, redirect to dashboard
  if (requiredRole) {
    // Handle multiple roles
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!roles.includes(currentUser.role)) {
      return <Navigate to="/dashboard" />;
    }
  }

  // Otherwise, render the children
  return children;
};

export default ProtectedRoute;

import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading } = useAuth();

  // If still loading auth state, show nothing or a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If role is required and user doesn't have it, redirect to dashboard
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  // Otherwise, render the children
  return children;
};

export default ProtectedRoute;

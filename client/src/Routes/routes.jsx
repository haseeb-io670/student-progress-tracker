import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Setup from '../pages/Setup';
import Dashboard from '../pages/Dashboard';
import StudentProgress from '../pages/StudentProgress';
import SubjectManagement from '../pages/SubjectManagement';
import UserManagement from '../pages/UserManagement';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <App />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/setup',
    element: <Setup />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'student-progress',
        element: (
          <ProtectedRoute>
            <StudentProgress />
          </ProtectedRoute>
        )
      },
      {
        path: 'subject-management',
        element: (
          <ProtectedRoute requiredRole={['super_admin', 'admin']}>
            <SubjectManagement />
          </ProtectedRoute>
        )
      },
      {
        path: 'user-management',
        element: (
          <ProtectedRoute requiredRole="super_admin">
            <UserManagement />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router;

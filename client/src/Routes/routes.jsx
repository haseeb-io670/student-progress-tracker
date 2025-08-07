import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
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
        element: <StudentProgress />
      },
      {
        path: 'subject-management',
        element: <SubjectManagement />
      },
      {
        path: 'user-management',
        element: <UserManagement />
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router;

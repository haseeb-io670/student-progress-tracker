import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { FaHome, FaUserGraduate, FaBook, FaUsers, FaSignOutAlt, FaTimes } from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const { currentUser, logout, hasRole } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <FaHome className="flex-shrink-0" />,
      roles: ['super_admin', 'admin', 'user']
    },
    {
      name: 'Student Progress',
      path: '/dashboard/student-progress',
      icon: <FaUserGraduate className="flex-shrink-0" />,
      roles: ['super_admin', 'admin', 'user']
    },
    {
      name: 'Subject Management',
      path: '/dashboard/subject-management',
      icon: <FaBook className="flex-shrink-0" />,
      roles: ['super_admin', 'admin']
    },
    {
      name: 'User Management',
      path: '/dashboard/user-management',
      icon: <FaUsers className="flex-shrink-0" />,
      roles: ['super_admin']
    }
  ];

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Teacher';
      case 'user': return 'Parent';
      default: return role;
    }
  };

  // Check if a nav item is active
  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-indigo-800 to-indigo-900 text-white transform transition-transform duration-300 ease-in-out lg:relative ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-700">
        <h2 className="text-xl font-bold tracking-tight">Student Progress</h2>
        {isMobile && (
          <button 
            onClick={() => setIsOpen(false)}
            className="text-indigo-200 hover:text-white"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <div className="px-4 py-4 border-b border-indigo-700">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-lg font-semibold">
              {currentUser?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-indigo-200">{getRoleDisplayName(currentUser?.role) || 'Role'}</p>
          </div>
        </div>
      </div>

      <nav className="mt-5 px-3 flex-grow overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item) => (
            item.roles.includes(currentUser?.role) && (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-indigo-700 text-white shadow-md'
                    : 'text-indigo-100 hover:bg-indigo-700/50'
                }`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <span className={`mr-3 transition-colors duration-200 ${
                  isActive(item.path) ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                }`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            )
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-indigo-700">
        <button
          onClick={logout}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

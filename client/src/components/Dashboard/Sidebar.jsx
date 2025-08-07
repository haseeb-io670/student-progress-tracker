import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { FaHome, FaUserGraduate, FaBook, FaUsers, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { currentUser, logout, hasRole } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <FaHome className="mr-3" />,
      roles: ['super_admin', 'admin', 'user']
    },
    {
      name: 'Student Progress',
      path: '/dashboard/student-progress',
      icon: <FaUserGraduate className="mr-3" />,
      roles: ['super_admin', 'admin', 'user']
    },
    {
      name: 'Subject Management',
      path: '/dashboard/subject-management',
      icon: <FaBook className="mr-3" />,
      roles: ['super_admin', 'admin']
    },
    {
      name: 'User Management',
      path: '/dashboard/user-management',
      icon: <FaUsers className="mr-3" />,
      roles: ['super_admin']
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Student Progress</h2>
        </div>

        <div className="px-4 py-2 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold">
                {currentUser?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-gray-400">{currentUser?.role || 'Role'}</p>
            </div>
          </div>
        </div>

        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              item.roles.includes(currentUser?.role) && (
                <Link
                  key={item.name}
                  to={item.path}
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              )
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-700">
          <button
            onClick={logout}
            className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white w-full"
          >
            <FaSignOutAlt className="mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

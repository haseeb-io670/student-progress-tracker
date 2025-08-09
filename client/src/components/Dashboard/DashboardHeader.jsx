import { useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { FaBars, FaBell, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DashboardHeader = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Teacher';
      case 'user': return 'Parent';
      default: return role;
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    setDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm z-10 sticky top-0">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="px-2 py-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden transition-colors"
              aria-label="Open sidebar"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <div className="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-4">
              <span className="text-gray-900 font-medium">
                Welcome, {currentUser?.name || 'User'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification button */}
            <button 
              className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              aria-label="Notifications"
            >
              <FaBell className="h-5 w-5" />
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {currentUser?.name || 'User'}
                </span>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={handleClickOutside}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                      <p className="text-xs font-medium text-indigo-600 mt-1">{getRoleDisplayName(currentUser?.role)}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleClickOutside}
                    >
                      <FaUser className="mr-3 text-gray-500" />
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleClickOutside}
                    >
                      <FaCog className="mr-3 text-gray-500" />
                      Settings
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="mr-3 text-gray-500" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

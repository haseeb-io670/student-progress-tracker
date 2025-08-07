import { useAuth } from '../../utils/AuthContext';
import { FaBars, FaBell } from 'react-icons/fa';

const DashboardHeader = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            >
              <FaBars className="h-6 w-6" />
            </button>
            <div className="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-4">
              <span className="text-gray-900 font-medium">
                Welcome, {currentUser?.name || 'User'}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
              <FaBell className="h-6 w-6" />
            </button>
            <div className="ml-3 relative">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

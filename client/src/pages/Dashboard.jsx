import { useAuth } from '../utils/AuthContext';
import { FaUserGraduate, FaBook, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  // Mock data for dashboard stats
  const stats = [
    {
      id: 1,
      name: 'Students',
      value: '24',
      icon: <FaUserGraduate className="h-6 w-6 text-indigo-600" />,
      link: '/dashboard/student-progress',
      roles: ['super_admin', 'admin', 'user']
    },
    {
      id: 2,
      name: 'Subjects',
      value: '12',
      icon: <FaBook className="h-6 w-6 text-green-600" />,
      link: '/dashboard/subject-management',
      roles: ['super_admin', 'admin']
    },
    {
      id: 3,
      name: 'Users',
      value: '8',
      icon: <FaUsers className="h-6 w-6 text-blue-600" />,
      link: '/dashboard/user-management',
      roles: ['super_admin']
    }
  ];

  // Filter stats based on user role
  const filteredStats = stats.filter(stat => 
    stat.roles.includes(currentUser?.role)
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Welcome back, {currentUser?.name}!
      </p>

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStats.map((stat) => (
            <Link
              key={stat.id}
              to={stat.link}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            <li>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    Student progress updated
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      New
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Aahil - Physics
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Just now
                    </p>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    New unit added
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      New
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Chemistry - Unit 3
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      2 hours ago
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

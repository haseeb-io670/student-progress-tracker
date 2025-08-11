import { useAuth } from '../utils/AuthContext';
import { FaUserGraduate, FaBook, FaUsers, FaChartLine, FaCalendarAlt, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    students: 0,
    subjects: 0,
    users: 0,
    progressUpdates: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Teacher';
      case 'user': return 'Parent';
      default: return role;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics based on user role
        let studentCount = 0;
        let subjectCount = 0;
        let userCount = 0;
        let progressCount = 0;
        
        // Fetch students count
        if (['super_admin', 'admin', 'user'].includes(currentUser?.role)) {
          const studentsResponse = await axios.get('/api/students');
          studentCount = studentsResponse.data.length || 0;
        }
        
        // Fetch subjects count
        if (['super_admin', 'admin'].includes(currentUser?.role)) {
          const subjectsResponse = await axios.get('/api/subjects');
          subjectCount = subjectsResponse.data.data?.length || 0;
        }
        
        // Fetch users count (super_admin only)
        if (currentUser?.role === 'super_admin') {
          const usersResponse = await axios.get('/api/users');
          userCount = usersResponse.data.length || 0;
        }
        
        // Fetch progress updates count
        if (['super_admin', 'admin'].includes(currentUser?.role)) {
          // For admin/super_admin, get all progress updates
          const progressResponse = await axios.get('/api/progress/recent');
          progressCount = progressResponse.data.length || 0;
        } else if (currentUser?.role === 'user') {
          // For parents, get progress updates for their children
          const childrenResponse = await axios.get('/api/users/me/children');
          const children = childrenResponse.data || [];
          
          // Count progress updates for all children
          let totalUpdates = 0;
          for (const child of children) {
            const progressResponse = await axios.get(`/api/progress/student/${child._id}`);
            totalUpdates += progressResponse.data.length || 0;
          }
          progressCount = totalUpdates;
        }
        
        setDashboardData({
          students: studentCount,
          subjects: subjectCount,
          users: userCount,
          progressUpdates: progressCount
        });
        
        // Fetch recent activity
        const activityResponse = await axios.get('/api/progress/recent');
        setRecentActivity(activityResponse.data || []);
        
        // If no activities found, don't use mock data in production
        if (!activityResponse.data || activityResponse.data.length === 0) {
          setRecentActivity([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
        
        // Don't set fallback mock data in production
        setRecentActivity([]);
        
        // Show error message for activity section
        setError('Failed to load recent activities');
      }
    };
    
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);
  
  // Define stats based on dashboard data
  const stats = [
    {
      id: 1,
      name: 'Students',
      value: dashboardData.students.toString(),
      icon: <FaUserGraduate className="h-6 w-6 text-white" />,
      link: '/dashboard/student-progress',
      roles: ['super_admin', 'admin', 'user'],
      bgColor: 'from-indigo-500 to-indigo-600',
      description: 'Total students in system'
    },
    {
      id: 2,
      name: 'Subjects',
      value: dashboardData.subjects.toString(),
      icon: <FaBook className="h-6 w-6 text-white" />,
      link: '/dashboard/subject-management',
      roles: ['super_admin', 'admin'],
      bgColor: 'from-emerald-500 to-emerald-600',
      description: 'Available subjects'
    },
    {
      id: 3,
      name: 'Users',
      value: dashboardData.users.toString(),
      icon: <FaUsers className="h-6 w-6 text-white" />,
      link: '/dashboard/user-management',
      roles: ['super_admin'],
      bgColor: 'from-blue-500 to-blue-600',
      description: 'Total system users'
    },
    {
      id: 4,
      name: 'Progress Updates',
      value: dashboardData.progressUpdates.toString(),
      icon: <FaChartLine className="h-6 w-6 text-white" />,
      link: '/dashboard/student-progress',
      roles: ['super_admin', 'admin', 'user'],
      bgColor: 'from-purple-500 to-purple-600',
      description: 'Status updates this month'
    }
  ];

  // Filter stats based on user role
  const filteredStats = stats.filter(stat => 
    stat.roles.includes(currentUser?.role)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, <span className="font-medium text-gray-700">{currentUser?.name}</span>! 
            <span className="hidden sm:inline"> You are logged in as {getRoleDisplayName(currentUser?.role)}.</span>
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <FaBell className="mr-2 h-4 w-4 text-indigo-500" />
            Notifications
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredStats.map((stat) => (
          <Link
            key={stat.id}
            to={stat.link}
            className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 bg-gradient-to-br ${stat.bgColor} shadow-md`}>
                  {stat.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                  </dd>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
          <span className="w-1 h-5 bg-indigo-600 rounded-full mr-2"></span>
          Recent Activity
        </h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
          <ul className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {activity.icon}
                      </div>
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {activity.title}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.statusColor}`}>
                        {activity.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {activity.description}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-500 sm:mt-0">
                      <p>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center">
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              View all activity
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
          <span className="w-1 h-5 bg-indigo-600 rounded-full mr-2"></span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/dashboard/student-progress"
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg border border-gray-100 transition-all duration-200 flex flex-col items-center justify-center text-center"
          >
            <FaUserGraduate className="h-8 w-8 text-indigo-500 mb-3" />
            <h3 className="font-medium text-gray-900">View Progress</h3>
            <p className="text-xs text-gray-500 mt-1">Check student progress</p>
          </Link>
          
          {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
            <Link 
              to="/dashboard/subject-management"
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg border border-gray-100 transition-all duration-200 flex flex-col items-center justify-center text-center"
            >
              <FaBook className="h-8 w-8 text-emerald-500 mb-3" />
              <h3 className="font-medium text-gray-900">Manage Subjects</h3>
              <p className="text-xs text-gray-500 mt-1">Add or edit subjects</p>
            </Link>
          )}
          
          {currentUser?.role === 'super_admin' && (
            <Link 
              to="/dashboard/user-management"
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg border border-gray-100 transition-all duration-200 flex flex-col items-center justify-center text-center"
            >
              <FaUsers className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-xs text-gray-500 mt-1">Add or edit users</p>
            </Link>
          )}
          
          <div 
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg border border-gray-100 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer"
          >
            <FaCalendarAlt className="h-8 w-8 text-purple-500 mb-3" />
            <h3 className="font-medium text-gray-900">Calendar</h3>
            <p className="text-xs text-gray-500 mt-1">View upcoming events</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

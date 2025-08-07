import { Link } from 'react-router-dom';
import './index.css';

function App() {
  return (
    <div className="app">
      <main className="main-content">
        <section className="bg-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
                Student Progress Management System
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl">
                Track and manage student progress across subjects, units, and topics.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                A better way to track student progress
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Our system provides comprehensive tools for teachers, parents, and students.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    1
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Track Progress</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Monitor student progress across different subjects and topics with visual indicators.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    2
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Manage Subjects</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Create and manage subjects, units, and topics for comprehensive curriculum tracking.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    3
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">User Management</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Manage teachers, parents, and students with role-based access control.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    4
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Reporting</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Generate reports to track progress over time and identify areas for improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

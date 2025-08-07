import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:order-2">
            <Link to="/" className="text-gray-400 hover:text-gray-300">
              Home
            </Link>
            <span className="mx-2 text-gray-400">|</span>
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-300">
              Dashboard
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1 text-center md:text-left">
            <p className="text-base text-gray-400">
              &copy; {currentYear} Student Progress Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

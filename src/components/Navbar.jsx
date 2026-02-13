import { Link, useLocation } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { HiBriefcase } from 'react-icons/hi';

const Navbar = () => {
  const location = useLocation();

  const isActive = path => {
    if (path === '/employer/dashboard') {
      return location.pathname === '/employer/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-[#D2D5D9] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/employer/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#6794D1] rounded-lg flex items-center justify-center shadow-lg">
              <HiBriefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#2B373F]">JobLoom</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/employer/dashboard"
              className={`font-medium transition-colors pb-1 ${
                isActive('/employer/dashboard')
                  ? 'text-[#6794D1] border-b-2 border-[#6794D1]'
                  : 'text-[#516876] hover:text-[#6794D1]'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/employer/my-jobs"
              className={`font-medium transition-colors pb-1 ${
                isActive('/employer/my-jobs') || isActive('/employer/jobs')
                  ? 'text-[#6794D1] border-b-2 border-[#6794D1]'
                  : 'text-[#516876] hover:text-[#6794D1]'
              }`}
            >
              Jobs
            </Link>
            <Link
              to="/employer/applications"
              className={`font-medium transition-colors pb-1 ${
                isActive('/employer/applications')
                  ? 'text-[#6794D1] border-b-2 border-[#6794D1]'
                  : 'text-[#516876] hover:text-[#6794D1]'
              }`}
            >
              Applications
            </Link>
            <Link
              to="/employer/analytics"
              className={`font-medium transition-colors pb-1 ${
                isActive('/employer/analytics')
                  ? 'text-[#6794D1] border-b-2 border-[#6794D1]'
                  : 'text-[#516876] hover:text-[#6794D1]'
              }`}
            >
              Analytics
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-[#F4F6F9] rounded-lg transition-colors">
              <FaBell className="w-6 h-6 text-[#516876]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#F4F6F9] hover:bg-[#D2D5D9] rounded-lg transition-colors">
              <FaUserCircle className="w-6 h-6 text-[#516876]" />
              <span className="font-medium text-[#2B373F]">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import { Link, useLocation } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { HiBriefcase } from 'react-icons/hi';

import Logo from '/logo.svg';

const Navbar = () => {
  const location = useLocation();

  const isActive = path => {
    if (path === '/employer/dashboard') {
      return location.pathname === '/employer/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const isPublic = location.pathname === '/jobs' || location.pathname.startsWith('/jobs');

  return (
    <header className="bg-white border-b border-[#D2D5D9] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/jobs" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <img src={Logo} alt="JobLoom" className="w-10 h-10 rounded-full" />
              <div className="absolute -inset-0.5 flex items-center justify-center pointer-events-none">
                <div className="w-6 h-6 border-2 border-[#CFE3FF] rounded-full animate-spin"></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-[#2B373F]">JobLoom</span>
          </Link>

          {/* Public minimal nav vs Employer nav */}
          {isPublic ? (
            <div className="flex items-center gap-4">
              <Link
                to="/employer/dashboard"
                className="px-4 py-2 bg-[#6794D1] text-white rounded-lg hover:opacity-95 transition-colors"
              >
                Post a job
              </Link>
              <Link to="/login" className="px-3 py-2 text-sm text-[#6794D1] hover:text-[#2B373F]">
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 px-4 py-2 bg-white border border-[#6794D1] rounded-lg text-sm text-[#6794D1]"
              >
                Register
              </Link>
            </div>
          ) : (
            <>
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
                <Link
                  to="/employer/dashboard"
                  className="hidden md:inline-block px-4 py-2 bg-[#6794D1] text-white rounded-lg hover:opacity-95 transition-colors"
                >
                  Post a job
                </Link>
                <button className="relative p-2 hover:bg-[#F4F6F9] rounded-lg transition-colors">
                  <FaBell className="w-6 h-6 text-[#516876]" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#F4F6F9] hover:bg-[#D2D5D9] rounded-lg transition-colors">
                  <FaUserCircle className="w-6 h-6 text-[#516876]" />
                  <span className="font-medium text-[#2B373F]">Profile</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSignOutAlt, FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useUser } from '../hooks/useUser';
import { getImageUrl } from '../utils/imageUrls';

import Logo from '/logo.svg';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  return (
    <div className="flex items-center gap-1 border-r border-[#D2D5D9] pr-4 mr-2">
      <FaGlobe className="w-4 h-4 text-[#516876] mr-1" />
      <div className="flex gap-2 text-xs font-bold">
        <button
          onClick={() => i18n.changeLanguage('en')}
          className={`px-1.5 py-0.5 rounded transition-colors ${i18n.language.startsWith('en') ? 'bg-[#6794D1] text-white' : 'text-[#516876] hover:bg-gray-100'}`}
        >
          EN
        </button>
        <button
          onClick={() => i18n.changeLanguage('si')}
          className={`px-1.5 py-0.5 rounded transition-colors ${i18n.language === 'si' ? 'bg-[#6794D1] text-white' : 'text-[#516876] hover:bg-gray-100'}`}
        >
          සිං
        </button>
        <button
          onClick={() => i18n.changeLanguage('ta')}
          className={`px-1.5 py-0.5 rounded transition-colors ${i18n.language === 'ta' ? 'bg-[#6794D1] text-white' : 'text-[#516876] hover:bg-gray-100'}`}
        >
          தம
        </button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser, logoutUser } = useUser();

  const isActive = path => {
    if (path === '/employer/dashboard') {
      return location.pathname === '/employer/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const isPublic = location.pathname === '/jobs' || location.pathname.startsWith('/jobs');
  const isEmployerSection = location.pathname.startsWith('/employer');
  const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-registration'].some(p =>
    location.pathname.startsWith(p)
  );

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

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

          {/* Auth pages - minimal nav */}
          {isAuthPage ? (
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link to="/login" className="px-3 py-2 text-sm text-[#6794D1] hover:text-[#2B373F]">
                {t('navbar.sign_in')}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-white border border-[#6794D1] rounded-lg text-sm text-[#6794D1]"
              >
                {t('navbar.register')}
              </Link>
            </div>
          ) : isEmployerSection ? (
            <>
              {/* Employer Nav */}
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/employer/dashboard"
                  className={`font-medium transition-colors pb-1 ${isActive('/employer/dashboard') ? 'text-[#6794D1] border-b-2 border-[#6794D1]' : 'text-[#516876] hover:text-[#6794D1]'}`}
                >
                  {t('navbar.dashboard')}
                </Link>
                <Link
                  to="/employer/my-jobs"
                  className={`font-medium transition-colors pb-1 ${isActive('/employer/my-jobs') || isActive('/employer/jobs') ? 'text-[#6794D1] border-b-2 border-[#6794D1]' : 'text-[#516876] hover:text-[#6794D1]'}`}
                >
                  {t('navbar.jobs')}
                </Link>
                <Link
                  to="/employer/applications"
                  className={`font-medium transition-colors pb-1 ${isActive('/employer/applications') ? 'text-[#6794D1] border-b-2 border-[#6794D1]' : 'text-[#516876] hover:text-[#6794D1]'}`}
                >
                  {t('navbar.applications')}
                </Link>
                <Link
                  to="/employer/analytics"
                  className={`font-medium transition-colors pb-1 ${isActive('/employer/analytics') ? 'text-[#6794D1] border-b-2 border-[#6794D1]' : 'text-[#516876] hover:text-[#6794D1]'}`}
                >
                  {t('navbar.analytics')}
                </Link>
              </nav>
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <Link
                  to="/employer/create-job"
                  className="hidden md:inline-block px-4 py-2 bg-[#6794D1] text-white rounded-lg hover:opacity-95 transition-colors"
                >
                  {t('navbar.post_job')}
                </Link>
                <button className="relative p-2 hover:bg-[#F4F6F9] rounded-lg transition-colors">
                  <FaBell className="w-6 h-6 text-[#516876]" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 bg-[#F4F6F9] hover:bg-[#D2D5D9] rounded-lg transition-colors p-1"
                    >
                      {currentUser.profileImage ? (
                        <img
                          src={getImageUrl(currentUser.profileImage)}
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover border border-[#D2D5D9]"
                          onError={e => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling)
                              e.currentTarget.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <FaUserCircle
                        className={`w-5 h-5 text-[#516876] ${currentUser.profileImage ? 'hidden' : 'block'}`}
                      />
                      <span className="font-medium text-[#2B373F] max-w-[120px] truncate text-sm">
                        {currentUser.role === 'employer'
                          ? currentUser.companyName || currentUser.firstName
                          : currentUser.firstName}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 hover:bg-[#F4F6F9] rounded-lg transition-colors"
                      title={t('navbar.sign_out')}
                    >
                      <FaSignOutAlt className="w-5 h-5 text-[#516876]" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 bg-[#F4F6F9] hover:bg-[#D2D5D9] rounded-lg transition-colors"
                  >
                    <FaUserCircle className="w-6 h-6 text-[#516876]" />
                    <span className="font-medium text-[#2B373F]">{t('navbar.sign_in')}</span>
                  </Link>
                )}
              </div>
            </>
          ) : isPublic ? (
            /* Public Nav */
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link
                to="/register?role=employer"
                className="px-4 py-2 bg-[#6794D1] text-white rounded-lg hover:opacity-95 transition-colors"
              >
                {t('navbar.post_job')}
              </Link>
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2 py-2 border border-[#D2D5D9] rounded-lg hover:bg-[#F4F6F9] transition-colors text-sm"
                  >
                    {currentUser.profileImage ? (
                      <img
                        src={getImageUrl(currentUser.profileImage)}
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover border border-[#D2D5D9]"
                        onError={e => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextSibling)
                            e.currentTarget.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <FaUserCircle
                      className={`w-4 h-4 text-[#516876] ${currentUser.profileImage ? 'hidden' : 'block'}`}
                    />
                    <span className="text-[#2B373F] font-medium">
                      {currentUser.role === 'employer'
                        ? currentUser.companyName || currentUser.firstName
                        : currentUser.firstName}
                    </span>
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 text-sm text-[#6794D1] hover:text-[#2B373F]"
                  >
                    {t('navbar.sign_in')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-white border border-[#6794D1] rounded-lg text-sm text-[#6794D1]"
                  >
                    {t('navbar.register')}
                  </Link>
                </>
              )}
            </div>
          ) : (
            /* Profile / other pages nav */
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link to="/jobs" className="px-3 py-2 text-sm text-[#516876] hover:text-[#6794D1]">
                {t('navbar.browse_jobs')}
              </Link>
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-sm font-medium ${isActive('/profile') ? 'bg-[#6794D1]/10 text-[#6794D1]' : 'bg-[#F4F6F9] hover:bg-[#D2D5D9] text-[#2B373F]'}`}
                  >
                    {currentUser.profileImage ? (
                      <img
                        src={getImageUrl(currentUser.profileImage)}
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover border border-[#D2D5D9]"
                        onError={e => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextSibling)
                            e.currentTarget.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <FaUserCircle
                      className={`w-4 h-4 ${currentUser.profileImage ? 'hidden' : 'block'}`}
                    />
                    {currentUser.role === 'employer'
                      ? currentUser.companyName || currentUser.firstName
                      : currentUser.firstName}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-[#F4F6F9] rounded-lg transition-colors"
                    title={t('navbar.sign_out')}
                  >
                    <FaSignOutAlt className="w-5 h-5 text-[#516876]" />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 text-sm text-[#6794D1] hover:text-[#2B373F]"
                  >
                    {t('navbar.sign_in')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-[#6794D1] text-white rounded-lg text-sm hover:bg-[#5a83c0]"
                  >
                    {t('navbar.register')}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

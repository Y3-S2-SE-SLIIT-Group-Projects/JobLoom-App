import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaGlobe, FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useUser } from '../hooks/useUser';
import { getImageUrl } from '../utils/imageUrls';

const LOGO_SRC = '/logo.svg';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'si', label: 'සිංහල', short: 'සිං' },
  { code: 'ta', label: 'தமிழ்', short: 'தம' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find(l => i18n.language.startsWith(l.code)) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 text-base transition-colors rounded-button text-muted hover:bg-surface-muted hover:text-deep-blue"
        aria-label="Select language"
      >
        <FaGlobe className="w-5 h-5" />
        <span className="font-medium">{current.short}</span>
        <FaChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-surface border border-border rounded-lg shadow-card py-1.5 z-50">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-base transition-colors flex items-center justify-between ${
                i18n.language.startsWith(lang.code)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-text-dark hover:bg-surface-muted'
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-sm opacity-60">{lang.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileAvatar = ({ user }) => {
  if (!user?.profileImage) return <FaUserCircle className="w-8 h-8 text-muted" />;
  return (
    <img
      src={getImageUrl(user.profileImage)}
      alt=""
      className="object-cover w-8 h-8 border rounded-full border-border"
      onError={e => {
        e.currentTarget.onerror = null;
        e.currentTarget.style.display = 'none';
        if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'block';
      }}
    />
  );
};

const UserDisplayName = ({ user }) => {
  const name = user.role === 'employer' ? user.companyName || user.firstName : user.firstName;
  return <span className="font-medium text-text-dark max-w-[140px] truncate">{name}</span>;
};

const SECTION_IDS = ['home', 'who-we-are', 'explore'];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser, logoutUser } = useUser();
  const [activeSection, setActiveSection] = useState('home');

  const isDashboard = location.pathname === '/';

  useEffect(() => {
    if (!isDashboard) return;

    const detectActive = () => {
      const trigger = window.innerHeight * 0.35;
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (el && el.getBoundingClientRect().top <= trigger) {
          setActiveSection(SECTION_IDS[i]);
          return;
        }
      }
      setActiveSection(SECTION_IDS[0]);
    };

    window.addEventListener('scroll', detectActive, { passive: true });
    detectActive();
    return () => window.removeEventListener('scroll', detectActive);
  }, [isDashboard, location.pathname]);

  const scrollToSection = useCallback(
    id => {
      if (isDashboard) {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/#${id}`);
      }
    },
    [isDashboard, navigate]
  );

  const isActive = path => {
    if (path === '/employer/dashboard') return location.pathname === '/employer/dashboard';
    if (path === '/admin/dashboard') return location.pathname === '/admin/dashboard';
    return location.pathname.startsWith(path);
  };

  const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-registration'].some(p =>
    location.pathname.startsWith(p)
  );
  const isAdminSection = location.pathname.startsWith('/admin');

  const showEmployerNav = currentUser?.role === 'employer' && !isAuthPage && !isAdminSection;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navLinkClass = active =>
    `font-medium transition-colors pb-0.5 ${
      active ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-primary'
    }`;

  const sectionLinkClass = id => {
    const active = isDashboard && activeSection === id;
    return `font-semibold transition-all cursor-pointer px-3 py-1.5 rounded-button ${
      active ? 'text-primary bg-primary/10' : 'text-muted hover:text-primary hover:bg-surface-muted'
    }`;
  };

  const publicNavLinks = [
    { id: 'home', label: t('navbar.home') || 'Home' },
    { id: 'who-we-are', label: t('navbar.about') || 'About' },
    { id: 'explore', label: t('navbar.explore') || 'Explore' },
  ];

  const employerNavLinks = [
    { to: '/employer/dashboard', label: t('navbar.dashboard'), exact: true },
    { to: '/employer/my-jobs', label: t('navbar.jobs') },
    { to: '/employer/applications', label: t('navbar.applications') },
    { to: '/employer/analytics', label: t('navbar.analytics') },
  ];

  const adminNavLinks = [
    { to: '/admin/dashboard', label: t('navbar.dashboard'), exact: true },
    { to: '/admin/users', label: t('navbar.users') || 'Users' },
    { to: '/admin/jobs', label: t('navbar.jobs') || 'Jobs' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-surface border-border">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <img
            src={LOGO_SRC}
            alt=""
            width={40}
            height={40}
            className="object-contain w-10 h-10 transition-transform group-hover:scale-105"
            decoding="async"
          />
          <span className="text-2xl font-bold tracking-tight text-deep-blue font-heading">
            JobLoom
          </span>
        </Link>

        {/* Center nav links */}
        {isAdminSection && !isAuthPage ? (
          <nav className="hidden md:flex items-center gap-8">
            {adminNavLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={navLinkClass(
                  link.exact ? location.pathname === link.to : isActive(link.to)
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : showEmployerNav ? (
          <nav className="hidden md:flex items-center gap-8">
            {employerNavLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={navLinkClass(
                  link.exact ? location.pathname === link.to : isActive(link.to)
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : (
          !isAuthPage && (
            <nav className="items-center hidden gap-8 md:flex">
              {publicNavLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={sectionLinkClass(link.id)}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          )
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <LanguageSelector />

          <div className="w-px h-6 bg-border mx-0.5" />

          {/* Context-aware links */}
          {!isAuthPage && (
            <>
              {!showEmployerNav && currentUser?.role === 'job_seeker' && (
                <Link to="/my-applications" className={navLinkClass(isActive('/my-applications'))}>
                  {t('navbar.my_applications')}
                </Link>
              )}
            </>
          )}

          {/* Auth area */}
          {currentUser ? (
            <div className="flex items-center gap-2 ml-1">
              <Link
                to="/profile"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-button transition-colors ${
                  isActive('/profile')
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-surface-muted text-text-dark'
                }`}
              >
                <ProfileAvatar user={currentUser} />
                <UserDisplayName user={currentUser} />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-button text-muted hover:text-error hover:bg-error/10 transition-colors"
                title={t('navbar.sign_out')}
              >
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-1">
              <Link
                to="/login"
                className="px-4 py-2 font-semibold transition-colors text-primary hover:text-deep-blue"
              >
                {t('navbar.sign_in')}
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 font-semibold text-white transition-colors shadow-sm bg-primary rounded-button hover:bg-deep-blue"
              >
                {t('navbar.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

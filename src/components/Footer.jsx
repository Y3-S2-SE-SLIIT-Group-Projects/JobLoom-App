import { Link, useLocation } from 'react-router-dom';
import { FaFacebookF, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Mail, MapPin, Phone, Briefcase, Heart } from 'lucide-react';

const LOGO_SRC = '/logo.svg';

const SOCIAL_LINKS = [
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaXTwitter, href: '#', label: 'X (Twitter)' },
  { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
];

const QUICK_LINKS = [
  { to: '/#explore', label: 'Browse Jobs', homeSectionId: 'explore' },
  { to: '/register', label: 'Create Account' },
  { to: '/login', label: 'Sign In' },
];

const COMPANY_LINKS = [
  { to: '/#who-we-are', label: 'About Us', homeSectionId: 'who-we-are' },
  { to: '#', label: 'Contact' },
  { to: '#', label: 'Privacy Policy' },
  { to: '#', label: 'Terms of Service' },
];

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const handleHomeSectionClick = (e, sectionId) => {
    if (location.pathname !== '/') return;
    e.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    window.history.replaceState(null, '', `/#${sectionId}`);
  };

  return (
    <footer className="bg-deep-blue text-white/90">
      <div className="px-4 pt-6 pb-4 mx-auto max-w-7xl sm:px-6 sm:pt-14 sm:pb-8 lg:px-8 lg:pt-16">
        <div className="grid grid-cols-1 gap-5 min-w-0 sm:gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-8 lg:grid-cols-4 lg:gap-8 lg:items-start">
          {/* Brand column */}
          <div className="min-w-0 lg:col-span-1">
            <Link to="/" className="flex flex-wrap items-center gap-2 mb-3 sm:mb-5 sm:gap-3">
              <img
                src={LOGO_SRC}
                alt=""
                width={36}
                height={36}
                className="object-contain h-8 w-8 sm:h-9 sm:w-9"
                decoding="async"
              />
              <span className="text-xl font-bold tracking-tight text-white font-heading sm:text-2xl">
                JobLoom
              </span>
            </Link>
            <p className="max-w-md text-xs leading-snug text-white/60 sm:text-sm sm:leading-relaxed sm:max-w-sm lg:max-w-xs">
              <span className="sm:hidden">
                Connecting talent with opportunity—find roles or hire with confidence.
              </span>
              <span className="hidden sm:inline">
                Weaving connections between talent and opportunity. Find your next career move or
                discover the perfect candidate.
              </span>
            </p>

            {/* Social icons */}
            <div className="flex flex-wrap items-center gap-2 mt-3 sm:gap-3 sm:mt-6">
              {SOCIAL_LINKS.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-colors rounded-full w-8 h-8 bg-white/10 text-white/70 sm:w-9 sm:h-9 hover:bg-amber hover:text-deep-blue"
                >
                  <social.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links + Company */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 min-w-0 md:contents">
            {/* Quick Links */}
            <div className="min-w-0">
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-white uppercase sm:mb-5 sm:text-sm">
                Quick Links
              </h3>
              <ul className="space-y-1 sm:space-y-2.5 md:space-y-3">
                {QUICK_LINKS.map(({ to, label, homeSectionId }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={
                        homeSectionId ? e => handleHomeSectionClick(e, homeSectionId) : undefined
                      }
                      className="inline-flex items-center gap-1.5 py-0.5 text-xs transition-colors sm:gap-2 sm:text-sm text-white/60 hover:text-amber"
                    >
                      <Briefcase className="hidden w-3.5 h-3.5 opacity-50 sm:inline" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="min-w-0">
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-white uppercase sm:mb-5 sm:text-sm">
                Company
              </h3>
              <ul className="space-y-1 sm:space-y-2.5 md:space-y-3">
                {COMPANY_LINKS.map(({ to, label, homeSectionId }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      onClick={
                        homeSectionId ? e => handleHomeSectionClick(e, homeSectionId) : undefined
                      }
                      className="inline-block py-0.5 text-xs transition-colors sm:text-sm text-white/60 hover:text-amber"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="min-w-0">
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-white uppercase sm:mb-5 sm:text-sm">
              Get in Touch
            </h3>
            <ul className="space-y-2 sm:space-y-3 md:space-y-4">
              <li className="flex items-start gap-2 min-w-0 sm:gap-3">
                <Mail className="w-3.5 h-3.5 mt-0.5 text-amber shrink-0 sm:w-4 sm:h-4" />
                <a
                  href="mailto:support@jobloom.com"
                  className="min-w-0 text-xs break-words transition-colors sm:text-sm text-white/60 hover:text-amber"
                >
                  support@jobloom.com
                </a>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <Phone className="w-3.5 h-3.5 mt-0.5 text-amber shrink-0 sm:w-4 sm:h-4" />
                <span className="text-xs text-white/60 sm:text-sm">+94 11 234 5678</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-amber shrink-0 sm:w-4 sm:h-4" />
                <span className="text-xs text-white/60 sm:text-sm">Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="flex flex-col items-center justify-between gap-2 px-0 pt-4 mt-5 text-center border-t border-white/10 sm:flex-row sm:gap-4 sm:pt-8 sm:mt-12 sm:text-left">
          <p className="max-w-full text-xs leading-relaxed text-white/40">
            &copy; {currentYear} JobLoom. All rights reserved.
          </p>
          <p className="flex flex-wrap items-center justify-center gap-1 text-xs text-white/40 sm:justify-end shrink-0">
            Made with <Heart className="w-3 h-3 text-amber fill-amber shrink-0" aria-hidden /> in
            Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

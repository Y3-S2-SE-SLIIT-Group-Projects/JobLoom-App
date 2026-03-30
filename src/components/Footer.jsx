import { Link } from 'react-router-dom';
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
  { to: '/jobs', label: 'Browse Jobs' },
  { to: '/register', label: 'Create Account' },
  { to: '/login', label: 'Sign In' },
];

const COMPANY_LINKS = [
  { to: '#', label: 'About Us' },
  { to: '#', label: 'Contact' },
  { to: '#', label: 'Privacy Policy' },
  { to: '#', label: 'Terms of Service' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-deep-blue text-white/90">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/jobs" className="flex items-center gap-3 group mb-5">
              <img
                src={LOGO_SRC}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 object-contain brightness-0 invert transition-transform group-hover:scale-105"
                decoding="async"
              />
              <span className="text-2xl font-bold font-heading tracking-tight text-white">
                JobLoom
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Weaving connections between talent and opportunity. Find your next career move or
              discover the perfect candidate.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-amber hover:text-deep-blue transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/60 hover:text-amber transition-colors text-sm inline-flex items-center gap-2"
                  >
                    <Briefcase className="w-3.5 h-3.5 opacity-50" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white mb-5">
              Company
            </h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-white/60 hover:text-amber transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white mb-5">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-amber shrink-0" />
                <a
                  href="mailto:support@jobloom.com"
                  className="text-white/60 hover:text-amber transition-colors text-sm"
                >
                  support@jobloom.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-amber shrink-0" />
                <span className="text-white/60 text-sm">+94 11 234 5678</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-amber shrink-0" />
                <span className="text-white/60 text-sm">Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            &copy; {currentYear} JobLoom. All rights reserved.
          </p>
          <p className="text-white/40 text-xs flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-amber fill-amber" /> in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

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
  { to: '/', label: 'Browse Jobs' },
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
      <div className="px-6 pt-16 pb-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <img
                src={LOGO_SRC}
                alt=""
                width={36}
                height={36}
                className="object-contain transition-transform h-9 w-9 brightness-0 invert group-hover:scale-105"
                decoding="async"
              />
              <span className="text-2xl font-bold tracking-tight text-white font-heading">
                JobLoom
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
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
                  className="flex items-center justify-center transition-colors rounded-full w-9 h-9 bg-white/10 text-white/70 hover:bg-amber hover:text-deep-blue"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-sm font-semibold tracking-wide text-white uppercase">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="inline-flex items-center gap-2 text-sm transition-colors text-white/60 hover:text-amber"
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
            <h3 className="mb-5 text-sm font-semibold tracking-wide text-white uppercase">
              Company
            </h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm transition-colors text-white/60 hover:text-amber"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-sm font-semibold tracking-wide text-white uppercase">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-amber shrink-0" />
                <a
                  href="mailto:support@jobloom.com"
                  className="text-sm transition-colors text-white/60 hover:text-amber"
                >
                  support@jobloom.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-amber shrink-0" />
                <span className="text-sm text-white/60">+94 11 234 5678</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-amber shrink-0" />
                <span className="text-sm text-white/60">Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 mt-12 border-t border-white/10 sm:flex-row">
          <p className="text-xs text-white/40">
            &copy; {currentYear} JobLoom. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-white/40">
            Made with <Heart className="w-3 h-3 text-amber fill-amber" /> in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

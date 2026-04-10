import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../hooks/useUser';
import RegistrationForm from '../../components/auth/RegistrationForm';
import { useState } from 'react';
import { FaCheckCircle, FaUsers, FaBriefcase, FaShieldAlt } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { registerUser, loading } = useUser();
  const [apiError, setApiError] = useState('');

  const handleSubmit = async submitData => {
    try {
      setApiError('');
      await registerUser(submitData);
      // Redirect to OTP verification with phone number
      navigate('/verify-registration', { state: { phone: submitData.phone } });
    } catch (err) {
      setApiError(
        err.message || t('errors.registration_failed', 'Registration failed. Please try again.')
      );
    }
  };

  const features = [
    {
      icon: <FaCheckCircle className="w-5 h-5" />,
      title: t('auth.feature_easy', 'Simple Registration'),
      description: t('auth.feature_easy_desc', 'Get started in just a few minutes'),
    },
    {
      icon: <FaUsers className="w-5 h-5" />,
      title: t('auth.feature_network', 'Connect & Grow'),
      description: t('auth.feature_network_desc', 'Join our professional community'),
    },
    {
      icon: <FaBriefcase className="w-5 h-5" />,
      title: t('auth.feature_opportunities', 'Great Opportunities'),
      description: t('auth.feature_opportunities_desc', 'Access thousands of job listings'),
    },
    {
      icon: <FaShieldAlt className="w-5 h-5" />,
      title: t('auth.feature_secure', 'Secure & Private'),
      description: t('auth.feature_secure_desc', 'Your data is safe with us'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Information Panel */}
      <div className="lg:w-2/5 bg-primary text-white p-8 lg:p-12 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <Link to="/" className="inline-block mb-12">
            <h1 className="text-2xl font-bold">JobLoom</h1>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-3">
                {t('auth.welcome_register', 'Join JobLoom Today')}
              </h2>
              <p className="text-white/90 text-lg">
                {t(
                  'auth.register_subtitle',
                  'Create your account and start your journey towards your dream career or finding the perfect talent.'
                )}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="hidden lg:block mt-12 pt-8 border-t border-white/20">
          <p className="text-white/70 text-sm">
            {t(
              'auth.trusted_by',
              'Trusted by thousands of job seekers and employers across Sri Lanka'
            )}
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 bg-surface-muted flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          {apiError && (
            <div className="p-4 mb-5 border border-error/30 rounded-lg bg-error/10 animate-in fade-in slide-in-from-top-2">
              <p className="text-sm text-error">{apiError}</p>
            </div>
          )}

          <RegistrationForm onSubmit={handleSubmit} loading={loading} />

          <p className="mt-6 text-center text-sm text-muted">
            {t('auth.already_have_account')}{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              {t('navbar.sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

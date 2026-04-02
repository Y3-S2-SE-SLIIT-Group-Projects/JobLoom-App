import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../hooks/useUser';
import DottedBackground from '../../components/DottedBackground';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import Logo from '/logo.svg';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { loginUser, loading } = useUser();

  const from = location.state?.from?.pathname || null;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = t('errors.email_required');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('errors.invalid_email');
    if (!formData.password) newErrors.password = t('errors.password_required');
    return newErrors;
  };

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const data = await loginUser(formData.email, formData.password);

      // If there was a specific page they were trying to access, go there
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Default redirect based on role
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setApiError(err.message || t('errors.login_failed'));
    }
  };

  return (
    <>
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
              <div className="mb-6 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-text-dark mb-1">{t('auth.login_title')}</h1>
                <p className="text-muted">
                  {t('auth.login_subtitle', 'Sign in to your account to continue')}
                </p>
              </div>

              {apiError && (
                <div className="p-4 mb-5 border border-error/30 rounded-lg bg-error/10">
                  <p className="text-sm text-error">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1.5">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute w-4 h-4 text-subtle -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('auth.email_placeholder')}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                        errors.email ? 'border-error bg-error/10' : 'border-border'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-text-dark">
                      {t('auth.password')}
                    </label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      {t('auth.forgot_password')}
                    </Link>
                  </div>
                  <div className="relative">
                    <FaLock className="absolute w-4 h-4 text-subtle -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t('auth.password_placeholder')}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                        errors.password ? 'border-error bg-error/10' : 'border-border'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute text-subtle -translate-y-1/2 right-3 top-1/2 hover:text-muted"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-error">{errors.password}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <FaSignInAlt className="w-4 h-4" />
                      {t('navbar.sign_in')}
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                {t('auth.no_account')}{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  {t('auth.create_account')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </DottedBackground>
    </>
  );
};

export default Login;

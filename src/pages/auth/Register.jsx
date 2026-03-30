import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../hooks/useUser';
import DottedBackground from '../../components/DottedBackground';
import RegistrationForm from '../../components/auth/RegistrationForm';
import { useState } from 'react';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { registerUser, loading } = useUser();
  const [apiError, setApiError] = useState('');

  // Determine role from query param, default to job_seeker
  const role = searchParams.get('role') || 'job_seeker';

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

  return (
    <DottedBackground>
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-lg">
          {apiError && (
            <div className="p-4 mb-5 border border-error/30 rounded-lg bg-error/10 animate-in fade-in slide-in-from-top-2">
              <p className="text-sm text-error">{apiError}</p>
            </div>
          )}

          <RegistrationForm role={role} onSubmit={handleSubmit} loading={loading} />

          <p className="mt-6 text-center text-sm text-muted">
            {t('auth.already_have_account')}{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              {t('navbar.sign_in')}
            </Link>
          </p>

          {/* Subtle switcher if they are on the wrong page */}
          <div className="mt-4 text-center">
            {role === 'employer' ? (
              <button
                onClick={() => navigate('/register?role=job_seeker')}
                className="text-xs text-muted hover:text-primary transition-colors"
              >
                {t('auth.switch_to_job_seeker')}
              </button>
            ) : (
              <button
                onClick={() => navigate('/register?role=employer')}
                className="text-xs text-muted hover:text-primary transition-colors"
              >
                {t('auth.switch_to_employer')}
              </button>
            )}
          </div>
        </div>
      </div>
    </DottedBackground>
  );
};

export default Register;

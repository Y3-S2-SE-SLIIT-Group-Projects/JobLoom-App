import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../hooks/useUser';
import DottedBackground from '../../components/DottedBackground';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import Logo from '/logo.svg';

const VerifyRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { verifyRegistration, loading } = useUser();

  const phone = location.state?.phone || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!phone) {
      navigate('/register');
    }
    inputRefs.current[0]?.focus();
  }, [phone, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = e => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = [...otp];
      pasted.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError(t('errors.otp_required'));
      return;
    }
    try {
      const data = await verifyRegistration(phone, otpString);
      setSuccess(t('auth.verify_success'));
      setTimeout(() => {
        if (data.role === 'employer') {
          navigate('/employer/dashboard');
        } else {
          navigate('/profile/complete');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || t('errors.otp_failed'));
    }
  };

  return (
    <>
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <FaShieldAlt className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-text-dark mb-2">{t('auth.verify_title')}</h1>
                <p className="text-muted">
                  {t('auth.verify_desc')}{' '}
                  <span className="font-medium text-text-dark">{phone}</span>
                </p>
              </div>

              {error && (
                <div className="p-4 mb-5 border border-error/30 rounded-lg bg-error/10">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 mb-5 border border-success/30 rounded-lg bg-success/10">
                  <p className="text-sm text-success">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* OTP Inputs */}
                <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                        digit ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length < 6}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : (
                    t('auth.verify_button')
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between mt-6">
                <Link
                  to="/register"
                  className="flex items-center gap-2 text-sm text-muted hover:text-text-dark"
                >
                  <FaArrowLeft className="w-3 h-3" />
                  {t('auth.already_have_account') ? t('common.back') : 'Back to Register'}
                </Link>
                <p className="text-sm text-muted">
                  {t('auth.resend_label')}{' '}
                  <button
                    type="button"
                    className="text-primary font-medium hover:underline"
                    onClick={() => setError(t('errors.resend_error'))}
                  >
                    {t('auth.resend_button')}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DottedBackground>
    </>
  );
};

export default VerifyRegistration;

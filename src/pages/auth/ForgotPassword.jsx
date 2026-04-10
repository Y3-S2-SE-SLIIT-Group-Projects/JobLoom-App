import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../hooks/useUser';
import DottedBackground from '../../components/DottedBackground';
import {
  FaPhone,
  FaShieldAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheckCircle,
} from 'react-icons/fa';
import Logo from '/logo.svg';

// Step 1 - Enter Phone
const PhoneStep = ({ onNext, loading }) => {
  const { t } = useTranslation();
  const { forgotPassword } = useUser();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const normalizePhone = value => value.replace(/\D/g, '').slice(0, 10);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!phone.trim()) {
      setError(t('errors.phone_required'));
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setError(t('errors.invalid_phone'));
      return;
    }
    try {
      await forgotPassword(phone);
      onNext(phone);
    } catch (err) {
      setError(err.message || t('errors.otp_send_failed'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <FaPhone className="w-7 h-7 text-primary" />
        </div>
      </div>
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-text-dark mb-1">{t('auth.forgot_pwd_title')}</h1>
        <p className="text-muted">{t('auth.forgot_pwd_subtitle')}</p>
      </div>

      {error && (
        <div className="p-4 border border-error/30 rounded-lg bg-error/10">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1.5">
          {t('auth.phone_number')} <span className="text-error">*</span>
        </label>
        <div className="relative">
          <FaPhone className="absolute w-4 h-4 text-subtle -translate-y-1/2 left-3 top-1/2" />
          <input
            type="tel"
            value={phone}
            inputMode="numeric"
            maxLength={10}
            pattern="\d{10}"
            onChange={e => {
              setPhone(normalizePhone(e.target.value));
              setError('');
            }}
            placeholder={t('auth.phone_placeholder')}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${error ? 'border-error bg-error/10' : 'border-border'}`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
        ) : (
          t('auth.send_otp')
        )}
      </button>
    </form>
  );
};

// Step 2 - Verify OTP
const OtpStep = ({ phone, onNext, onBack, loading }) => {
  const { t } = useTranslation();
  const { verifyPasswordReset } = useUser();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
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
      const data = await verifyPasswordReset(phone, otpString);
      onNext(data.resetToken);
    } catch (err) {
      setError(err.message || t('errors.otp_failed'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <FaShieldAlt className="w-7 h-7 text-primary" />
        </div>
      </div>
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-text-dark mb-1">{t('auth.enter_otp')}</h1>
        <p className="text-muted">
          {t('auth.verify_desc')} <span className="font-medium text-text-dark">{phone}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 border border-error/30 rounded-lg bg-error/10">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <div className="flex justify-center gap-3" onPaste={handlePaste}>
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
            className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${digit ? 'border-primary bg-primary/5' : 'border-border'}`}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-border text-muted rounded-lg hover:bg-surface-muted transition-colors font-medium"
        >
          <FaArrowLeft className="w-4 h-4" /> {t('common.back')}
        </button>
        <button
          type="submit"
          disabled={loading || otp.join('').length < 6}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
          ) : (
            t('auth.verify_otp')
          )}
        </button>
      </div>
    </form>
  );
};

// Step 3 - Reset Password
const ResetStep = ({ phone, resetToken, loading }) => {
  const { t } = useTranslation();
  const { resetPassword } = useUser();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!password) {
      setError(t('errors.password_required'));
      return;
    }
    if (password.length < 6) {
      setError(t('errors.password_min_length'));
      return;
    }
    if (password !== confirm) {
      setError(t('errors.passwords_dont_match'));
      return;
    }
    try {
      await resetPassword(phone, resetToken, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || t('errors.reset_failed'));
    }
  };

  if (done) {
    return (
      <div className="py-4 space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 bg-success/10 rounded-full">
            <FaCheckCircle className="w-8 h-8 text-success" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-text-dark">{t('auth.password_reset_success')}</h2>
        <p className="text-muted">{t('auth.password_reset_success_desc')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <FaLock className="w-7 h-7 text-primary" />
        </div>
      </div>
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-text-dark mb-1">{t('auth.set_new_password')}</h1>
        <p className="text-muted">{t('auth.set_new_password_subtitle')}</p>
      </div>

      {error && (
        <div className="p-4 border border-error/30 rounded-lg bg-error/10">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1.5">
          {t('auth.new_password')}
        </label>
        <div className="relative">
          <FaLock className="absolute w-4 h-4 text-subtle -translate-y-1/2 left-3 top-1/2" />
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder={t('errors.password_min_length')}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${error ? 'border-error bg-error/10' : 'border-border'}`}
          />
          <button
            type="button"
            onClick={() => setShowPwd(p => !p)}
            className="absolute text-subtle -translate-y-1/2 right-3 top-1/2"
          >
            {showPwd ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1.5">
          {t('auth.confirm_password')}
        </label>
        <div className="relative">
          <FaLock className="absolute w-4 h-4 text-subtle -translate-y-1/2 left-3 top-1/2" />
          <input
            type={showPwd ? 'text' : 'password'}
            value={confirm}
            onChange={e => {
              setConfirm(e.target.value);
              setError('');
            }}
            placeholder={t('auth.confirm_password_placeholder')}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${error ? 'border-error bg-error/10' : 'border-border'}`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
        ) : (
          t('auth.reset_password_button')
        )}
      </button>
    </form>
  );
};

// Main ForgotPassword page (3-step flow)
const ForgotPassword = () => {
  const { t } = useTranslation();
  const { loading } = useUser();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [resetToken, setResetToken] = useState('');

  const steps = ['Phone', 'Verify', 'Reset'];

  return (
    <>
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i + 1 <= step ? 'bg-primary text-white' : 'bg-surface-muted text-muted'}`}
                      >
                        {i + 1 < step ? '✓' : i + 1}
                      </div>
                      <span
                        className={`text-xs font-medium hidden sm:block ${i + 1 <= step ? 'text-primary' : 'text-muted'}`}
                      >
                        {i === 0
                          ? t('auth.phone_number')
                          : i === 1
                            ? t('auth.enter_otp')
                            : t('common.reset')}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 rounded-full mx-2 ${i + 2 <= step ? 'bg-primary' : 'bg-neutral-200'}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <PhoneStep
                  loading={loading}
                  onNext={p => {
                    setPhone(p);
                    setStep(2);
                  }}
                />
              )}
              {step === 2 && (
                <OtpStep
                  phone={phone}
                  loading={loading}
                  onNext={token => {
                    setResetToken(token);
                    setStep(3);
                  }}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <ResetStep
                  phone={phone}
                  resetToken={resetToken}
                  loading={loading}
                  onBack={() => setStep(2)}
                />
              )}

              {step === 1 && (
                <p className="mt-6 text-center text-sm text-muted">
                  {t('auth.remembered_password')}{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    {t('navbar.sign_in')}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </DottedBackground>
    </>
  );
};

export default ForgotPassword;

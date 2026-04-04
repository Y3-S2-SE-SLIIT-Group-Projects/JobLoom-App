import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaArrowLeft,
  FaBriefcase,
} from 'react-icons/fa';

const PROVINCES = [
  'Western',
  'Central',
  'Southern',
  'Northern',
  'Eastern',
  'North Western',
  'North Central',
  'Uva',
  'Sabaragamuwa',
];

const RegistrationForm = ({ role = 'job_seeker', onSubmit, loading, initialData = {} }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // Start at step 0 for role selection
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: role,
    companyName: '',
    location: { village: '', district: '', province: '' },
    ...initialData,
  });

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({ ...prev, location: { ...prev.location, [key]: value } }));
      if (errors[`location.${key}`]) setErrors(prev => ({ ...prev, [`location.${key}`]: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = t('errors.first_name_required');
    if (!formData.lastName.trim()) errs.lastName = t('errors.last_name_required');
    if (!formData.email.trim()) errs.email = t('errors.email_required');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = t('errors.invalid_email');
    if (!formData.phone.trim()) errs.phone = t('errors.phone_required');
    if (!formData.password) errs.password = t('errors.password_required');
    else if (formData.password.length < 6) errs.password = t('errors.password_min_length');
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = t('errors.passwords_dont_match');

    if (formData.role === 'employer' && !formData.companyName?.trim()) {
      errs.companyName = t('errors.company_name_required', 'Company name is required');
    }

    // Phone validation (Sri Lanka format or general)
    const phoneRegex = /^(\+94|0)?7[0-9]{8}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      errs.phone = t('errors.invalid_phone', 'Please enter a valid phone number');
    }

    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.location.village.trim()) errs['location.village'] = t('errors.village_required');
    if (!formData.location.district.trim())
      errs['location.district'] = t('errors.district_required');
    if (!formData.location.province.trim())
      errs['location.province'] = t('errors.province_required');
    return errs;
  };

  const handleRoleSelection = selectedRole => {
    setFormData(prev => ({ ...prev, role: selectedRole }));
    setStep(1);
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const { confirmPassword: _confirmPassword, ...submitData } = formData;
    onSubmit(submitData);
  };

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 0 ? 'bg-primary text-white' : 'bg-surface-muted text-muted'}`}
        >
          1
        </div>
        <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-neutral-200'}`} />
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-surface-muted text-muted'}`}
        >
          2
        </div>
        <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-neutral-200'}`} />
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-surface-muted text-muted'}`}
        >
          3
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-dark mb-1">
          {step === 0
            ? t('auth.choose_account_type', 'Choose Account Type')
            : formData.role === 'employer'
              ? t('auth.employer_registration', 'Employer Registration')
              : t('auth.job_seeker_registration', 'Job Seeker Registration')}
        </h1>
        <p className="text-muted">
          {step === 0
            ? t('auth.step_select_role_desc', 'Select the type of account you want to create')
            : step === 1
              ? t('auth.step_create_account_desc', 'Fill in your account details to get started')
              : t('auth.step_location_desc', 'Tell us where you are located')}
        </p>
      </div>

      {step === 0 ? (
        // Step 0: Role Selection
        <div className="space-y-4">
          <div
            onClick={() => handleRoleSelection('job_seeker')}
            className="group cursor-pointer p-6 border-2 border-border rounded-lg hover:border-primary transition-colors duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                <FaUser className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-dark mb-1">
                  {t('auth.job_seeker', 'Job Seeker')}
                </h3>
                <p className="text-sm text-muted">
                  {t(
                    'auth.job_seeker_desc',
                    'Find and apply for jobs, build your profile, and connect with employers'
                  )}
                </p>
              </div>
              <FaArrowRight className="w-5 h-5 text-subtle group-hover:text-primary transition-colors" />
            </div>
          </div>

          <div
            onClick={() => handleRoleSelection('employer')}
            className="group cursor-pointer p-6 border-2 border-border rounded-lg hover:border-primary transition-colors duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                <FaBriefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-dark mb-1">
                  {t('auth.employer', 'Employer')}
                </h3>
                <p className="text-sm text-muted">
                  {t(
                    'auth.employer_desc',
                    'Post job openings, find talented candidates, and manage applications'
                  )}
                </p>
              </div>
              <FaArrowRight className="w-5 h-5 text-subtle group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      ) : step === 1 ? (
        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-dark mb-1.5">
                {t('auth.first_name')}
              </label>
              <div className="relative">
                <FaUser className="absolute w-4 h-4 text-subtle -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t('auth.first_name_placeholder')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent ${errors.firstName ? 'border-error bg-error/10' : 'border-border'}`}
                />
              </div>
              {errors.firstName && <p className="mt-1 text-xs text-error">{errors.firstName}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-dark mb-1.5">
                {t('auth.last_name')}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t('auth.last_name_placeholder')}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent ${errors.lastName ? 'border-error bg-error/10' : 'border-border'}`}
              />
              {errors.lastName && <p className="mt-1 text-xs text-error">{errors.lastName}</p>}
            </div>
          </div>

          {formData.role === 'employer' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-text-dark mb-1.5">
                {t('auth.company_name')}
              </label>
              <div className="relative">
                <FaBriefcase className="absolute w-4 h-4 text-subtle -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder={t('auth.company_name')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent ${errors.companyName ? 'border-error bg-error/10' : 'border-border'}`}
                />
              </div>
              {errors.companyName && (
                <p className="mt-1 text-xs text-error">{errors.companyName}</p>
              )}
            </div>
          )}

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
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent ${errors.email ? 'border-error bg-error/10' : 'border-border'}`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1.5">
              {t('auth.phone_number')}
            </label>
            <div className="relative">
              <FaPhone className="absolute w-4 h-4 text-subtle -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('auth.phone_placeholder')}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent ${errors.phone ? 'border-error bg-error/10' : 'border-border'}`}
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1.5">
              {t('auth.password')}
            </label>
            <div className="relative">
              <FaLock className="absolute w-4 h-4 text-subtle -translate-y-1/2 left-3 top-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.password_placeholder')}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent ${errors.password ? 'border-error bg-error/10' : 'border-border'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-subtle -translate-y-1/2 right-3 top-1/2"
              >
                {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-error">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1.5">
              {t('auth.confirm_password')}
            </label>
            <div className="relative">
              <FaLock className="absolute w-4 h-4 text-subtle -translate-y-1/2 left-3 top-1/2" />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('auth.confirm_password_placeholder')}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent ${errors.confirmPassword ? 'border-error bg-error/10' : 'border-border'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute text-subtle -translate-y-1/2 right-3 top-1/2"
              >
                {showConfirm ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-error">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-deep-blue font-medium transition-colors"
          >
            {t('auth.next')} <FaArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1.5">
              {t('auth.village_town')}
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute w-4 h-4 text-subtle -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                name="location.village"
                value={formData.location.village}
                onChange={handleChange}
                placeholder={t('auth.village_placeholder')}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent ${errors['location.village'] ? 'border-error bg-error/10' : 'border-border'}`}
              />
            </div>
            {errors['location.village'] && (
              <p className="mt-1 text-xs text-error">{errors['location.village']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1.5">
              {t('auth.district')}
            </label>
            <input
              type="text"
              name="location.district"
              value={formData.location.district}
              onChange={handleChange}
              placeholder={t('auth.district_placeholder')}
              className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent ${errors['location.district'] ? 'border-error bg-error/10' : 'border-border'}`}
            />
            {errors['location.district'] && (
              <p className="mt-1 text-xs text-error">{errors['location.district']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1.5">
              {t('auth.province')}
            </label>
            <select
              name="location.province"
              value={formData.location.province}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent ${errors['location.province'] ? 'border-error bg-error/10' : 'border-border'}`}
            >
              <option value="">{t('auth.select_province')}</option>
              {PROVINCES.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors['location.province'] && (
              <p className="mt-1 text-xs text-error">{errors['location.province']}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-border text-muted rounded-lg hover:bg-surface-muted font-medium transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" /> {t('common.back')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-deep-blue font-medium disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
              ) : (
                t('auth.create_account')
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RegistrationForm;

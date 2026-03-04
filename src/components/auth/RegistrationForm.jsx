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
  const [step, setStep] = useState(1);
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

    if (role === 'employer' && !formData.companyName?.trim()) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-[#D2D5D9] p-8">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 1 ? 'bg-[#6794D1] text-white' : 'bg-[#F4F6F9] text-[#516876]'}`}
        >
          1
        </div>
        <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-[#6794D1]' : 'bg-[#D2D5D9]'}`} />
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 2 ? 'bg-[#6794D1] text-white' : 'bg-[#F4F6F9] text-[#516876]'}`}
        >
          2
        </div>
      </div>

      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-[#2B373F] mb-1">
          {role === 'employer'
            ? t('auth.employer_registration')
            : t('auth.job_seeker_registration')}
        </h1>
        <p className="text-[#516876]">
          {step === 1 ? t('auth.step_create_account_desc') : t('auth.step_location_desc')}
        </p>
      </div>

      {step === 1 ? (
        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                {t('auth.first_name')}
              </label>
              <div className="relative">
                <FaUser className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t('auth.first_name_placeholder')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[#6794D1] focus:border-transparent ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                />
              </div>
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                {t('auth.last_name')}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t('auth.last_name_placeholder')}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[#6794D1] focus:border-transparent ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          {role === 'employer' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                {t('auth.company_name')}
              </label>
              <div className="relative">
                <FaBriefcase className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder={t('auth.company_name')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[#6794D1] focus:border-transparent ${errors.companyName ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                />
              </div>
              {errors.companyName && (
                <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
              {t('auth.email')}
            </label>
            <div className="relative">
              <FaEnvelope className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.email_placeholder')}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[#6794D1] focus:border-transparent ${errors.email ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
              {t('auth.phone_number')}
            </label>
            <div className="relative">
              <FaPhone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('auth.phone_placeholder')}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[#6794D1] focus:border-transparent ${errors.phone ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
              {t('auth.password')}
            </label>
            <div className="relative">
              <FaLock className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.password_placeholder')}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[#6794D1] focus:border-transparent ${errors.password ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2"
              >
                {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
              {t('auth.confirm_password')}
            </label>
            <div className="relative">
              <FaLock className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('auth.confirm_password_placeholder')}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[#6794D1] focus:border-transparent ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2"
              >
                {showConfirm ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] font-medium transition-colors"
          >
            {t('auth.next')} <FaArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
              {t('auth.village_town')}
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                name="location.village"
                value={formData.location.village}
                onChange={handleChange}
                placeholder={t('auth.village_placeholder')}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[#6794D1] focus:border-transparent ${errors['location.village'] ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
              {t('auth.district')}
            </label>
            <input
              type="text"
              name="location.district"
              value={formData.location.district}
              onChange={handleChange}
              placeholder={t('auth.district_placeholder')}
              className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[#6794D1] focus:border-transparent ${errors['location.district'] ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
              {t('auth.province')}
            </label>
            <select
              name="location.province"
              value={formData.location.province}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[#6794D1] focus:border-transparent ${errors['location.province'] ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
            >
              <option value="">{t('auth.select_province')}</option>
              {PROVINCES.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-[#D2D5D9] text-[#516876] rounded-lg hover:bg-[#F4F6F9] font-medium"
            >
              <FaArrowLeft className="w-4 h-4" /> {t('common.back')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] font-medium disabled:opacity-60 transition-colors"
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

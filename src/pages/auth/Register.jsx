import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import Navbar from '../../components/Navbar';
import DottedBackground from '../../components/DottedBackground';
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
import Logo from '/logo.svg';

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

const ROLES = [
  { value: 'job_seeker', label: 'auth.role_job_seeker', description: 'auth.job_seeker_desc' },
  { value: 'employer', label: 'auth.role_employer', description: 'auth.employer_desc' },
];

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { registerUser, loading } = useUser();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'job_seeker',
    companyName: '',
    location: { village: '', district: '', province: '' },
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
    setApiError('');
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.firstName.trim())
      errs.firstName = t('errors.first_name_required', 'First name is required');
    if (!formData.lastName.trim())
      errs.lastName = t('errors.last_name_required', 'Last name is required');
    if (!formData.email.trim()) errs.email = t('errors.email_required', 'Email is required');
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = t('errors.invalid_email', 'Enter a valid email');
    if (!formData.phone.trim()) errs.phone = t('errors.phone_required', 'Phone number is required');
    if (!formData.password) errs.password = t('errors.password_required', 'Password is required');
    else if (formData.password.length < 6)
      errs.password = t('errors.password_min_length', 'Password must be at least 6 characters');
    if (!formData.confirmPassword)
      errs.confirmPassword = t('errors.confirm_password_required', 'Please confirm your password');
    else if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = t('errors.passwords_dont_match', 'Passwords do not match');

    if (formData.role === 'employer' && !formData.companyName?.trim()) {
      errs.companyName = t('errors.company_name_required', 'Company name is required');
    }
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.location.village.trim())
      errs['location.village'] = t('errors.village_required', 'Village/Town is required');
    if (!formData.location.district.trim())
      errs['location.district'] = t('errors.district_required', 'District is required');
    if (!formData.location.province.trim())
      errs['location.province'] = t('errors.province_required', 'Province is required');
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      const { confirmPassword: _confirmPassword, ...submitData } = formData;
      await registerUser(submitData);
      // Redirect to OTP verification with phone number
      navigate('/verify-registration', { state: { phone: formData.phone } });
    } catch (err) {
      setApiError(
        err.message || t('errors.registration_failed', 'Registration failed. Please try again.')
      );
    }
  };

  return (
    <>
      <Navbar />
      <DottedBackground>
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            {/* Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#D2D5D9] p-8">
              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 1 ? 'bg-[#6794D1] text-white' : 'bg-[#F4F6F9] text-[#516876]'}`}
                >
                  1
                </div>
                <div
                  className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-[#6794D1]' : 'bg-[#D2D5D9]'}`}
                />
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 2 ? 'bg-[#6794D1] text-white' : 'bg-[#F4F6F9] text-[#516876]'}`}
                >
                  2
                </div>
              </div>

              <div className="mb-6 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-[#2B373F] mb-1">
                  {step === 1 ? t('auth.step_create_account') : t('auth.step_location')}
                </h1>
                <p className="text-[#516876]">
                  {step === 1 ? t('auth.step_create_account_desc') : t('auth.step_location_desc')}
                </p>
              </div>

              {apiError && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#2B373F] mb-2">
                      {t('auth.role_selection_label')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {ROLES.map(role => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                          className={`p-4 border-2 rounded-xl text-left transition-all ${
                            formData.role === role.value
                              ? 'border-[#6794D1] bg-[#6794D1]/5'
                              : 'border-[#D2D5D9] hover:border-[#6794D1]/50'
                          }`}
                        >
                          <FaBriefcase
                            className={`w-5 h-5 mb-2 ${formData.role === role.value ? 'text-[#6794D1]' : 'text-gray-400'}`}
                          />
                          <p className="font-medium text-[#2B373F] text-sm">{t(role.label)}</p>
                          <p className="text-xs text-[#516876] mt-0.5">{t(role.description)}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name row */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                        {t('auth.first_name')}
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder={t('auth.first_name_placeholder')}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                      )}
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
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Company Name (Employer only) */}
                  {formData.role === 'employer' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                        {t('auth.company_name')}
                      </label>
                      <div className="relative">
                        <FaBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="e.g. Acme Inc"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.companyName ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                        />
                      </div>
                      {errors.companyName && (
                        <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
                      )}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                      {t('auth.email')}
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('auth.email_placeholder')}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                      {t('auth.phone_number')}
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={t('auth.phone_placeholder')}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.phone ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                      {t('auth.password')}
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t('errors.password_min_length', 'Min. 6 characters')}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.password ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                      {t('auth.confirm_password')}
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder={t('auth.confirm_password_placeholder')}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirm ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors font-medium"
                  >
                    {t('auth.next')}
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                      {t('auth.village_town')}
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="location.village"
                        value={formData.location.village}
                        onChange={handleChange}
                        placeholder={t('auth.village_placeholder')}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors['location.village'] ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                      />
                    </div>
                    {errors['location.village'] && (
                      <p className="mt-1 text-xs text-red-600">{errors['location.village']}</p>
                    )}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors['location.district'] ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                    />
                    {errors['location.district'] && (
                      <p className="mt-1 text-xs text-red-600">{errors['location.district']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                      {t('auth.province')}
                    </label>
                    <select
                      name="location.province"
                      value={formData.location.province}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors['location.province'] ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                    >
                      <option value="">{t('auth.select_province')}</option>
                      {PROVINCES.map(p => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    {errors['location.province'] && (
                      <p className="mt-1 text-xs text-red-600">{errors['location.province']}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setErrors({});
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-[#D2D5D9] text-[#516876] rounded-lg hover:bg-[#F4F6F9] transition-colors font-medium"
                    >
                      <FaArrowLeft className="w-4 h-4" />
                      {t('common.back')}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>{t('auth.create_account')}</>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-[#516876]">
                {t('auth.already_have_account')}{' '}
                <Link to="/login" className="text-[#6794D1] font-medium hover:underline">
                  {t('navbar.sign_in')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </DottedBackground>
    </>
  );
};

export default Register;

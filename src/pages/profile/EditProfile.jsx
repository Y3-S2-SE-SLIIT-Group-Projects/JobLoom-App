import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import DottedBackground from '../../components/DottedBackground';
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTimes,
  FaPlus,
  FaSave,
  FaCamera,
  FaFileUpload,
  FaTrash,
  FaBriefcase,
  FaCheckCircle,
} from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageUrls';

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

const SKILL_SUGGESTIONS = [
  'Communication',
  'Teamwork',
  'Leadership',
  'Problem Solving',
  'Microsoft Office',
  'Customer Service',
  'Sales',
  'Cooking',
  'Driving',
  'Construction',
  'Carpentry',
  'Plumbing',
  'Electrical',
  'Farming',
  'Tailoring',
  'Teaching',
  'Nursing',
  'Security',
  'Cleaning',
  'Accounting',
  'Computer Skills',
  'English Language',
  'Sinhala',
  'Tamil',
];

// Utility moved to utils/imageUrls.js

const EditProfile = () => {
  const navigate = useNavigate();
  const { getMyProfile, updateUserProfile, loading } = useUser();
  const fileInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: { village: '', district: '', province: '' },
    skills: [],
    experience: [],
    // Employer fields
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    industry: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [cvFiles, setCvFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyProfile();
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          location: {
            village: data.location?.village || '',
            district: data.location?.district || '',
            province: data.location?.province || '',
          },
          skills: data.skills || [],
          experience: data.experience || [],
          companyName: data.companyName || '',
          companyWebsite: data.companyWebsite || '',
          companyDescription: data.companyDescription || '',
          industry: data.industry || '',
        });
        if (data.profileImage) {
          setProfileImagePreview(getImageUrl(data.profileImage));
        } else {
          setProfileImagePreview('');
        }
      } catch (err) {
        setApiError(err.message || 'Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentRole, setCurrentRole] = useState('job_seeker');
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setCurrentRole(u.role || 'job_seeker');
    }
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({ ...prev, location: { ...prev.location, [key]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
    setSuccessMsg('');
  };

  // Skills
  const addSkill = skill => {
    const s = skill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, s] }));
    }
    setSkillInput('');
  };

  const removeSkill = skill => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // Experience
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', duration: '', description: '' }],
    }));
  };

  const updateExperience = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const removeExperience = index => {
    setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  // Profile Image
  const handleProfileImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  // CV Upload
  const handleCvChange = e => {
    const files = Array.from(e.target.files);
    setCvFiles(prev => [...prev, ...files]);
  };

  const removeCv = index => {
    setCvFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.location.province.trim()) errs['location.province'] = 'Province is required';

    if (currentRole === 'employer') {
      if (!formData.companyName.trim()) errs.companyName = 'Company name is required';
      if (!formData.industry.trim()) errs.industry = 'Industry is required';
    }
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const fd = new FormData();
      fd.append('firstName', formData.firstName);
      fd.append('lastName', formData.lastName);
      fd.append('phone', formData.phone);
      fd.append('location', JSON.stringify(formData.location));

      if (currentRole === 'job_seeker') {
        fd.append('skills', JSON.stringify(formData.skills));
        fd.append('experience', JSON.stringify(formData.experience));
        cvFiles.forEach(file => {
          fd.append('cv', file);
        });
      } else {
        fd.append('companyName', formData.companyName);
        fd.append('companyWebsite', formData.companyWebsite);
        fd.append('companyDescription', formData.companyDescription);
        fd.append('industry', formData.industry);
      }

      if (profileImageFile) {
        fd.append('profileImage', profileImageFile);
      }

      await updateUserProfile(fd);
      setSuccessMsg('Profile updated successfully!');
      setCvFiles([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setApiError(err.message || 'Failed to update profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loadingProfile) {
    return (
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-[#6794D1] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DottedBackground>
    );
  }

  return (
    <DottedBackground>
      <div className="max-w-3xl px-6 py-8 mx-auto">
        {/* Back Button */}
        <Link
          to="/profile"
          className="inline-flex items-center text-[#516876] hover:text-[#6794D1] transition-colors mb-6"
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Link>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2B373F] mb-1">Edit Profile</h1>
          <p className="text-[#516876]">
            Keep your profile up to date to attract the right opportunities
          </p>
        </div>

        {/* Alerts */}
        {apiError && (
          <div className="p-4 mb-5 border border-red-200 rounded-lg bg-red-50">
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 p-4 mb-5 border border-green-200 rounded-lg bg-green-50">
            <FaCheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
            <h2 className="text-lg font-semibold text-[#2B373F] mb-4 flex items-center gap-2">
              <FaCamera className="w-5 h-5 text-[#6794D1]" />
              {currentRole === 'employer' ? 'Company Logo / Profile Photo' : 'Profile Photo'}
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#D2D5D9]"
                    onError={e => {
                      e.currentTarget.onerror = null; // Prevent infinite loop
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-24 h-24 bg-gradient-to-br from-[#6794D1] to-[#5a83c0] rounded-full flex items-center justify-center border-4 border-[#6794D1]/20 ${profileImagePreview ? 'hidden' : 'flex'}`}
                >
                  {currentRole === 'employer' ? (
                    <FaBriefcase className="w-10 h-10 text-white" />
                  ) : (
                    <FaUser className="w-10 h-10 text-white" />
                  )}
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-[#D2D5D9] text-[#516876] rounded-lg hover:bg-[#F4F6F9] transition-colors text-sm font-medium mb-2"
                >
                  <FaCamera className="w-4 h-4" />
                  Change Photo
                </button>
                <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
            <h2 className="text-lg font-semibold text-[#2B373F] mb-4 flex items-center gap-2">
              <FaUser className="w-5 h-5 text-[#6794D1]" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                )}
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
              </div>
              {/* Email (read-only) */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                  Email address{' '}
                  <span className="text-xs font-normal text-gray-400">(cannot be changed)</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute w-4 h-4 text-gray-300 -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="email"
                    disabled
                    placeholder="Email not editable here"
                    className="w-full pl-10 pr-4 py-3 border border-[#D2D5D9] rounded-lg bg-[#F4F6F9] text-gray-400 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
              {/* Phone */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.phone ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
            <h2 className="text-lg font-semibold text-[#2B373F] mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="w-5 h-5 text-[#6794D1]" />
              Location
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                  Village / Town <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    name="location.village"
                    value={formData.location.village}
                    onChange={handleChange}
                    placeholder="e.g. Gampaha"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors['location.village'] ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                  />
                </div>
                {errors['location.village'] && (
                  <p className="mt-1 text-xs text-red-600">{errors['location.village']}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                  District <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location.district"
                  value={formData.location.district}
                  onChange={handleChange}
                  placeholder="e.g. Gampaha"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors['location.district'] ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                />
                {errors['location.district'] && (
                  <p className="mt-1 text-xs text-red-600">{errors['location.district']}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  name="location.province"
                  value={formData.location.province}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors['location.province'] ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                >
                  <option value="">Select province</option>
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
            </div>
          </div>

          {/* Employer Specific Sections */}
          {currentRole === 'employer' && (
            <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
              <h2 className="text-lg font-semibold text-[#2B373F] mb-4 flex items-center gap-2">
                <FaBriefcase className="w-5 h-5 text-[#6794D1]" />
                Company Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corporation"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.companyName ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. Technology, Healthcare"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none transition-colors ${errors.industry ? 'border-red-400 bg-red-50' : 'border-[#D2D5D9]'}`}
                  />
                  {errors.industry && (
                    <p className="mt-1 text-xs text-red-600">{errors.industry}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                    Company Website
                  </label>
                  <div className="relative">
                    <span className="absolute text-sm text-gray-400 -translate-y-1/2 left-3 top-1/2">
                      https://
                    </span>
                    <input
                      type="text"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleChange}
                      placeholder="www.example.com"
                      className="w-full pl-16 pr-4 py-3 border border-[#D2D5D9] rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B373F] mb-1.5">
                    About Company
                  </label>
                  <textarea
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Briefly describe your company..."
                    className="w-full px-4 py-3 border border-[#D2D5D9] rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Job Seeker Specific Sections */}
          {currentRole === 'job_seeker' && (
            <>
              {/* Skills */}
              <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
                <h2 className="text-lg font-semibold text-[#2B373F] mb-4 flex items-center gap-2">
                  <FaCheckCircle className="w-5 h-5 text-[#6794D1]" />
                  Skills
                </h2>

                {/* Added Skills */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills.map(skill => (
                      <span
                        key={skill}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#6794D1]/10 text-[#6794D1] text-sm font-medium rounded-full border border-[#6794D1]/20"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-500"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Skill Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 px-4 py-2.5 border border-[#D2D5D9] rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill(skillInput)}
                    className="px-4 py-2.5 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors text-sm"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Skill Suggestions */}
                <div>
                  <p className="mb-2 text-xs text-gray-400">Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_SUGGESTIONS.filter(s => !formData.skills.includes(s))
                      .slice(0, 12)
                      .map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className="px-3 py-1 text-xs text-[#516876] border border-[#D2D5D9] rounded-full hover:border-[#6794D1] hover:text-[#6794D1] transition-colors"
                        >
                          + {skill}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#2B373F] flex items-center gap-2">
                    <FaBriefcase className="w-5 h-5 text-[#6794D1]" />
                    Work Experience
                  </h2>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#6794D1] border border-[#6794D1] rounded-lg hover:bg-[#6794D1]/5 transition-colors"
                  >
                    <FaPlus className="w-3 h-3" />
                    Add Experience
                  </button>
                </div>

                {formData.experience.length === 0 ? (
                  <div className="text-center py-8 text-[#516876]">
                    <FaBriefcase className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">
                      No experience added yet. Click &quot;Add Experience&quot; to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="border border-[#D2D5D9] rounded-lg p-4 relative">
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="absolute text-gray-400 transition-colors top-3 right-3 hover:text-red-500"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 gap-4 pr-8 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-[#516876] mb-1">
                              Job Title
                            </label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={e => updateExperience(index, 'title', e.target.value)}
                              placeholder="e.g. Farm Supervisor"
                              className="w-full px-3 py-2.5 border border-[#D2D5D9] rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#516876] mb-1">
                              Company / Organization
                            </label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={e => updateExperience(index, 'company', e.target.value)}
                              placeholder="e.g. AgriCo Ltd"
                              className="w-full px-3 py-2.5 border border-[#D2D5D9] rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#516876] mb-1">
                              Duration
                            </label>
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={e => updateExperience(index, 'duration', e.target.value)}
                              placeholder="e.g. Jan 2022 - Dec 2023"
                              className="w-full px-3 py-2.5 border border-[#D2D5D9] rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#516876] mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={exp.description}
                              onChange={e => updateExperience(index, 'description', e.target.value)}
                              placeholder="Brief description of responsibilities"
                              className="w-full px-3 py-2.5 border border-[#D2D5D9] rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CV Upload */}
              <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
                <h2 className="text-lg font-semibold text-[#2B373F] mb-4 flex items-center gap-2">
                  <FaFileUpload className="w-5 h-5 text-[#6794D1]" />
                  Upload CV / Resume
                </h2>

                <div
                  onClick={() => cvInputRef.current?.click()}
                  className="border-2 border-dashed border-[#D2D5D9] rounded-xl p-8 text-center cursor-pointer hover:border-[#6794D1] hover:bg-[#6794D1]/5 transition-all"
                >
                  <FaFileUpload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-[#2B373F] font-medium mb-1">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-gray-400">
                    PDF, DOC, DOCX up to 10MB each (max 5 files)
                  </p>
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={handleCvChange}
                    className="hidden"
                  />
                </div>

                {cvFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {cvFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#F4F6F9] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
                            <FaFileUpload className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#2B373F]">{file.name}</p>
                            <p className="text-xs text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCv(index)}
                          className="text-gray-400 transition-colors hover:text-red-500"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Submit */}
          <div className="flex gap-4 pb-8">
            <Link
              to="/profile"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-[#D2D5D9] text-[#516876] rounded-lg hover:bg-[#F4F6F9] transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DottedBackground>
  );
};

export default EditProfile;

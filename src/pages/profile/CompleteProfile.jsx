import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { useTranslation } from 'react-i18next';
import DottedBackground from '../../components/DottedBackground';
import {
  FaUser,
  FaBriefcase,
  FaCheckCircle,
  FaPlus,
  FaTimes,
  FaArrowRight,
  FaArrowLeft,
  FaFileUpload,
  FaCamera,
  FaTrash,
} from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageUrls';
import { uploadFile } from '../../services/uploadApi';

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

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getMyProfile, updateUserProfile, loading } = useUser();
  const fileInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    skills: [],
    experience: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [cvFiles, setCvFiles] = useState([]);
  const [apiError, setApiError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyProfile();
        // If profile is already complete or user is employer, maybe redirect?
        // But user specifically asked for this after verification.
        setFormData({
          skills: data.skills || [],
          experience: data.experience || [],
        });
        if (data.profileImage) {
          setProfileImagePreview(getImageUrl(data.profileImage));
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const addSkill = skill => {
    const s = skill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, s] }));
    }
    setSkillInput('');
  };

  const removeSkill = skill => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

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
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleCvChange = e => {
    const files = Array.from(e.target.files);
    setCvFiles(prev => [...prev, ...files]);
  };

  const removeCv = index => {
    setCvFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) {
      if (formData.skills.length === 0) {
        setApiError(t('errors.skills_required'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (step === 2) {
      const isIncomplete = formData.experience.some(
        exp => !exp.title?.trim() || !exp.company?.trim()
      );
      if (isIncomplete) {
        setApiError(t('errors.experience_incomplete'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setApiError('');
    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (cvFiles.length === 0) {
      setApiError(t('errors.cv_required'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    try {
      setApiError('');
      const updates = {
        skills: formData.skills,
        experience: formData.experience,
      };

      if (profileImageFile) {
        const result = await uploadFile({
          file: profileImageFile,
          folder: 'jobloom/profile_images',
        });
        updates.profileImage = result.url;
      }

      const uploadedCVs = await Promise.all(
        cvFiles.map(async file => {
          const result = await uploadFile({ file, folder: 'jobloom/cvs' });
          return { name: file?.name || 'CV', url: result.url };
        })
      );
      updates.newCVs = uploadedCVs;

      await updateUserProfile(updates);
      navigate('/profile');
    } catch (err) {
      setApiError(err.message || t('errors.registration_failed'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loadingProfile) {
    return (
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DottedBackground>
    );
  }

  return (
    <DottedBackground>
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            {/* Header / Progress */}
            <div className="bg-primary p-8 text-white">
              <h1 className="text-2xl font-bold mb-2">{t('profile.complete_profile_title')}</h1>
              <p className="text-white/80 mb-6">{t('profile.complete_profile_desc')}</p>

              <div className="flex items-center gap-4">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex flex-1 items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                        step >= s
                          ? 'bg-surface text-primary border-white'
                          : 'border-white/30 text-white/30'
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`flex-1 h-1 rounded-full transition-colors ${
                          step > s ? 'bg-surface' : 'bg-surface/30'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8">
              {apiError && (
                <div className="p-4 mb-6 border border-error/30 rounded-lg bg-error/10">
                  <p className="text-sm text-error">{apiError}</p>
                </div>
              )}

              {/* Step 1: Profile Photo & Skills */}
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  {/* Photo */}
                  <div>
                    <h2 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                      <FaCamera className="w-5 h-5 text-primary" />
                      {t('profile.edit_profile_photo', 'Profile Photo')}
                    </h2>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt="Preview"
                            className="w-24 h-24 rounded-full object-cover border-4 border-border-strong"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-surface-muted rounded-full flex items-center justify-center border-4 border-border-strong border-dashed text-subtle">
                            <FaUser className="w-8 h-8" />
                          </div>
                        )}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-deep-blue transition-colors shadow-sm"
                        >
                          <FaPlus className="w-3 h-3" />
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-dark">Choose a photo</p>
                        <p className="text-xs text-muted mt-1">Make a great first impression.</p>
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

                  {/* Skills */}
                  <div>
                    <h2 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                      <FaCheckCircle className="w-5 h-5 text-primary" />
                      {t('profile.skills')}
                    </h2>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.skills.map(skill => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20 flex items-center gap-2"
                        >
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="hover:text-error">
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {formData.skills.length === 0 && (
                        <p className="text-sm text-subtle italic">{t('profile.no_skills')}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e =>
                          e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))
                        }
                        placeholder={t('profile.skill_placeholder')}
                        className="flex-1 px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                      />
                      <button
                        onClick={() => addSkill(skillInput)}
                        className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors"
                      >
                        <FaPlus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-subtle mb-2 font-medium uppercase tracking-wider">
                        Suggestions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SKILL_SUGGESTIONS.filter(s => !formData.skills.includes(s))
                          .slice(0, 8)
                          .map(skill => (
                            <button
                              key={skill}
                              onClick={() => addSkill(skill)}
                              className="px-3 py-1 text-xs text-muted border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
                            >
                              + {skill}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors font-medium shadow-md shadow-primary/20"
                    >
                      Step 2: {t('profile.experience')}
                      <FaArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Experience */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text-dark flex items-center gap-2">
                      <FaBriefcase className="w-5 h-5 text-primary" />
                      {t('profile.experience')}
                    </h2>
                    <button
                      onClick={addExperience}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors font-medium font-medium"
                    >
                      <FaPlus className="w-3 h-3" />
                      Add Work
                    </button>
                  </div>

                  {formData.experience.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-surface-muted/50">
                      <FaBriefcase className="w-12 h-12 mx-auto mb-3 text-neutral-200" />
                      <p className="text-muted font-medium">{t('profile.no_experience')}</p>
                      <p className="text-xs text-subtle mt-1">
                        If you&apos;re fresh talent, you can skip this step.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.experience.map((exp, index) => (
                        <div
                          key={index}
                          className="border border-border rounded-xl p-5 relative bg-surface transition-all hover:border-primary/50 group"
                        >
                          <button
                            onClick={() => removeExperience(index)}
                            className="absolute top-3 right-3 text-neutral-300 hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                                Job Title
                              </label>
                              <input
                                type="text"
                                value={exp.title}
                                onChange={e => updateExperience(index, 'title', e.target.value)}
                                placeholder={t('profile.job_title_placeholder')}
                                className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                                Company
                              </label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={e => updateExperience(index, 'company', e.target.value)}
                                placeholder={t('profile.company_placeholder')}
                                className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                                Duration
                              </label>
                              <input
                                type="text"
                                value={exp.duration}
                                onChange={e => updateExperience(index, 'duration', e.target.value)}
                                placeholder={t('profile.duration_placeholder')}
                                className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                                Short Description
                              </label>
                              <input
                                type="text"
                                value={exp.description}
                                onChange={e =>
                                  updateExperience(index, 'description', e.target.value)
                                }
                                placeholder={t('profile.exp_description_placeholder')}
                                className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-6 flex justify-between border-t border-surface-muted">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 px-6 py-3 text-muted font-medium hover:bg-surface-muted rounded-lg transition-colors border border-transparent"
                    >
                      <FaArrowLeft className="w-4 h-4" />
                      {t('common.back')}
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors font-medium shadow-md shadow-primary/20"
                    >
                      Step 3: {t('profile.cvs')}
                      <FaArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Resumes */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h2 className="text-lg font-semibold text-text-dark mb-2 flex items-center gap-2">
                    <FaFileUpload className="w-5 h-5 text-primary" />
                    {t('profile.step_cv', 'Upload your Resume / CV')}
                  </h2>
                  <p className="text-sm text-muted mb-6">
                    A professional CV helps employers understand your background at a glance.
                  </p>

                  <div
                    onClick={() => cvInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <FaFileUpload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-text-dark font-bold mb-1">Click to upload your CV</p>
                    <p className="text-xs text-subtle">PDF, DOC, DOCX up to 10MB</p>
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
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-muted uppercase tracking-wider">
                        Ready to upload:
                      </p>
                      {cvFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-surface-muted rounded-xl border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                              <FaFileUpload className="w-5 h-5 text-error" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-dark truncate max-w-[200px]">
                                {file.name}
                              </p>
                              <p className="text-xs text-subtle">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeCv(index)}
                            className="text-subtle hover:text-error transition-colors p-2"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-8 flex justify-between border-t border-surface-muted">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 px-6 py-3 text-muted font-medium hover:bg-surface-muted rounded-lg transition-colors"
                    >
                      <FaArrowLeft className="w-4 h-4" />
                      {t('common.back')}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2 px-10 py-3 bg-success text-white rounded-lg hover:bg-deep-blue transition-colors font-bold shadow-md shadow-success/20 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      ) : (
                        <>
                          {t('profile.complete_profile_button', 'Complete Profile')}
                          <FaCheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer switcher */}
            <div className="px-8 py-5 bg-surface-muted border-t border-border flex justify-center">
              <button
                onClick={() => navigate('/profile')}
                className="text-xs text-muted hover:text-primary transition-colors font-medium"
              >
                {t('profile.skip_completion')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DottedBackground>
  );
};

export default CompleteProfile;

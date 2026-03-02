import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import DottedBackground from '../../components/DottedBackground';
import { useTranslation } from 'react-i18next';
import AutoTranslate from '../../components/AutoTranslate';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaFileAlt,
  FaDownload,
  FaBriefcase,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaSignOutAlt,
  FaGlobe,
  FaBuilding,
  FaClock,
  FaPlus,
  FaExclamationTriangle,
  FaShieldAlt,
} from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageUrls';

const getRoleBadge = role => {
  const styles = {
    job_seeker: 'bg-[#6794D1]/20 text-[#6794D1] border-[#6794D1]',
    employer: 'bg-[#2CD2BD]/20 text-[#2CD2BD] border-[#2CD2BD]',
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return styles[role] || styles.job_seeker;
};

// Utility moved to utils/imageUrls.js

const UserProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getMyProfile, logoutUser, deleteAccount, loading } = useUser();

  const [user, setUser] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getRoleLabel = role => {
    switch (role) {
      case 'employer':
        return t('auth.role_employer');
      case 'job_seeker':
        return t('auth.role_job_seeker');
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setUser(data);
      setImgError(false);
    } catch (err) {
      setError(err.message || t('profile.error_load_profile'));
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError(t('profile.password_required'));
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      navigate('/login');
    } catch (err) {
      setDeleteError(err.message || t('profile.error_delete_account'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && !user) {
    return (
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-[#6794D1] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DottedBackground>
    );
  }

  if (error || !user) {
    return (
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md p-6 text-center bg-white border border-red-200 shadow-sm rounded-xl">
            <FaTimesCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold text-[#2B373F] mb-2">{t('profile.unable_to_load')}</h2>
            <p className="text-[#516876] mb-4">{error || t('profile.sign_in_to_view')}</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors"
            >
              {t('navbar.sign_in')}
            </Link>
          </div>
        </div>
      </DottedBackground>
    );
  }

  return (
    <DottedBackground>

      <div className="max-w-4xl px-6 py-8 mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6 mb-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.profileImage && !imgError ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#D2D5D9]"
                  onError={e => {
                    e.currentTarget.onerror = null;
                    setImgError(true);
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[#6794D1] to-[#5a83c0] rounded-full flex items-center justify-center border-4 border-[#6794D1]/20">
                  <span className="text-3xl font-bold text-white">
                    {user.role === 'employer' ? (
                      <FaBriefcase className="w-10 h-10" />
                    ) : (
                      <>
                        {user.firstName?.[0]?.toUpperCase()}
                        {user.lastName?.[0]?.toUpperCase()}
                      </>
                    )}
                  </span>
                </div>
              )}
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#2CD2BD] rounded-full flex items-center justify-center border-2 border-white">
                  <FaCheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#2B373F] mb-1">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadge(user.role)}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                    {user.role === 'employer' && user.industry && (
                      <span className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border rounded-full">
                        <AutoTranslate>{user.industry}</AutoTranslate>
                      </span>
                    )}
                    {user.isVerified ? (
                      <span className="flex items-center gap-1 text-xs text-[#2CD2BD] font-medium">
                        <FaCheckCircle className="w-3 h-3" /> {t('profile.verified')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-orange-500">
                        <FaTimesCircle className="w-3 h-3" /> {t('profile.not_verified')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#516876]">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="w-4 h-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="w-4 h-4 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                        <span>
                          {[user.location.village, user.location.district, user.location.province]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-shrink-0 gap-2">
                  <Link
                    to="/profile/edit"
                    className="flex items-center gap-2 px-4 py-2 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors text-sm font-medium"
                  >
                    <FaEdit className="w-4 h-4" />
                    {t('profile.edit_profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 border border-[#D2D5D9] text-[#516876] rounded-lg hover:bg-[#F4F6F9] transition-colors text-sm font-medium"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    {t('navbar.sign_out')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Employer: Company about */}
            {user.role === 'employer' && (
              <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6 text-center sm:text-left">
                <h2 className="text-xl font-bold text-[#2B373F] mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#6794D1]/10 rounded-lg flex items-center justify-center">
                    <FaBriefcase className="w-4 h-4 text-[#6794D1]" />
                  </div>
                  {t('profile.company_overview')}
                </h2>
                <div className="space-y-4">
                  {user.companyName && (
                    <div>
                      <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                        {t('profile.company_name')}
                      </h3>
                      <p className="text-lg font-bold text-[#2B373F]">{user.companyName}</p>
                    </div>
                  )}
                  {user.industry && (
                    <div>
                      <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                        {t('profile.industry')}
                      </h3>
                      <p className="text-[#2B373F] font-medium">
                        <AutoTranslate>{user.industry}</AutoTranslate>
                      </p>
                    </div>
                  )}
                  {user.companyWebsite && (
                    <div>
                      <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                        {t('profile.website')}
                      </h3>
                      <a
                        href={
                          user.companyWebsite.startsWith('http')
                            ? user.companyWebsite
                            : `https://${user.companyWebsite}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6794D1] hover:underline font-medium"
                      >
                        {user.companyWebsite}
                      </a>
                    </div>
                  )}
                  {user.companyDescription && (
                    <div>
                      <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                        {t('auth.company_description')}
                      </h3>
                      <p className="text-[#516876] leading-relaxed whitespace-pre-line">
                        <AutoTranslate>{user.companyDescription}</AutoTranslate>
                      </p>
                    </div>
                  )}
                  {!user.companyName && !user.industry && !user.companyDescription && (
                    <div className="py-4 text-center">
                      <p className="italic text-gray-400">{t('profile.no_company_details')}</p>
                      <Link
                        to="/profile/edit"
                        className="text-[#6794D1] text-sm font-medium mt-2 inline-block"
                      >
                        {t('profile.add_company_info')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Seeker Sections */}
            {user.role !== 'employer' && (
              <>
                {/* Skills */}
                <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
                  <h2 className="text-xl font-bold text-[#2B373F] mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#6794D1]/10 rounded-lg flex items-center justify-center">
                      <FaUser className="w-4 h-4 text-[#6794D1]" />
                    </div>
                    {t('profile.skills')}
                  </h2>
                  {user.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-[#6794D1]/10 text-[#6794D1] text-sm font-medium rounded-full border border-[#6794D1]/20"
                        >
                          <AutoTranslate>{skill}</AutoTranslate>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-gray-400">{t('profile.no_skills')}</p>
                  )}
                </div>

                {/* Experience */}
                <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
                  <h2 className="text-xl font-bold text-[#2B373F] mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#2CD2BD]/10 rounded-lg flex items-center justify-center">
                      <FaBriefcase className="w-4 h-4 text-[#2CD2BD]" />
                    </div>
                    Work Experience
                  </h2>
                  {user.experience && user.experience.length > 0 ? (
                    <div className="space-y-4">
                      {user.experience.map((exp, index) => (
                        <div
                          key={index}
                          className="flex gap-4 pb-4 border-b border-[#F4F6F9] last:border-0 last:pb-0"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-[#2CD2BD] to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <FaBriefcase className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#2B373F]">{exp.title}</h3>
                            <p className="text-[#516876] text-sm font-medium">{exp.company}</p>
                            {exp.duration && (
                              <p className="text-xs text-gray-400 mt-0.5">{exp.duration}</p>
                            )}
                            {exp.description && (
                              <p className="text-sm text-[#516876] mt-2">{exp.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-gray-400">No experience added yet.</p>
                  )}
                </div>

                {/* CVs */}
                <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
                  <h2 className="text-xl font-bold text-[#2B373F] mb-4 flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50">
                      <FaFileAlt className="w-4 h-4 text-purple-600" />
                    </div>
                    Uploaded CVs
                  </h2>
                  {user.cvs && user.cvs.length > 0 ? (
                    <div className="space-y-3">
                      {user.cvs.map((cv, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-[#F4F6F9] rounded-lg border border-[#D2D5D9] hover:border-[#6794D1] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                              <FaFileAlt className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-[#2B373F] text-sm">{cv.name}</p>
                              <div className="flex items-center gap-2">
                                {cv.isPrimary && (
                                  <span className="text-xs text-[#6794D1] font-medium">
                                    Primary
                                  </span>
                                )}
                                <p className="text-xs text-gray-400">{formatDate(cv.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                          <a
                            href={getImageUrl(cv.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#6794D1] hover:bg-[#6794D1]/10 rounded-lg transition-colors"
                          >
                            <FaDownload className="w-3.5 h-3.5" />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-gray-400">No CVs uploaded yet.</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
              <h3 className="font-semibold text-[#2B373F] mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#F4F6F9]">
                  <span className="text-sm text-[#516876]">Member since</span>
                  <span className="text-sm font-medium text-[#2B373F]">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#F4F6F9]">
                  <span className="text-sm text-[#516876]">Account status</span>
                  <span
                    className={`text-sm font-medium ${user.isActive ? 'text-[#2CD2BD]' : 'text-red-500'}`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[#516876]">Verification</span>
                  <span
                    className={`text-sm font-medium ${user.isVerified ? 'text-[#2CD2BD]' : 'text-orange-500'}`}
                  >
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
              <h3 className="font-semibold text-[#2B373F] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-3 p-3 text-[#516876] hover:bg-[#F4F6F9] rounded-lg transition-colors w-full text-left text-sm"
                >
                  <FaEdit className="w-4 h-4 text-[#6794D1]" />
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 text-[#516876] hover:bg-[#F4F6F9] rounded-lg transition-colors w-full text-left text-sm"
                >
                  <FaSignOutAlt className="w-4 h-4 text-[#516876]" />
                  Sign Out
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center w-full gap-3 p-3 text-sm text-left text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <FaTrash className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                <FaTrash className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#2B373F]">Delete Account</h3>
            </div>
            <p className="text-[#516876] mb-4">
              This action is <strong>permanent</strong> and cannot be undone. Enter your password to
              confirm.
            </p>
            {deleteError && (
              <div className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-700">{deleteError}</p>
              </div>
            )}
            <input
              type="password"
              value={deletePassword}
              onChange={e => {
                setDeletePassword(e.target.value);
                setDeleteError('');
              }}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-[#D2D5D9] rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="px-4 py-2 text-[#516876] hover:bg-[#F4F6F9] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DottedBackground>
  );
};

export default UserProfile;

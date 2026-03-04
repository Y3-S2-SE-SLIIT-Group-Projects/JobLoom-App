import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useJobs } from '../../../hooks/useJobs';
import parse from 'html-react-parser';

import DottedBackground from '../../../components/DottedBackground';
import {
  FaArrowLeft,
  FaBriefcase,
  FaMapMarkerAlt,
  FaDollarSign,
  FaUsers,
  FaGlobe,
  FaEdit,
  FaTimesCircle,
  FaCheckCircle,
  FaTrash,
  FaFileAlt,
} from 'react-icons/fa';
import { getImageUrl } from '../../../utils/imageUrls';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchJobById,
    closeJob,
    markJobAsFilled,
    deleteJob,
    loading,
    error: contextError,
  } = useJobs();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isPublicView = searchParams.get('public') === 'true';

  const loadJob = async () => {
    if (!id) {
      setError('Job ID is required');
      return;
    }
    try {
      const data = await fetchJobById(id);
      setJob(data);
    } catch (err) {
      setError(err.message || 'Failed to load job details');
      console.error('Error loading job:', err);
    }
  };

  useEffect(() => {
    if (id) {
      loadJob();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAction = action => {
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    try {
      if (actionType === 'close') {
        await closeJob(job._id);
      } else if (actionType === 'filled') {
        await markJobAsFilled(job._id);
      } else if (actionType === 'delete') {
        await deleteJob(job._id);
      }
      setShowConfirmDialog(false);
      navigate('/employer/my-jobs');
    } catch (err) {
      setError(err.message || 'Action failed');
      setShowConfirmDialog(false);
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatSalary = (amount, type, currency = 'LKR') => {
    // Handle optional salary fields
    if (!amount || amount === undefined || amount === null) {
      return 'Salary not specified';
    }
    if (!type || type === undefined || type === null) {
      return `${currency} ${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()} / ${type}`;
  };

  const employerCompanyName =
    job?.employer?.companyName ||
    job?.employerId?.companyName ||
    [job?.employer?.firstName, job?.employer?.lastName].filter(Boolean).join(' ').trim() ||
    [job?.employerId?.firstName, job?.employerId?.lastName].filter(Boolean).join(' ').trim() ||
    job?.employer?.email ||
    job?.employerId?.email ||
    'Unknown employer';

  const locationText =
    job?.location?.fullAddress ||
    [job?.location?.village, job?.location?.district, job?.location?.province]
      .filter(Boolean)
      .join(', ') ||
    'Location not specified';

  const openLocationInGoogleMaps = () => {
    if (!job?.location) return;

    const coordinates = job.location?.coordinates?.coordinates;
    let mapsUrl = '';

    if (Array.isArray(coordinates) && coordinates.length === 2) {
      const [lng, lat] = coordinates;
      mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    } else if (locationText && locationText !== 'Location not specified') {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`;
    }

    if (mapsUrl) {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || contextError || !job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || contextError || 'Job not found'}</p>
          <Link
            to="/employer/my-jobs"
            className="inline-block px-6 py-2 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors"
          >
            Back to My Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DottedBackground>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          to={isPublicView ? '/jobs' : '/employer/dashboard'}
          className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <FaArrowLeft className="w-5 h-5 mr-2" />
          {isPublicView ? 'Back to Jobs' : 'Back to Dashboard'}
        </Link>

        {/* Company Logo/Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
              {job.employer?.profileImage ? (
                <img
                  src={getImageUrl(job.employer.profileImage)}
                  alt="logo"
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              <FaBriefcase
                className={`w-8 h-8 text-gray-400 ${job.employer?.profileImage ? 'hidden' : 'block'}`}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{job.title}</h1>
              <p className="text-lg text-gray-600">{job.jobRole || 'Job Position'}</p>
              <p className="text-sm text-gray-500 mt-1">{employerCompanyName}</p>
            </div>
          </div>
        </div>

        {/* Job Details Bar */}
        <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-700">
            <FaBriefcase className="w-5 h-5 text-gray-400" />
            <span className="capitalize">{job.employmentType || 'Full-time'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FaGlobe className="w-5 h-5 text-gray-400" />
            <button
              type="button"
              onClick={openLocationInGoogleMaps}
              className="text-left hover:text-[#6794D1] hover:underline transition-colors"
              title="Open location in Google Maps"
            >
              {locationText}
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FaDollarSign className="w-5 h-5 text-gray-400" />
            <span className="font-semibold">
              {formatSalary(job.salaryAmount, job.salaryType, job.currency)}
            </span>
          </div>
        </div>

        {/* Additional Job Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">JOB INFORMATION</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Employer</p>
              <p className="font-medium text-gray-900">{employerCompanyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="font-medium text-gray-900 capitalize">{job.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Employment Type</p>
              <p className="font-medium text-gray-900 capitalize">
                {job.employmentType || 'Full-time'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Positions Available</p>
              <p className="font-medium text-gray-900">
                {job.positions} position{job.positions > 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Experience Level</p>
              <p className="font-medium text-gray-900 capitalize">
                {job.experienceRequired || 'None'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Start Date</p>
              <p className="font-medium text-gray-900">{formatDate(job.startDate)}</p>
            </div>
            {job.endDate && (
              <div>
                <p className="text-sm text-gray-600 mb-1">End Date</p>
                <p className="font-medium text-gray-900">{formatDate(job.endDate)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaFileAlt className="w-5 h-5 text-gray-500" />
            JOB DESCRIPTION
          </h2>
          <div className="border-t border-gray-100 pt-4">
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {job.description ? parse(job.description) : 'No description provided.'}
            </div>
          </div>
        </div>

        {/* Requirements */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">SKILLS</h2>
            <ul className="space-y-2">
              {job.skillsRequired.map((skill, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-[#2CD2BD] mt-1">•</span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons (only visible to employers) */}
        {!isPublicView && (
          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate(`/employer/jobs/${job._id}/edit`)}
              className="px-6 py-3 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors font-medium flex items-center gap-2"
            >
              <FaEdit className="w-5 h-5" />
              Edit Job
            </button>
            <button
              onClick={() => handleAction('close')}
              disabled={job.status !== 'open'}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              <FaTimesCircle className="w-5 h-5" />
              Close Job
            </button>
            <button
              onClick={() => handleAction('filled')}
              disabled={job.status !== 'open'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              <FaCheckCircle className="w-5 h-5" />
              Mark as Filled
            </button>
            <button
              onClick={() => handleAction('delete')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ml-auto"
            >
              <FaTrash className="w-5 h-5" />
              Delete Job
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {actionType} this job?
              {actionType === 'delete' && ' This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#6794D1] hover:bg-[#5a83c0]'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </DottedBackground>
  );
};

export default JobDetails;

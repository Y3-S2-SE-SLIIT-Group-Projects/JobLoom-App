import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '../../../hooks/useUser';
import {
  loadApplicationById,
  loadJobStats,
  updateApplicationStatus,
  scheduleInterview,
  selectCurrentApplication,
  selectApplicationLoading,
  selectApplicationError,
} from '../../../store/slices/applicationSlice';
import ApplicationReviewsPanel from '../../../components/reviews/ApplicationReviewsPanel';

import DottedBackground from '../../../components/DottedBackground';
import AlertBanner from '../../../components/ui/AlertBanner';
import Spinner from '../../../components/ui/Spinner';
import CalendlyPopupButton from '../../../components/calendly/CalendlyPopupButton';
import {
  FaArrowLeft,
  FaEnvelope,
  FaFileAlt,
  FaCalendarAlt,
  FaLink,
  FaSave,
  FaPaperPlane,
  FaDownload,
} from 'react-icons/fa';
import { getImageUrl } from '../../../utils/imageUrls';
import { getSignedDownloadUrl } from '../../../services/uploadApi';

// ── Status transition rules (match backend) ─────────────────────────────────────

const STATUS_TRANSITIONS = {
  pending: ['reviewed', 'shortlisted', 'accepted', 'rejected'],
  reviewed: ['shortlisted', 'accepted', 'rejected'],
  shortlisted: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
  withdrawn: [],
};

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
  shortlisted: 'bg-purple-100 text-purple-700 border-purple-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  withdrawn: 'bg-gray-100 text-gray-500 border-gray-200',
};

const isCloudinaryUrl = value =>
  typeof value === 'string' &&
  (value.includes('res.cloudinary.com/') || value.includes('res.cloudinary.com\\'));

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentUser } = useUser();

  const application = useSelector(selectCurrentApplication);
  const isLoading = useSelector(selectApplicationLoading('currentApplication'));
  const statusLoading = useSelector(selectApplicationLoading('updateStatus'));
  const scheduleLoading = useSelector(selectApplicationLoading('scheduleInterview'));
  const error = useSelector(selectApplicationError('currentApplication'));

  const [employerNotes, setEmployerNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [interviewDateInput, setInterviewDateInput] = useState('');
  const [statusError, setStatusError] = useState('');
  const [scheduleError, setScheduleError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  useEffect(() => {
    if (id) dispatch(loadApplicationById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!application) return;
    const notes = application.employerNotes || '';
    const status = application.status;
    let interviewVal;
    if (application.interviewDate) {
      interviewVal = new Date(application.interviewDate).toISOString().slice(0, 16);
    } else {
      const min = new Date();
      min.setMinutes(min.getMinutes() + 1);
      interviewVal = min.toISOString().slice(0, 16);
    }
    queueMicrotask(() => {
      setEmployerNotes(notes);
      setSelectedStatus(status);
      setInterviewDateInput(interviewVal);
    });
  }, [application]);

  const allowedNextStatuses = STATUS_TRANSITIONS[application?.status] ?? [];
  const canChangeStatus = allowedNextStatuses.length > 0;
  const isFinalStatus = ['accepted', 'rejected', 'withdrawn'].includes(application?.status);
  const canScheduleInterview = !isFinalStatus;

  const getApplicantName = () => {
    const s = application?.jobSeekerId;
    if (!s) return 'Unknown';
    if (typeof s === 'string') return s;
    return [s.firstName, s.lastName].filter(Boolean).join(' ') || s.email || 'Unknown';
  };

  const getApplicantEmail = () => {
    const s = application?.jobSeekerId;
    if (!s || typeof s === 'string') return '';
    return s.email || '';
  };

  const getJobTitle = () => {
    const j = application?.jobId;
    if (!j) return '';
    return typeof j === 'object' ? j.title : '';
  };

  const getJobId = () => {
    const j = application?.jobId;
    if (!j) return null;
    return typeof j === 'object' ? j._id : j;
  };

  const getEmployerId = () => {
    const e = application?.employerId;
    if (!e) return null;
    return typeof e === 'object' ? e._id : e;
  };

  const getJobSeekerId = () => {
    const s = application?.jobSeekerId;
    if (!s) return null;
    return typeof s === 'object' ? s._id : s;
  };

  const getEmployerName = () => {
    const e = application?.employerId;
    if (!e) return 'Employer';
    if (typeof e === 'string') return 'Employer';
    return [e.firstName, e.lastName].filter(Boolean).join(' ') || e.email || 'Employer';
  };

  const formatDate = dateString => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateStatus = async e => {
    e.preventDefault();
    setStatusError('');
    setStatusSuccess('');
    if (!application || !selectedStatus) return;
    if (selectedStatus === application.status) {
      setStatusError('Select a different status to update.');
      return;
    }
    if (!allowedNextStatuses.includes(selectedStatus)) {
      setStatusError(`Cannot transition from ${application.status} to ${selectedStatus}.`);
      return;
    }
    try {
      await dispatch(
        updateApplicationStatus({
          id: application._id,
          data: { status: selectedStatus, employerNotes: employerNotes.trim() || undefined },
        })
      ).unwrap();
      setStatusSuccess('Status updated successfully.');
      const jid = getJobId();
      if (jid) dispatch(loadJobStats(jid));
    } catch (err) {
      setStatusError(err.message || 'Failed to update status.');
    }
  };

  const handleScheduleInterview = async e => {
    e.preventDefault();
    setScheduleError('');
    if (!application || !interviewDateInput) return;
    const dt = new Date(interviewDateInput);
    if (dt <= new Date()) {
      setScheduleError('Interview date must be in the future.');
      return;
    }
    try {
      await dispatch(
        scheduleInterview({
          id: application._id,
          data: { interviewDate: dt.toISOString() },
        })
      ).unwrap();
    } catch (err) {
      setScheduleError(err.message || 'Failed to schedule interview.');
    }
  };

  const jobId = getJobId();
  const backHref = jobId ? `/employer/applications/job/${jobId}` : '/employer/applications';

  if (isLoading || !application) {
    return (
      <DottedBackground>
        <div className="min-h-screen flex items-center justify-center">
          {isLoading ? (
            <Spinner size="lg" />
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Application not found.</p>
              <Link
                to="/employer/applications"
                className="text-[#6794D1] hover:underline font-medium"
              >
                Back to Applications
              </Link>
            </div>
          )}
        </div>
      </DottedBackground>
    );
  }

  return (
    <DottedBackground>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            to={backHref}
            className="inline-flex items-center text-gray-500 hover:text-[#6794D1] transition-colors text-sm mb-4"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{getApplicantName()}</h1>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${STATUS_BADGE[application.status] || 'bg-gray-100 text-gray-700'}`}
            >
              {application.status}
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            Application for <span className="font-medium text-gray-700">{getJobTitle()}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <AlertBanner type="error" message={error} />

        {/* Applicant info */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Applicant</h2>
          <div className="space-y-3">
            {getApplicantEmail() && (
              <div className="flex items-center gap-2 text-gray-700">
                <FaEnvelope className="w-4 h-4 text-gray-400" />
                <a
                  href={`mailto:${getApplicantEmail()}`}
                  className="text-[#6794D1] hover:underline"
                >
                  {getApplicantEmail()}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-700">
              <FaCalendarAlt className="w-4 h-4 text-gray-400" />
              <span>Applied {formatDate(application.appliedAt || application.createdAt)}</span>
            </div>
            {application.jobSeekerId?.skills?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {application.jobSeekerId.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Cover letter */}
        {application.coverLetter && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Cover Letter</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
          </section>
        )}

        {/* Resume / CV */}
        {application.resumeUrl &&
          (() => {
            const isExternal = application.resumeUrl.startsWith('http');
            const needsSigned = isExternal && isCloudinaryUrl(application.resumeUrl);
            const resolvedUrl = isExternal
              ? application.resumeUrl
              : getImageUrl(application.resumeUrl);
            return (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Resume</h2>
                <a
                  href={needsSigned ? '#' : resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async e => {
                    if (!needsSigned) return;
                    e.preventDefault();
                    const signedUrl = await getSignedDownloadUrl({ url: application.resumeUrl });
                    if (signedUrl) window.open(signedUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="inline-flex items-center gap-2 text-[#6794D1] hover:underline font-medium"
                >
                  {needsSigned ? (
                    <FaDownload className="w-4 h-4" />
                  ) : isExternal ? (
                    <FaLink className="w-4 h-4" />
                  ) : (
                    <FaDownload className="w-4 h-4" />
                  )}
                  {needsSigned ? 'Download CV' : isExternal ? 'View resume' : 'Download CV'}
                </a>
              </section>
            );
          })()}

        {/* Status update & employer notes */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Status & Notes</h2>

          <AlertBanner type="error" message={statusError} />
          <AlertBanner type="success" message={statusSuccess} />

          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employer notes (internal)
              </label>
              <textarea
                value={employerNotes}
                onChange={e => setEmployerNotes(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Private notes about this applicant…"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none text-sm resize-none"
              />
              <p className="mt-1 text-xs text-gray-400">{employerNotes.length}/500</p>
            </div>

            {canChangeStatus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update status
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6794D1] outline-none text-sm"
                  >
                    <option value={application.status}>— Keep current —</option>
                    {allowedNextStatuses.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={statusLoading || selectedStatus === application.status}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {statusLoading ? <Spinner size="sm" /> : <FaSave className="w-4 h-4" />}
                    Update Status
                  </button>
                </div>
              </div>
            )}
          </form>
        </section>

        {/* Schedule interview */}
        {canScheduleInterview && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Schedule Interview</h2>

            <AlertBanner type="error" message={scheduleError} />

            {/* Calendly popup (shown when employer has Calendly connected) */}
            <div className="mb-5">
              <CalendlyPopupButton
                inviteeName={getApplicantName()}
                inviteeEmail={getApplicantEmail()}
              />
            </div>

            {/* Manual fallback scheduler */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">
                Or set a date manually
              </p>
              <form onSubmit={handleScheduleInterview} className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview date & time
                  </label>
                  <input
                    type="datetime-local"
                    value={interviewDateInput}
                    onChange={e => setInterviewDateInput(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6794D1] outline-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={scheduleLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2CD2BD] text-white rounded-lg hover:bg-[#25b8a5] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scheduleLoading ? <Spinner size="sm" /> : <FaPaperPlane className="w-4 h-4" />}
                  Schedule
                </button>
              </form>
            </div>

            {application.interviewDate && (
              <p className="mt-3 text-sm text-gray-600">
                Currently scheduled: {formatDate(application.interviewDate)}
              </p>
            )}
          </section>
        )}

        {/* Reviews panel (when accepted) */}
        {application.status === 'accepted' && currentUser && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ApplicationReviewsPanel
              jobId={getJobId()}
              employerId={getEmployerId()}
              jobSeekerId={getJobSeekerId()}
              currentUserId={currentUser._id}
              applicationStatus={application.status}
              employerName={getEmployerName()}
              seekerName={getApplicantName()}
              jobTitle={getJobTitle()}
            />
          </section>
        )}
      </div>
    </DottedBackground>
  );
};

export default ApplicationDetailPage;

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '../../hooks/useUser';
import {
  loadApplicationById,
  withdrawApplication,
  updateApplicationNotes,
  selectCurrentApplication,
  selectApplicationLoading,
  selectApplicationError,
} from '../../store/slices/applicationSlice';
import ApplicationReviewsPanel from '../../components/reviews/ApplicationReviewsPanel';
import DottedBackground from '../../components/DottedBackground';
import AlertBanner from '../../components/ui/AlertBanner';
import Spinner from '../../components/ui/Spinner';
import { STATUS_BADGE_COLORS, WITHDRAWABLE_STATUSES } from '../../constants/applicationStatus';
import {
  FaArrowLeft,
  FaBriefcase,
  FaCalendarAlt,
  FaClock,
  FaDownload,
  FaLink,
  FaStickyNote,
  FaSave,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaVideo,
  FaEnvelope,
  FaPhone,
  FaBuilding,
} from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageUrls';
import { getSignedDownloadUrl } from '../../services/uploadApi';
import { useTranslation } from 'react-i18next';

// ── Status timeline dot colors ──────────────────────────────────────────────────

const TIMELINE_DOT_COLORS = {
  pending: 'bg-warning',
  accepted: 'bg-success',
  rejected: 'bg-error',
  withdrawn: 'bg-neutral-500',
};

// ── Helpers ─────────────────────────────────────────────────────────────────────

const formatDate = dateString => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateTime = dateString => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** YYYYMMDDTHHmmssZ for Google Calendar `dates` param */
const formatGCalDate = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

const isCloudinaryUrl = value =>
  typeof value === 'string' &&
  (value.includes('res.cloudinary.com/') || value.includes('res.cloudinary.com\\'));

const SeekerApplicationDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const application = useSelector(selectCurrentApplication);
  const isLoading = useSelector(selectApplicationLoading('currentApplication'));
  const withdrawLoading = useSelector(selectApplicationLoading('withdraw'));
  const notesLoading = useSelector(selectApplicationLoading('updateNotes'));
  const error = useSelector(selectApplicationError('currentApplication'));
  const withdrawError = useSelector(selectApplicationError('withdraw'));
  const notesError = useSelector(selectApplicationError('updateNotes'));

  const [personalNotes, setPersonalNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [lastLoadedId, setLastLoadedId] = useState(null);

  useEffect(() => {
    if (id) dispatch(loadApplicationById(id));
  }, [dispatch, id]);

  // Sync personalNotes when a new application loads — derived state pattern
  const appId = application?._id;
  if (appId && appId !== lastLoadedId) {
    setLastLoadedId(appId);
    setPersonalNotes(application.notes || '');
  }

  // ── Derived values ────────────────────────────────────────────────────────────

  const getJobTitle = () => {
    const j = application?.jobId;
    if (!j) return 'Unknown Job';
    return typeof j === 'object' ? j.title || 'Unknown Job' : 'Unknown Job';
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
    return (
      e.companyName || [e.firstName, e.lastName].filter(Boolean).join(' ') || e.email || 'Employer'
    );
  };

  const getCompanyDisplay = () => {
    const e = application?.employerId;
    if (!e || typeof e === 'string') return getEmployerName();
    const cn = e.companyName?.trim();
    if (cn) return cn;
    return [e.firstName, e.lastName].filter(Boolean).join(' ') || e.email || 'Employer';
  };

  const getEmployerContactPerson = () => {
    const e = application?.employerId;
    if (!e || typeof e === 'string') return '';
    return [e.firstName, e.lastName].filter(Boolean).join(' ') || '';
  };

  const getSeekerName = () => {
    if (!currentUser) return 'Applicant';
    return (
      [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ') ||
      currentUser.email ||
      'Applicant'
    );
  };

  const getJobCategory = () => {
    const j = application?.jobId;
    if (!j || typeof j !== 'object') return null;
    return j.category || j.jobRole || null;
  };

  const getEmploymentType = () => {
    const j = application?.jobId;
    if (!j || typeof j !== 'object') return null;
    return j.employmentType || null;
  };

  const getJobLocation = () => {
    const j = application?.jobId;
    if (!j || typeof j !== 'object') return null;
    const loc = j.location;
    if (!loc) return null;
    return (
      loc.fullAddress ||
      [loc.village, loc.district, loc.province].filter(Boolean).join(', ') ||
      null
    );
  };

  const canWithdraw = application && WITHDRAWABLE_STATUSES.includes(application.status);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleSaveNotes = async () => {
    if (!application) return;
    setNotesSaved(false);
    try {
      await dispatch(
        updateApplicationNotes({
          id: application._id,
          data: { notes: personalNotes.trim() },
        })
      ).unwrap();
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch {
      // error shown via Redux state
    }
  };

  const handleWithdraw = async () => {
    if (!application) return;
    try {
      await dispatch(
        withdrawApplication({
          id: application._id,
          data: { withdrawalReason: withdrawalReason.trim() || undefined },
        })
      ).unwrap();
      setWithdrawSuccess(true);
      setShowWithdrawConfirm(false);
      setTimeout(() => navigate('/my-applications'), 1500);
    } catch {
      // error shown via Redux state
    }
  };

  const openInterviewGoogleCalendar = () => {
    if (!application?.interviewDate) return;
    const start = new Date(application.interviewDate);
    const end = new Date(start.getTime() + (application.interviewDuration || 30) * 60_000);
    const title = encodeURIComponent(`Interview — ${getJobTitle()}`);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const details = encodeURIComponent(
      application.interviewType === 'virtual'
        ? `Join: ${origin}/interview/${application._id}`
        : `Location: ${application.interviewLocation || 'TBD'}`
    );
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGCalDate(start)}/${formatGCalDate(end)}&details=${details}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ── Loading / not found states ────────────────────────────────────────────────

  if (isLoading || !application) {
    return (
      <DottedBackground>
        <div className="min-h-screen flex items-center justify-center">
          {isLoading ? (
            <Spinner size="lg" />
          ) : (
            <div className="text-center">
              <p className="text-muted mb-4">Application not found.</p>
              <Link to="/my-applications" className="text-primary hover:underline font-medium">
                Back to My Applications
              </Link>
            </div>
          )}
        </div>
      </DottedBackground>
    );
  }

  const jobId = getJobId();
  const statusHistory = application.statusHistory || [];

  return (
    <DottedBackground>
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link
            to="/my-applications"
            className="inline-flex items-center text-subtle hover:text-primary transition-colors text-sm mb-4"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to My Applications
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-text-dark">{getJobTitle()}</h1>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${
                STATUS_BADGE_COLORS[application.status] || 'bg-neutral-100 text-muted border-border'
              }`}
            >
              {application.status}
            </span>
          </div>
          <p className="text-subtle mt-1">
            <span className="inline-flex items-center gap-1.5">
              <FaBuilding className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden />
              <span className="font-medium text-muted">{getCompanyDisplay()}</span>
            </span>
            {getEmployerContactPerson() && application?.employerId?.companyName?.trim() && (
              <span className="block text-xs mt-1 pl-5 text-subtle">
                Contact: {getEmployerContactPerson()}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <AlertBanner type="error" message={error} />

        {currentUser && (currentUser.email || currentUser.phone) && (
          <section className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-bold text-text-dark mb-3">
              Your contact on this application
            </h2>
            <p className="text-sm text-subtle mb-3">
              Employers see these details with your application. Update them in your profile if
              needed.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 text-sm text-muted">
              {currentUser.email && (
                <span className="inline-flex items-center gap-2">
                  <FaEnvelope className="w-4 h-4 text-subtle shrink-0" aria-hidden />
                  <a href={`mailto:${currentUser.email}`} className="text-primary hover:underline">
                    {currentUser.email}
                  </a>
                </span>
              )}
              {currentUser.phone && (
                <span className="inline-flex items-center gap-2">
                  <FaPhone className="w-4 h-4 text-subtle shrink-0" aria-hidden />
                  {currentUser.phone}
                </span>
              )}
            </div>
          </section>
        )}

        {withdrawSuccess && (
          <AlertBanner
            type="success"
            message="Application withdrawn successfully. Redirecting..."
          />
        )}

        {/* ── Job Info Card ──────────────────────────────────────────────────── */}
        <section className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
            <FaBriefcase className="w-4 h-4 text-primary" />
            Job Details
          </h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {getJobCategory() && (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium text-muted">Category:</span> {getJobCategory()}
                </span>
              )}
              {getEmploymentType() && (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium text-muted">Type:</span>{' '}
                  <span className="capitalize">{getEmploymentType()}</span>
                </span>
              )}
              {getJobLocation() && (
                <span className="flex items-center gap-1.5">
                  <FaMapMarkerAlt className="w-3.5 h-3.5 text-subtle" />
                  {getJobLocation()}
                </span>
              )}
            </div>
            {jobId && (
              <Link
                to={`/jobs/${jobId}`}
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
              >
                <FaExternalLinkAlt className="w-3.5 h-3.5" />
                View Full Job Posting
              </Link>
            )}
          </div>
        </section>

        {/* ── Employer & company ─────────────────────────────────────────────── */}
        {application?.employerId && typeof application.employerId === 'object' && (
          <section className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-bold text-text-dark mb-3 flex items-center gap-2">
              <FaBuilding className="w-4 h-4 text-primary" aria-hidden />
              Company you applied to
            </h2>
            <p className="text-base font-semibold text-text-dark mb-1">{getCompanyDisplay()}</p>
            {getEmployerContactPerson() && application.employerId.companyName?.trim() && (
              <p className="text-sm text-muted mb-3">Contact: {getEmployerContactPerson()}</p>
            )}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 text-sm text-muted mt-2">
              {application.employerId.email && (
                <span className="inline-flex items-center gap-2">
                  <FaEnvelope className="w-4 h-4 text-subtle shrink-0" aria-hidden />
                  <a
                    href={`mailto:${application.employerId.email}`}
                    className="text-primary hover:underline"
                  >
                    {application.employerId.email}
                  </a>
                </span>
              )}
              {application.employerId.phone && (
                <span className="inline-flex items-center gap-2">
                  <FaPhone className="w-4 h-4 text-subtle shrink-0" aria-hidden />
                  {application.employerId.phone}
                </span>
              )}
            </div>
          </section>
        )}

        {/* ── Your Application ───────────────────────────────────────────────── */}
        <section className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-bold text-text-dark mb-4">Your Application</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <FaCalendarAlt className="w-3.5 h-3.5 text-subtle" />
              Applied {formatDate(application.appliedAt || application.createdAt)}
            </div>

            {application.coverLetter && (
              <div>
                <p className="text-sm font-medium text-muted mb-2">Cover Letter</p>
                <div className="bg-surface-muted rounded-lg p-4 text-sm text-muted whitespace-pre-wrap border border-neutral-100">
                  {application.coverLetter}
                </div>
              </div>
            )}

            {application.resumeUrl &&
              (() => {
                const isExternal = application.resumeUrl.startsWith('http');
                const needsSigned = isExternal && isCloudinaryUrl(application.resumeUrl);
                const resolvedUrl = isExternal
                  ? application.resumeUrl
                  : getImageUrl(application.resumeUrl);
                return (
                  <div>
                    <p className="text-sm font-medium text-muted mb-2">{t('common.resume')}</p>
                    <a
                      href={needsSigned ? '#' : resolvedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm"
                      onClick={async e => {
                        if (!needsSigned) return;
                        e.preventDefault();
                        const signedUrl = await getSignedDownloadUrl({
                          url: application.resumeUrl,
                        });
                        if (signedUrl) window.open(signedUrl, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      {needsSigned ? (
                        <FaDownload className="w-4 h-4" />
                      ) : isExternal ? (
                        <FaLink className="w-4 h-4" />
                      ) : (
                        <FaDownload className="w-4 h-4" />
                      )}
                      {needsSigned
                        ? t('common.download_cv')
                        : isExternal
                          ? t('common.view_resume')
                          : t('common.download_cv')}
                    </a>
                  </div>
                );
              })()}
          </div>
        </section>

        {/* ── Status Timeline ────────────────────────────────────────────────── */}
        {statusHistory.length > 0 && (
          <section className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-bold text-text-dark mb-4">
              {t('applications.status_timeline')}
            </h2>
            <div className="relative">
              {statusHistory.map((entry, idx) => {
                const isLast = idx === statusHistory.length - 1;
                const dotColor = TIMELINE_DOT_COLORS[entry.status] || 'bg-neutral-500';
                return (
                  <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                    {/* Dot + connector line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3.5 h-3.5 rounded-full shrink-0 ${dotColor} ${
                          isLast ? 'ring-4 ring-opacity-20 ring-current' : ''
                        }`}
                        style={
                          isLast
                            ? {
                                ringColor: TIMELINE_DOT_COLORS[entry.status] || 'bg-neutral-500',
                              }
                            : undefined
                        }
                      />
                      {!isLast && <div className="w-0.5 flex-1 bg-neutral-200 mt-1" />}
                    </div>
                    {/* Content */}
                    <div className="-mt-0.5">
                      <p
                        className={`text-sm font-semibold capitalize ${
                          isLast ? 'text-text-dark' : 'text-muted'
                        }`}
                      >
                        {entry.status}
                      </p>
                      <p className="text-xs text-subtle mt-0.5">
                        {formatDateTime(entry.changedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Interview Details ──────────────────────────────────────────────── */}
        {application.interviewDate && (
          <section className="p-6 border shadow-sm bg-surface rounded-xl border-purple-200">
            <h2 className="flex items-center gap-2 mb-4 text-lg font-bold text-text-dark">
              {application.interviewType === 'virtual' ? (
                <FaVideo className="w-4 h-4 text-purple-500 shrink-0" aria-hidden />
              ) : application.interviewType === 'in_person' ? (
                <FaMapMarkerAlt className="w-4 h-4 text-purple-500 shrink-0" aria-hidden />
              ) : (
                <FaCalendarAlt className="w-4 h-4 text-purple-500 shrink-0" aria-hidden />
              )}
              {application.interviewType === 'virtual'
                ? t('applications.interview_virtual_title')
                : application.interviewType === 'in_person'
                  ? t('applications.interview_in_person_title')
                  : t('applications.interview_scheduled')}
            </h2>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted">
                <FaCalendarAlt className="w-3.5 h-3.5 shrink-0 text-subtle" aria-hidden />
                <span className="font-medium">{formatDateTime(application.interviewDate)}</span>
              </div>

              {application.interviewDuration != null && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <FaClock className="w-3.5 h-3.5 shrink-0 text-subtle" aria-hidden />
                  <span>
                    {t('applications.interview_duration_minutes', {
                      count: application.interviewDuration,
                    })}
                  </span>
                </div>
              )}

              {application.interviewType === 'in_person' && application.interviewLocation && (
                <>
                  <div className="flex items-start gap-2 text-sm text-muted">
                    <FaMapMarkerAlt
                      className="w-3.5 h-3.5 mt-0.5 shrink-0 text-subtle"
                      aria-hidden
                    />
                    <span>{application.interviewLocation}</span>
                  </div>
                  {application.interviewLocationNotes && (
                    <div className="flex items-start gap-2 text-sm text-subtle">
                      <FaStickyNote
                        className="w-3.5 h-3.5 mt-0.5 shrink-0 text-subtle"
                        aria-hidden
                      />
                      <span>{application.interviewLocationNotes}</span>
                    </div>
                  )}
                </>
              )}

              <p className="text-sm text-subtle">
                {t('applications.interview_scheduled_by', { name: getEmployerName() })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-purple-100">
              {application.interviewType === 'virtual' && (
                <Link
                  to={`/interview/${application._id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-deep-blue"
                >
                  <FaVideo className="w-4 h-4" aria-hidden />
                  {t('applications.interview_join_button')}
                </Link>
              )}

              {application.interviewType === 'in_person' && application.interviewLocation && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(application.interviewLocation)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-border text-muted hover:bg-surface-muted"
                >
                  <FaMapMarkerAlt className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  {t('applications.interview_get_directions')}
                </a>
              )}

              <button
                type="button"
                onClick={openInterviewGoogleCalendar}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm transition-colors text-primary hover:underline"
              >
                <FaCalendarAlt className="w-3.5 h-3.5 shrink-0" aria-hidden />
                {t('applications.interview_add_to_calendar')}
              </button>
            </div>
          </section>
        )}

        {/* ── Personal Notes ─────────────────────────────────────────────────── */}
        <section className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
            <FaStickyNote className="w-4 h-4 text-primary" />
            My Notes
            <span className="text-xs font-normal text-subtle">(private — only visible to you)</span>
          </h2>

          <AlertBanner type="error" message={notesError} />
          {notesSaved && (
            <div className="mb-3">
              <AlertBanner type="success" message="Notes saved successfully." />
            </div>
          )}

          <textarea
            value={personalNotes}
            onChange={e => setPersonalNotes(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Keep personal notes about this application..."
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-subtle">{personalNotes.length}/500</p>
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={notesLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {notesLoading ? <Spinner size="sm" /> : <FaSave className="w-4 h-4" />}
              Save Notes
            </button>
          </div>
        </section>

        {/* ── Withdraw Section ───────────────────────────────────────────────── */}
        {canWithdraw && !withdrawSuccess && (
          <section className="bg-surface rounded-xl shadow-sm border border-error/30 p-6">
            <h2 className="text-lg font-bold text-text-dark mb-2 flex items-center gap-2">
              <FaExclamationTriangle className="w-4 h-4 text-error" />
              Withdraw Application
            </h2>
            <p className="text-sm text-subtle mb-4">
              Once withdrawn, this action cannot be undone. The employer will be notified.
            </p>

            <AlertBanner type="error" message={withdrawError} />

            {!showWithdrawConfirm ? (
              <button
                type="button"
                onClick={() => setShowWithdrawConfirm(true)}
                className="px-4 py-2 border-2 border-error text-error rounded-lg hover:bg-error/10 transition-colors text-sm font-medium"
              >
                Withdraw Application
              </button>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={withdrawalReason}
                  onChange={e => setWithdrawalReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Reason for withdrawal (optional)..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-red-300 focus:border-transparent outline-none text-sm resize-none"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={withdrawLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg hover:bg-error transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {withdrawLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <FaExclamationTriangle className="w-4 h-4" />
                    )}
                    Confirm Withdraw
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWithdrawConfirm(false);
                      setWithdrawalReason('');
                    }}
                    className="px-4 py-2 border border-border text-muted rounded-lg hover:bg-surface-muted transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Reviews Panel (when accepted) ──────────────────────────────────── */}
        {application.status === 'accepted' && currentUser && (
          <section className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <ApplicationReviewsPanel
              jobId={getJobId()}
              employerId={getEmployerId()}
              jobSeekerId={getJobSeekerId()}
              currentUserId={currentUser._id}
              applicationStatus={application.status}
              employerName={getEmployerName()}
              seekerName={getSeekerName()}
              jobTitle={getJobTitle()}
            />
          </section>
        )}
      </div>
    </DottedBackground>
  );
};

export default SeekerApplicationDetail;

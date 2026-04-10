import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '../../../hooks/useUser';
import {
  loadApplicationById,
  loadJobStats,
  updateApplicationStatus,
  scheduleInterview,
  cancelInterview,
  selectCurrentApplication,
  selectApplicationLoading,
  selectApplicationError,
} from '../../../store/slices/applicationSlice';
import ApplicationReviewsPanel from '../../../components/reviews/ApplicationReviewsPanel';

import DottedBackground from '../../../components/DottedBackground';
import AlertBanner from '../../../components/ui/AlertBanner';
import Spinner from '../../../components/ui/Spinner';
import {
  FaArrowLeft,
  FaEnvelope,
  FaFileAlt,
  FaCalendarAlt,
  FaLink,
  FaSave,
  FaRocket,
  FaDownload,
  FaVideo,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../../utils/imageUrls';
import { getSignedDownloadUrl } from '../../../services/uploadApi';
import { useTranslation } from 'react-i18next';

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
  pending: 'bg-warning/10 text-warning border-warning/30',
  reviewed: 'bg-info/10 text-info border-info/20',
  shortlisted: 'bg-purple-100 text-purple-700 border-purple-200',
  accepted: 'bg-success/10 text-success border-success/30',
  rejected: 'bg-error/10 text-error border-error/30',
  withdrawn: 'bg-neutral-100 text-subtle border-border',
};

const isCloudinaryUrl = value =>
  typeof value === 'string' &&
  (value.includes('res.cloudinary.com/') || value.includes('res.cloudinary.com\\'));

const INTERVIEW_DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

/** YYYYMMDDTHHmmssZ for Google Calendar `dates` param */
const formatGCalDate = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

const ApplicationDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentUser } = useUser();

  const application = useSelector(selectCurrentApplication);
  const isLoading = useSelector(selectApplicationLoading('currentApplication'));
  const statusLoading = useSelector(selectApplicationLoading('updateStatus'));
  const scheduleLoading = useSelector(selectApplicationLoading('scheduleInterview'));
  const cancelInterviewLoading = useSelector(selectApplicationLoading('cancelInterview'));
  const error = useSelector(selectApplicationError('currentApplication'));

  const [employerNotes, setEmployerNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [interviewDateInput, setInterviewDateInput] = useState('');
  const [interviewType, setInterviewType] = useState('virtual');
  const [interviewDuration, setInterviewDuration] = useState(30);
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewLocationNotes, setInterviewLocationNotes] = useState('');
  const [statusError, setStatusError] = useState('');
  const [scheduleError, setScheduleError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [prevRouteId, setPrevRouteId] = useState(id);
  const [prevHadInterview, setPrevHadInterview] = useState(false);
  const scheduleFormRef = useRef(null);

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
      setInterviewType(application.interviewType === 'in_person' ? 'in_person' : 'virtual');
      const d = application.interviewDuration;
      setInterviewDuration(d != null && INTERVIEW_DURATION_OPTIONS.includes(d) ? d : 30);
      setInterviewLocation(application.interviewLocation || '');
      setInterviewLocationNotes(application.interviewLocationNotes || '');
    });
  }, [application]);

  const hasActiveInterview = Boolean(application?.interviewDate && application?.interviewType);

  if (id !== prevRouteId) {
    setPrevRouteId(id);
    setPrevHadInterview(hasActiveInterview);
    setRescheduleMode(false);
  } else if (hasActiveInterview !== prevHadInterview) {
    setPrevHadInterview(hasActiveInterview);
    if (!hasActiveInterview) {
      setRescheduleMode(false);
    }
  }

  const allowedNextStatuses = STATUS_TRANSITIONS[application?.status] ?? [];
  const canChangeStatus = allowedNextStatuses.length > 0;
  const isFinalStatus = ['accepted', 'rejected', 'withdrawn'].includes(application?.status);
  const showInterviewSection = !isFinalStatus;
  const canEditScheduleForm =
    application?.status === 'shortlisted' && (!hasActiveInterview || rescheduleMode);

  const getScheduleFormBlockedMessage = () => {
    if (application?.status !== 'shortlisted') {
      return t('applications.interview_schedule_requires_shortlist', {
        status: t('applications.status_shortlisted'),
      });
    }
    if (hasActiveInterview && !rescheduleMode) {
      return t('applications.interview_schedule_locked_active');
    }
    return t('applications.interview_schedule_failed');
  };

  const handleScheduleFormBlockedClick = () => {
    toast.error(getScheduleFormBlockedMessage());
  };

  const handleStartReschedule = () => {
    if (application?.status !== 'shortlisted') {
      toast.error(
        t('applications.interview_schedule_requires_shortlist', {
          status: t('applications.status_shortlisted'),
        })
      );
      return;
    }
    setRescheduleMode(true);
    scheduleFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getApplicantName = () => {
    const s = application?.jobSeekerId;
    if (!s) return t('employer.applications.detail_unknown_applicant');
    if (typeof s === 'string') return s;
    return (
      [s.firstName, s.lastName].filter(Boolean).join(' ') ||
      s.email ||
      t('employer.applications.detail_unknown_applicant')
    );
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
    if (!e) return t('employer.applications.detail_employer_name');
    if (typeof e === 'string') return t('employer.applications.detail_employer_name');
    return (
      [e.firstName, e.lastName].filter(Boolean).join(' ') ||
      e.email ||
      t('employer.applications.detail_employer_name')
    );
  };

  const formatDate = dateString => {
    if (!dateString) return '\u2014';
    return new Date(dateString).toLocaleDateString(i18n.language, {
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
      setStatusError(t('employer.applications.detail_status_same_error'));
      return;
    }
    if (!allowedNextStatuses.includes(selectedStatus)) {
      setStatusError(
        t('employer.applications.detail_status_transition_error', {
          from: t(`applications.status_${application.status}`, {
            defaultValue: application.status,
          }),
          to: t(`applications.status_${selectedStatus}`, { defaultValue: selectedStatus }),
        })
      );
      return;
    }
    try {
      await dispatch(
        updateApplicationStatus({
          id: application._id,
          data: { status: selectedStatus, employerNotes: employerNotes.trim() || undefined },
        })
      ).unwrap();
      setStatusSuccess(t('employer.applications.detail_status_update_success'));
      const jid = getJobId();
      if (jid) dispatch(loadJobStats(jid));
    } catch (err) {
      setStatusError(err.message || t('employer.applications.detail_status_update_failed'));
    }
  };

  const handleScheduleInterview = async e => {
    e.preventDefault();
    setScheduleError('');
    if (!application || !interviewDateInput) return;
    if (!canEditScheduleForm) {
      toast.error(getScheduleFormBlockedMessage());
      return;
    }
    const dt = new Date(interviewDateInput);
    if (dt <= new Date()) {
      setScheduleError(t('applications.interview_date_future_error'));
      return;
    }
    if (interviewType === 'in_person' && !interviewLocation.trim()) {
      setScheduleError(t('applications.interview_location_required_error'));
      return;
    }

    const data = {
      interviewDate: dt.toISOString(),
      interviewType,
      interviewDuration,
      ...(interviewType === 'in_person' && {
        interviewLocation: interviewLocation.trim(),
        interviewLocationNotes: interviewLocationNotes.trim() || undefined,
      }),
    };

    try {
      await dispatch(
        scheduleInterview({
          id: application._id,
          data,
        })
      ).unwrap();
      toast.success(t('applications.interview_scheduled_success'));
      setRescheduleMode(false);
    } catch (err) {
      setScheduleError(err.message || t('applications.interview_schedule_failed'));
    }
  };

  const handleCancelInterview = async () => {
    if (!application?._id) return;
    if (!window.confirm(t('applications.interview_cancel_confirm'))) return;
    try {
      await dispatch(cancelInterview(application._id)).unwrap();
      toast.success(t('applications.interview_cancelled_success'));
    } catch (err) {
      toast.error(err.message || t('applications.interview_cancel_failed'));
    }
  };

  const openInterviewGoogleCalendar = () => {
    if (!application?.interviewDate) return;
    const start = new Date(application.interviewDate);
    const end = new Date(start.getTime() + (application.interviewDuration || 30) * 60_000);
    const applicant = getApplicantName();
    const jobTitle = getJobTitle() || 'JobLoom';
    const title = encodeURIComponent(`Interview — ${applicant} — ${jobTitle}`);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const details = encodeURIComponent(
      application.interviewType === 'virtual'
        ? `Video interview — Join: ${origin}/interview/${application._id}\nCandidate: ${applicant}`
        : `In-person interview\nLocation: ${application.interviewLocation || 'TBD'}\nCandidate: ${applicant}`
    );
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGCalDate(start)}/${formatGCalDate(end)}&details=${details}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const jobId = getJobId();
  const backHref = jobId ? `/employer/applications/job/${jobId}` : '/employer/applications';

  if (isLoading || !application) {
    return (
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen">
          {isLoading ? (
            <Spinner size="lg" />
          ) : (
            <div className="text-center">
              <p className="mb-4 text-muted">{t('employer.applications.detail_not_found')}</p>
              <Link
                to="/employer/applications"
                className="font-medium text-primary hover:underline"
              >
                {t('employer.applications.back_to_all')}
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
      <div className="border-b bg-surface border-border">
        <div className="max-w-5xl lg:max-w-6xl px-4 sm:px-6 py-4 sm:py-6 md:py-8 mx-auto">
          <Link
            to={backHref}
            className="inline-flex items-center mb-4 text-sm transition-colors text-subtle hover:text-primary"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-text-dark">{getApplicantName()}</h1>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${STATUS_BADGE[application.status] || 'bg-neutral-100 text-muted'}`}
            >
              {t(`applications.status_${application.status}`, { defaultValue: application.status })}
            </span>
          </div>
          <p className="mt-1 text-subtle">
            {t('employer.applications.detail_application_for', { job: getJobTitle() || '\u2014' })}
          </p>
        </div>
      </div>

      <div className="max-w-5xl lg:max-w-6xl px-4 sm:px-6 py-4 sm:py-6 md:py-8 mx-auto space-y-5 sm:space-y-8">
        <AlertBanner type="error" message={error} />

        {/* Applicant info */}
        <section className="p-4 sm:p-6 border shadow-sm bg-surface rounded-xl border-border">
          <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-text-dark">
            {t('employer.applications.detail_applicant_heading')}
          </h2>
          <div className="space-y-3">
            {getApplicantEmail() && (
              <div className="flex items-center gap-2 text-muted">
                <FaEnvelope className="w-4 h-4 text-subtle" />
                <a href={`mailto:${getApplicantEmail()}`} className="text-primary hover:underline">
                  {getApplicantEmail()}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted">
              <FaCalendarAlt className="w-4 h-4 text-subtle" />
              <span>
                {t('employer.applications.detail_applied_on', {
                  date: formatDate(application.appliedAt || application.createdAt),
                })}
              </span>
            </div>
            {application.jobSeekerId?.skills?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted">
                  {t('employer.applications.detail_skills_label')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {application.jobSeekerId.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-sm rounded-full bg-neutral-100 text-muted"
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
          <section className="p-4 sm:p-6 border shadow-sm bg-surface rounded-xl border-border">
            <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-text-dark">
              {t('employer.applications.detail_cover_letter')}
            </h2>
            <p className="whitespace-pre-wrap text-sm sm:text-base text-muted">
              {application.coverLetter}
            </p>
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
              <section className="p-4 sm:p-6 border shadow-sm bg-surface rounded-xl border-border">
                <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-text-dark">
                  {t('common.resume')}
                </h2>
                <a
                  href={needsSigned ? '#' : resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async e => {
                    if (!needsSigned) return;
                    e.preventDefault();
                    const signedUrl = await getSignedDownloadUrl({
                      url: application.resumeUrl,
                    });
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
                  {needsSigned
                    ? t('common.download_cv')
                    : isExternal
                      ? t('common.view_resume')
                      : t('common.download_cv')}
                </a>
              </section>
            );
          })()}

        {/* Status update & employer notes */}
        <section className="p-4 sm:p-6 border shadow-sm bg-surface rounded-xl border-border">
          <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-text-dark">
            {t('employer.applications.detail_status_notes')}
          </h2>

          <AlertBanner type="error" message={statusError} />
          <AlertBanner type="success" message={statusSuccess} />

          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-muted">
                {t('employer.applications.detail_employer_notes_label')}
              </label>
              <textarea
                value={employerNotes}
                onChange={e => setEmployerNotes(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder={t('employer.applications.detail_employer_notes_placeholder')}
                className="w-full px-4 py-3 text-sm border rounded-lg outline-none resize-none border-border focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="mt-1 text-xs text-subtle">{employerNotes.length}/500</p>
            </div>

            {canChangeStatus && (
              <div>
                <label className="block mb-2 text-sm font-medium text-muted">
                  {t('employer.applications.detail_update_status_label')}
                </label>
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2.5 text-sm border rounded-lg outline-none border-border focus:ring-2 focus:ring-primary"
                  >
                    <option value={application.status}>
                      {t('employer.applications.detail_keep_current')}
                    </option>
                    {allowedNextStatuses.map(s => (
                      <option key={s} value={s}>
                        {t(`applications.status_${s}`, { defaultValue: s })}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={statusLoading || selectedStatus === application.status}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-deep-blue disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {statusLoading ? <Spinner size="sm" /> : <FaSave className="w-4 h-4" />}
                    {t('employer.applications.detail_update_status_button')}
                  </button>
                </div>
              </div>
            )}
          </form>
        </section>

        {/* Schedule interview */}
        {showInterviewSection && (
          <section
            id="schedule-interview"
            className="p-4 sm:p-6 border shadow-sm bg-surface rounded-xl border-border"
          >
            <h2 className="flex items-center gap-2 mb-4 sm:mb-6 text-base sm:text-lg font-bold text-text-dark">
              <FaCalendarAlt className="w-5 h-5 text-primary shrink-0" aria-hidden />
              {t('applications.interview_schedule_button')}
            </h2>

            <AlertBanner type="error" message={scheduleError} />

            <div className="relative">
              <form
                ref={scheduleFormRef}
                onSubmit={handleScheduleInterview}
                className={`space-y-6 ${!canEditScheduleForm ? 'opacity-55 pointer-events-none' : ''}`}
                noValidate
              >
                <div>
                  <p className="mb-3 text-sm font-medium text-muted">
                    {t('applications.interview_type_label')}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setInterviewType('virtual')}
                      className={`p-4 text-left transition-all rounded-lg border-2 ${
                        interviewType === 'virtual'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-neutral-300'
                      }`}
                    >
                      <FaVideo className="w-5 h-5 mb-2 text-primary" aria-hidden />
                      <p className="font-medium text-text-dark">
                        {t('applications.interview_type_virtual')}
                      </p>
                      <p className="text-xs text-subtle">
                        {t('applications.interview_virtual_desc')}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterviewType('in_person')}
                      className={`p-4 text-left transition-all rounded-lg border-2 ${
                        interviewType === 'in_person'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-neutral-300'
                      }`}
                    >
                      <FaMapMarkerAlt className="w-5 h-5 mb-2 text-purple-500" aria-hidden />
                      <p className="font-medium text-text-dark">
                        {t('applications.interview_type_in_person')}
                      </p>
                      <p className="text-xs text-subtle">
                        {t('applications.interview_in_person_desc')}
                      </p>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                  <div className="flex-1 min-w-[12rem]">
                    <label className="block mb-1 text-sm font-medium text-muted">
                      {t('applications.interview_date_label')}
                    </label>
                    <input
                      type="datetime-local"
                      value={interviewDateInput}
                      onChange={e => setInterviewDateInput(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full max-w-xs px-4 py-2.5 text-sm border rounded-lg outline-none border-border focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="w-full sm:w-44">
                    <label className="block mb-1 text-sm font-medium text-muted">
                      {t('applications.interview_duration_label')}
                    </label>
                    <select
                      value={interviewDuration}
                      onChange={e => setInterviewDuration(Number(e.target.value))}
                      className="w-full px-4 py-2.5 text-sm border rounded-lg outline-none border-border focus:ring-2 focus:ring-primary bg-surface"
                    >
                      {INTERVIEW_DURATION_OPTIONS.map(m => (
                        <option key={m} value={m}>
                          {t('applications.interview_duration_minutes', { count: m })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {interviewType === 'in_person' && (
                  <div className="p-3 sm:p-4 space-y-4 rounded-xl border bg-neutral-50/80 border-border">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-muted">
                        {t('applications.interview_location_label')}{' '}
                        <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={300}
                        value={interviewLocation}
                        onChange={e => setInterviewLocation(e.target.value)}
                        placeholder={t('applications.interview_location_placeholder')}
                        className="w-full px-4 py-2.5 text-sm border rounded-lg outline-none border-border focus:ring-2 focus:ring-primary bg-surface"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-muted">
                        {t('applications.interview_location_notes_label')}
                      </label>
                      <textarea
                        rows={2}
                        maxLength={500}
                        value={interviewLocationNotes}
                        onChange={e => setInterviewLocationNotes(e.target.value)}
                        placeholder={t('applications.interview_location_notes_placeholder')}
                        className="w-full px-4 py-2.5 text-sm border rounded-lg outline-none resize-none border-border focus:ring-2 focus:ring-primary bg-surface"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={scheduleLoading || !canEditScheduleForm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-success hover:bg-deep-blue disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scheduleLoading ? <Spinner size="sm" /> : <FaRocket className="w-4 h-4" />}
                  {hasActiveInterview && rescheduleMode
                    ? t('applications.interview_reschedule_button')
                    : t('applications.interview_schedule_button')}
                </button>
              </form>

              {!canEditScheduleForm && (
                <button
                  type="button"
                  onClick={handleScheduleFormBlockedClick}
                  className="absolute inset-0 z-10 w-full h-full cursor-not-allowed bg-transparent rounded-lg"
                  aria-label={getScheduleFormBlockedMessage()}
                />
              )}
            </div>

            {application.interviewDate && application.interviewType && (
              <div className="p-3 sm:p-4 mt-4 sm:mt-6 border rounded-lg bg-success/5 border-success/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-success shrink-0" aria-hidden />
                      <p className="text-sm font-medium text-success">
                        {t('applications.interview_scheduled')}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                      {application.interviewType === 'virtual' ? (
                        <FaVideo className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden />
                      ) : (
                        <FaMapMarkerAlt
                          className="w-3.5 h-3.5 text-purple-500 shrink-0"
                          aria-hidden
                        />
                      )}
                      <span>
                        {application.interviewType === 'virtual'
                          ? t('applications.interview_type_virtual')
                          : t('applications.interview_type_in_person')}
                      </span>
                      <span className="text-subtle">·</span>
                      <span>{formatDate(application.interviewDate)}</span>
                    </div>
                    {application.interviewDuration != null && (
                      <p className="mt-1 text-xs text-subtle">
                        {t('applications.interview_duration_summary', {
                          label: t('applications.interview_duration_label'),
                          value: t('applications.interview_duration_minutes', {
                            count: application.interviewDuration,
                          }),
                        })}
                      </p>
                    )}
                    {application.interviewType === 'virtual' && application.jitsiRoomName && (
                      <p className="mt-2 font-mono text-xs break-all text-muted">
                        {t('employer.applications.detail_room_label', {
                          room: application.jitsiRoomName,
                        })}
                      </p>
                    )}
                    {application.interviewLocation && (
                      <p className="mt-1 text-xs text-muted">
                        <span className="mr-1" aria-hidden>
                          📍
                        </span>
                        {application.interviewLocation}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end shrink-0">
                    {application.interviewType === 'virtual' && (
                      <Link
                        to={`/interview/${application._id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-deep-blue w-full sm:w-auto"
                      >
                        <FaVideo className="w-4 h-4 shrink-0" aria-hidden />
                        {t('applications.interview_join_button')}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={openInterviewGoogleCalendar}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm transition-colors text-primary hover:underline w-full sm:w-auto"
                    >
                      <FaCalendarAlt className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      {t('applications.interview_add_to_calendar')}
                    </button>
                    <button
                      type="button"
                      onClick={handleStartReschedule}
                      className="text-sm font-medium transition-colors text-primary hover:underline text-center sm:text-right"
                    >
                      {t('applications.interview_reschedule_button')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelInterview}
                      disabled={cancelInterviewLoading}
                      className="inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors text-error/90 hover:text-error hover:underline disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {cancelInterviewLoading ? <Spinner size="sm" /> : null}
                      {t('applications.interview_cancel_button')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Reviews panel (when accepted) */}
        {application.status === 'accepted' && currentUser && (
          <section className="p-4 sm:p-6 border shadow-sm bg-surface rounded-xl border-border overflow-hidden">
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

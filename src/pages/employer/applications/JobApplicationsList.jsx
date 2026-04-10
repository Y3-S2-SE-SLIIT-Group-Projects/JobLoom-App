import { useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../../hooks/useJobs';
import {
  loadJobApplications,
  loadJobStats,
  selectJobApplications,
  selectJobStats,
  selectJobAppsPagination,
  selectApplicationLoading,
  selectApplicationError,
} from '../../../store/slices/applicationSlice';

import DottedBackground from '../../../components/DottedBackground';
import AlertBanner from '../../../components/ui/AlertBanner';
import {
  FaArrowLeft,
  FaEnvelope,
  FaCalendarAlt,
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaInbox,
} from 'react-icons/fa';
import { useState } from 'react';

// Constants
const ALL_STATUSES = [
  'all',
  'pending',
  'reviewed',
  'shortlisted',
  'accepted',
  'rejected',
  'withdrawn',
];

const STATUS_BADGE = {
  pending: 'bg-warning/10 text-warning border-warning/30',
  reviewed: 'bg-info/10 text-info border-info/20',
  shortlisted: 'bg-purple-100 text-purple-700 border-purple-200',
  accepted: 'bg-success/10 text-success border-success/30',
  rejected: 'bg-error/10 text-error border-error/30',
  withdrawn: 'bg-neutral-100 text-subtle border-border',
};

const STAT_TAB_COLORS = {
  all: 'border-primary text-primary',
  pending: 'border-warning text-warning',
  reviewed: 'border-primary text-info',
  shortlisted: 'border-purple-500 text-purple-700',
  accepted: 'border-success text-success',
  rejected: 'border-error text-error',
  withdrawn: 'border-neutral-500 text-subtle',
};

// ── Component

const JobApplicationsList = () => {
  const { t, i18n } = useTranslation();
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const { fetchJobById } = useJobs();

  const applications = useSelector(selectJobApplications);
  const stats = useSelector(selectJobStats);
  const pagination = useSelector(selectJobAppsPagination);
  const isLoading = useSelector(selectApplicationLoading('jobApplications'));
  const statsLoading = useSelector(selectApplicationLoading('jobStats'));
  const error = useSelector(selectApplicationError('jobApplications'));

  const [job, setJob] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Load job details for header
  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchJobById(jobId);
        if (!cancelled) setJob(data);
      } catch {
        /* job fetch errors are non-critical here */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  // Load stats
  useEffect(() => {
    if (jobId) dispatch(loadJobStats(jobId));
  }, [dispatch, jobId]);

  // Load applications whenever filter or page changes
  useEffect(() => {
    if (!jobId) return;
    const params = { page: currentPage, limit: PAGE_SIZE };
    if (activeFilter !== 'all') params.status = activeFilter;
    dispatch(loadJobApplications({ jobId, params }));
  }, [dispatch, jobId, activeFilter, currentPage]);

  const totalAll = useMemo(() => {
    if (!stats) return 0;
    // Backend returns stats.total; avoid double-counting by not summing all values
    if (typeof stats.total === 'number') return stats.total;
    const statusKeys = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];
    return statusKeys.reduce((s, k) => s + (stats[k] || 0), 0);
  }, [stats]);

  const getStatCount = status => {
    if (status === 'all') return totalAll;
    return stats?.[status] ?? 0;
  };

  const formatDate = useCallback(
    dateString => {
      if (!dateString) return '\u2014';
      return new Date(dateString).toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
    [i18n.language]
  );

  const getApplicantName = app => {
    const seeker = app.jobSeekerId;
    if (!seeker) return t('employer.applications.detail_unknown_applicant');
    if (typeof seeker === 'string') return seeker;
    return (
      [seeker.firstName, seeker.lastName].filter(Boolean).join(' ') ||
      seeker.email ||
      t('employer.applications.detail_unknown_applicant')
    );
  };

  const getApplicantEmail = app => {
    const seeker = app.jobSeekerId;
    if (!seeker || typeof seeker === 'string') return '';
    return seeker.email || '';
  };

  const handleFilterChange = status => {
    setActiveFilter(status);
    setCurrentPage(1);
  };

  // ── Render
  return (
    <DottedBackground>
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
          <Link
            to="/employer/applications"
            className="inline-flex items-center text-subtle hover:text-primary transition-colors text-sm mb-4"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            {t('employer.applications.back_to_all')}
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold text-text-dark">
            {job?.title ?? t('employer.applications.page_title_fallback')}
          </h1>
          {job && (
            <p className="text-xs sm:text-sm text-subtle mt-1">
              {job.jobRole || t('employer.jobs.job_position')} &middot;{' '}
              <span className="capitalize">
                {job.status === 'open' || job.status === 'closed' || job.status === 'filled'
                  ? t(`employer.jobs.filter_${job.status}`)
                  : job.status}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Stats filter tabs — horizontal scroll on narrow screens, wrap from sm+ */}
        <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-x-visible [-webkit-overflow-scrolling:touch]">
            {ALL_STATUSES.map(status => {
              const count = getStatCount(status);
              const isActive = activeFilter === status;
              return (
                <button
                  type="button"
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  disabled={statsLoading}
                  className={`px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border-2 transition-colors capitalize shrink-0 ${
                    isActive
                      ? `${STAT_TAB_COLORS[status]} bg-surface`
                      : 'border-transparent text-subtle hover:bg-surface-muted'
                  }`}
                >
                  {status === 'all'
                    ? t('applications.list_filter_all')
                    : t(`applications.status_${status}`, { defaultValue: status })}
                  <span
                    className={`ml-1.5 sm:ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-neutral-100' : 'bg-neutral-200/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        <AlertBanner type="error" message={error} />

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16" role="status" aria-live="polite">
            <span className="sr-only">{t('common.loading')}</span>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          /* Empty state */
          <div className="bg-surface rounded-xl shadow-sm border border-border px-4 py-10 sm:p-12 text-center">
            <FaInbox className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-text-dark mb-2">
              {activeFilter !== 'all'
                ? t('employer.applications.job_list_empty_filtered_title', {
                    status: t(`applications.status_${activeFilter}`, {
                      defaultValue: activeFilter,
                    }),
                  })
                : t('employer.applications.job_list_empty')}
            </h3>
            <p className="text-subtle text-sm">
              {activeFilter !== 'all'
                ? t('employer.applications.job_list_empty_filtered_hint')
                : t('employer.applications.job_list_empty_hint')}
            </p>
          </div>
        ) : (
          <>
            {/* Application cards */}
            <div className="space-y-3 sm:space-y-4">
              {applications.map(app => (
                <div
                  key={app._id}
                  className="bg-surface rounded-xl shadow-sm border border-border p-4 sm:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Applicant info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1">
                        <h3 className="text-sm sm:text-base font-bold text-text-dark truncate">
                          {getApplicantName(app)}
                        </h3>
                        <span
                          className={`self-start shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize ${STATUS_BADGE[app.status] || 'bg-neutral-100 text-muted border-border'}`}
                        >
                          {t(`applications.status_${app.status}`, { defaultValue: app.status })}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-subtle">
                        {getApplicantEmail(app) && (
                          <span className="flex items-center gap-1.5 min-w-0">
                            <FaEnvelope className="w-3.5 h-3.5 text-subtle shrink-0" />
                            <span className="truncate">{getApplicantEmail(app)}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <FaCalendarAlt className="w-3.5 h-3.5 text-subtle shrink-0" />
                          {t('employer.applications.detail_applied_on', {
                            date: formatDate(app.appliedAt || app.createdAt),
                          })}
                        </span>
                        {app.interviewDate && (
                          <span className="flex items-center gap-1.5 text-purple-600">
                            <FaCalendarAlt className="w-3.5 h-3.5 shrink-0" />
                            {t('applications.interview_on_date', {
                              date: formatDate(app.interviewDate),
                            })}
                          </span>
                        )}
                      </div>

                      {/* Skills preview */}
                      {app.jobSeekerId?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {app.jobSeekerId.skills.slice(0, 5).map((skill, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-neutral-100 text-muted rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {app.jobSeekerId.skills.length > 5 && (
                            <span className="text-xs text-subtle">
                              {t('employer.applications.skills_more', {
                                count: app.jobSeekerId.skills.length - 5,
                              })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="shrink-0 w-full sm:w-auto">
                      <Link
                        to={`/employer/applications/${app._id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors text-sm font-medium w-full sm:w-auto"
                      >
                        <FaFileAlt className="w-3.5 h-3.5" />
                        {t('applications.view_details')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex flex-col items-stretch gap-4 mt-8 pt-6 border-t border-border sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-xs text-subtle sm:text-left sm:text-sm">
                  {t('applications.list_pagination_showing', {
                    from: (pagination.page - 1) * pagination.limit + 1,
                    to: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total,
                  })}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end max-w-full">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    aria-label={t('common.previous')}
                    className="p-2 rounded-lg border border-border text-muted hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(p => {
                      if (pagination.pages <= 7) return true;
                      if (p === 1 || p === pagination.pages) return true;
                      return Math.abs(p - currentPage) <= 1;
                    })
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-subtle">
                          ...
                        </span>
                      ) : (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          aria-label={t('common.page_of', {
                            current: item,
                            total: pagination.pages,
                          })}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === item
                              ? 'bg-primary text-white'
                              : 'border border-border text-muted hover:bg-surface-muted'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={currentPage >= pagination.pages}
                    aria-label={t('common.next')}
                    className="p-2 rounded-lg border border-border text-muted hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FaChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DottedBackground>
  );
};

export default JobApplicationsList;

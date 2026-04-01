import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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

// ── Constants ───────────────────────────────────────────────────────────────────

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

// ── Component ───────────────────────────────────────────────────────────────────

const JobApplicationsList = () => {
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

  const formatDate = dateString => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getApplicantName = app => {
    const seeker = app.jobSeekerId;
    if (!seeker) return 'Unknown';
    if (typeof seeker === 'string') return seeker;
    return (
      [seeker.firstName, seeker.lastName].filter(Boolean).join(' ') || seeker.email || 'Unknown'
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

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <DottedBackground>
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link
            to="/employer/applications"
            className="inline-flex items-center text-subtle hover:text-primary transition-colors text-sm mb-4"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Link>

          <h1 className="text-2xl font-bold text-text-dark">{job?.title ?? 'Job Applications'}</h1>
          {job && (
            <p className="text-sm text-subtle mt-1">
              {job.jobRole || 'Job Position'} &middot;{' '}
              <span className="capitalize">{job.status}</span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ALL_STATUSES.map(status => {
            const count = getStatCount(status);
            const isActive = activeFilter === status;
            return (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                disabled={statsLoading}
                className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors capitalize ${
                  isActive
                    ? `${STAT_TAB_COLORS[status]} bg-surface`
                    : 'border-transparent text-subtle hover:bg-surface-muted'
                }`}
              >
                {status === 'all' ? 'All' : status}
                <span
                  className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-neutral-100' : 'bg-neutral-200/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Error */}
        <AlertBanner type="error" message={error} />

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          /* Empty state */
          <div className="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
            <FaInbox className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-dark mb-2">
              {activeFilter !== 'all' ? `No ${activeFilter} applications` : 'No applications yet'}
            </h3>
            <p className="text-subtle text-sm">
              {activeFilter !== 'all'
                ? 'Try selecting a different status filter.'
                : 'Applications will appear here once job seekers apply.'}
            </p>
          </div>
        ) : (
          <>
            {/* Application cards */}
            <div className="space-y-3">
              {applications.map(app => (
                <div
                  key={app._id}
                  className="bg-surface rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Applicant info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-text-dark truncate">
                          {getApplicantName(app)}
                        </h3>
                        <span
                          className={`shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize ${STATUS_BADGE[app.status] || 'bg-neutral-100 text-muted border-border'}`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-subtle">
                        {getApplicantEmail(app) && (
                          <span className="flex items-center gap-1.5">
                            <FaEnvelope className="w-3.5 h-3.5 text-subtle" />
                            {getApplicantEmail(app)}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <FaCalendarAlt className="w-3.5 h-3.5 text-subtle" />
                          Applied {formatDate(app.appliedAt || app.createdAt)}
                        </span>
                        {app.interviewDate && (
                          <span className="flex items-center gap-1.5 text-purple-600">
                            <FaCalendarAlt className="w-3.5 h-3.5" />
                            Interview {formatDate(app.interviewDate)}
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
                              +{app.jobSeekerId.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      <Link
                        to={`/employer/applications/${app._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors text-sm font-medium"
                      >
                        <FaFileAlt className="w-3.5 h-3.5" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <p className="text-sm text-subtle">
                  Showing{' '}
                  <span className="font-medium text-muted">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium text-muted">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium text-muted">{pagination.total}</span> applications
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
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
                          key={item}
                          onClick={() => setCurrentPage(item)}
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
                    onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={currentPage >= pagination.pages}
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

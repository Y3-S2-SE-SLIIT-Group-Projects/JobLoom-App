import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useJobs } from '../../../contexts/JobContext';
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
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
  shortlisted: 'bg-purple-100 text-purple-700 border-purple-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  withdrawn: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STAT_TAB_COLORS = {
  all: 'border-[#6794D1] text-[#6794D1]',
  pending: 'border-yellow-500 text-yellow-700',
  reviewed: 'border-blue-500 text-blue-700',
  shortlisted: 'border-purple-500 text-purple-700',
  accepted: 'border-green-500 text-green-700',
  rejected: 'border-red-500 text-red-700',
  withdrawn: 'border-gray-400 text-gray-500',
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
    return Object.values(stats).reduce((s, n) => s + (typeof n === 'number' ? n : 0), 0);
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link
            to="/employer/applications"
            className="inline-flex items-center text-gray-500 hover:text-[#6794D1] transition-colors text-sm mb-4"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">{job?.title ?? 'Job Applications'}</h1>
          {job && (
            <p className="text-sm text-gray-500 mt-1">
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
                    ? `${STAT_TAB_COLORS[status]} bg-white`
                    : 'border-transparent text-gray-500 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? 'All' : status}
                <span
                  className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-gray-100' : 'bg-gray-200/60'
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
            <div className="w-12 h-12 border-4 border-[#6794D1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaInbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeFilter !== 'all' ? `No ${activeFilter} applications` : 'No applications yet'}
            </h3>
            <p className="text-gray-500 text-sm">
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
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Applicant info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-[#2B373F] truncate">
                          {getApplicantName(app)}
                        </h3>
                        <span
                          className={`shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize ${STATUS_BADGE[app.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {getApplicantEmail(app) && (
                          <span className="flex items-center gap-1.5">
                            <FaEnvelope className="w-3.5 h-3.5 text-gray-400" />
                            {getApplicantEmail(app)}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <FaCalendarAlt className="w-3.5 h-3.5 text-gray-400" />
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
                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {app.jobSeekerId.skills.length > 5 && (
                            <span className="text-xs text-gray-400">
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors text-sm font-medium"
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
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing{' '}
                  <span className="font-medium text-gray-700">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium text-gray-700">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium text-gray-700">{pagination.total}</span>{' '}
                  applications
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === item
                              ? 'bg-[#6794D1] text-white'
                              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={currentPage >= pagination.pages}
                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

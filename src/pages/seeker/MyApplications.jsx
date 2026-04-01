import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadMyApplications,
  selectMyApplications,
  selectApplicationPagination,
  selectApplicationLoading,
  selectApplicationError,
} from '../../store/slices/applicationSlice';
import DottedBackground from '../../components/DottedBackground';
import AlertBanner from '../../components/ui/AlertBanner';
import { STATUS_BADGE_COLORS, STATUS_TAB_COLORS } from '../../constants/applicationStatus';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaInbox,
  FaSearch,
} from 'react-icons/fa';

const ALL_STATUSES = [
  'all',
  'pending',
  'reviewed',
  'shortlisted',
  'accepted',
  'rejected',
  'withdrawn',
];

const PAGE_SIZE = 20;

const formatDate = dateString => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getEmployerName = app => {
  const emp = app.employerId;
  if (!emp) return 'Unknown';
  if (typeof emp === 'string') return emp;
  return (
    [emp.firstName, emp.lastName].filter(Boolean).join(' ') ||
    emp.companyName ||
    emp.email ||
    'Unknown'
  );
};

const getJobTitle = app => {
  const job = app.jobId;
  if (!job) return 'Unknown Job';
  return typeof job === 'object' ? job.title || 'Unknown Job' : 'Unknown Job';
};

const getJobStatus = app => {
  const job = app.jobId;
  if (!job || typeof job !== 'object') return null;
  return job.status || null;
};

const JOB_STATUS_BADGE = {
  closed: 'bg-error/10 text-error border-error/20',
  filled: 'bg-info/10 text-info border-info/20',
};

const MyApplications = () => {
  const dispatch = useDispatch();
  const applications = useSelector(selectMyApplications);
  const pagination = useSelector(selectApplicationPagination);
  const isLoading = useSelector(selectApplicationLoading('myApplications'));
  const error = useSelector(selectApplicationError('myApplications'));

  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Load applications when filter or page changes
  useEffect(() => {
    const params = { page: currentPage, limit: PAGE_SIZE, sort: '-createdAt' };
    if (activeFilter !== 'all') params.status = activeFilter;
    dispatch(loadMyApplications(params));
  }, [dispatch, activeFilter, currentPage]);

  // Client-side search filter on job title
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.trim().toLowerCase();
    return applications.filter(app => getJobTitle(app).toLowerCase().includes(q));
  }, [applications, searchQuery]);

  const handleFilterChange = status => {
    setActiveFilter(status);
    setCurrentPage(1);
  };

  const totalCount = pagination?.total ?? 0;

  return (
    <DottedBackground>
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text-dark">My Applications</h1>
          <p className="text-sm text-subtle mt-1">Track and manage your job applications</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search & filter row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input
              type="text"
              placeholder="Search by job title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {ALL_STATUSES.map(status => {
            const isActive = activeFilter === status;
            const count = isActive ? totalCount : null;
            return (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors capitalize shrink-0 ${
                  isActive
                    ? `${STATUS_TAB_COLORS[status] ?? STATUS_TAB_COLORS.all} bg-surface`
                    : 'border-transparent text-subtle hover:bg-surface-muted'
                }`}
              >
                {status === 'all' ? 'All' : status}
                {count != null && (
                  <span
                    className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-neutral-100' : 'bg-neutral-200/60'
                    }`}
                  >
                    {count}
                  </span>
                )}
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
        ) : filteredApplications.length === 0 ? (
          /* Empty state */
          <div className="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
            <FaInbox className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-dark mb-2">
              {searchQuery.trim()
                ? 'No matching applications'
                : activeFilter !== 'all'
                  ? `No ${activeFilter} applications`
                  : "You haven't applied to any jobs yet."}
            </h3>
            <p className="text-subtle text-sm mb-6">
              {searchQuery.trim() || activeFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Browse jobs to get started.'}
            </p>
            {!searchQuery.trim() && activeFilter === 'all' && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors text-sm font-medium"
              >
                <FaBriefcase className="w-4 h-4" />
                Browse Jobs
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Application cards */}
            <div className="space-y-3">
              {filteredApplications.map(app => {
                const isWithdrawn = app.status === 'withdrawn';
                const jobStatus = getJobStatus(app);
                const jobClosed = jobStatus === 'closed' || jobStatus === 'filled';

                return (
                  <div
                    key={app._id}
                    className={`bg-surface rounded-xl shadow-sm border p-5 transition-shadow ${
                      isWithdrawn ? 'border-border opacity-70' : 'border-border hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3
                            className={`text-base font-bold truncate ${
                              isWithdrawn ? 'text-subtle' : 'text-text-dark'
                            }`}
                          >
                            {getJobTitle(app)}
                          </h3>
                          <span
                            className={`shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize ${
                              STATUS_BADGE_COLORS[app.status] ??
                              'bg-neutral-100 text-muted border-border'
                            }`}
                          >
                            {app.status}
                          </span>
                          {jobClosed && (
                            <span
                              className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${
                                JOB_STATUS_BADGE[jobStatus] ?? ''
                              }`}
                            >
                              Job {jobStatus}
                            </span>
                          )}
                        </div>

                        <p className={`text-sm mb-1 ${isWithdrawn ? 'text-subtle' : 'text-muted'}`}>
                          {getEmployerName(app)}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-subtle">
                          <span className="flex items-center gap-1.5">
                            <FaCalendarAlt className="w-3.5 h-3.5 text-subtle" />
                            Applied {formatDate(app.appliedAt || app.createdAt)}
                          </span>
                          {app.interviewDate && !isWithdrawn && (
                            <span className="flex items-center gap-1.5 text-purple-600">
                              <FaCalendarAlt className="w-3.5 h-3.5" />
                              Interview {formatDate(app.interviewDate)}
                            </span>
                          )}
                        </div>

                        {isWithdrawn && app.withdrawalReason && (
                          <p className="text-xs text-subtle mt-2 italic">
                            Withdrawal reason: {app.withdrawalReason}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <Link
                          to={`/my-applications/${app._id}`}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                            isWithdrawn
                              ? 'bg-neutral-100 text-subtle hover:bg-neutral-200'
                              : 'bg-primary text-white hover:bg-deep-blue'
                          }`}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination - only when not filtering by search (pagination is for API results) */}
            {!searchQuery.trim() && pagination && pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
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

export default MyApplications;

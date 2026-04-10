import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  loadMyApplications,
  selectMyApplications,
  selectApplicationPagination,
  selectApplicationLoading,
  selectApplicationError,
} from '../../store/slices/applicationSlice';
import DottedBackground from '../../components/DottedBackground';
import AlertBanner from '../../components/ui/AlertBanner';
import {
  STATUS_BADGE_COLORS,
  STATUS_CARD_THEME,
  STATUS_TAB_COLORS,
} from '../../constants/applicationStatus';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaInbox,
  FaSearch,
  FaBuilding,
  FaArrowRight,
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
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const applications = useSelector(selectMyApplications);
  const pagination = useSelector(selectApplicationPagination);
  const isLoading = useSelector(selectApplicationLoading('myApplications'));
  const error = useSelector(selectApplicationError('myApplications'));

  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

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

  const getEmployerName = useCallback(
    app => {
      const emp = app.employerId;
      if (!emp) return t('applications.list_unknown_employer');
      if (typeof emp === 'string') return emp;
      return (
        [emp.firstName, emp.lastName].filter(Boolean).join(' ') ||
        emp.companyName ||
        emp.email ||
        t('applications.list_unknown_employer')
      );
    },
    [t]
  );

  const getCompanyDisplay = useCallback(
    app => {
      const emp = app.employerId;
      if (!emp || typeof emp === 'string') return getEmployerName(app);
      const cn = emp.companyName?.trim();
      if (cn) return cn;
      return getEmployerName(app);
    },
    [getEmployerName]
  );

  const getEmployerContactPerson = useCallback(app => {
    const emp = app.employerId;
    if (!emp || typeof emp === 'string') return '';
    return [emp.firstName, emp.lastName].filter(Boolean).join(' ') || '';
  }, []);

  const getJobTitle = useCallback(
    app => {
      const job = app.jobId;
      if (!job) return t('applications.list_unknown_job');
      return typeof job === 'object'
        ? job.title || t('applications.list_unknown_job')
        : t('applications.list_unknown_job');
    },
    [t]
  );

  const statusTabLabel = status =>
    status === 'all' ? t('applications.list_filter_all') : t(`applications.status_${status}`);

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
    return applications.filter(app => {
      const title = getJobTitle(app).toLowerCase();
      const company = getCompanyDisplay(app).toLowerCase();
      const person = getEmployerContactPerson(app).toLowerCase();
      return title.includes(q) || company.includes(q) || person.includes(q);
    });
  }, [applications, searchQuery, getJobTitle, getCompanyDisplay, getEmployerContactPerson]);

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
          <h1 className="text-xl sm:text-2xl font-bold text-text-dark">
            {t('applications.my_applications_title')}
          </h1>
          <p className="text-sm text-subtle mt-1">{t('applications.my_applications_subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search & filter row */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative w-full min-w-0">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
            <input
              type="text"
              placeholder={t('applications.list_search_placeholder')}
              aria-label={t('applications.list_search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full min-w-0 pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>

        {/* Status filter tabs — horizontal scroll on narrow screens, wrap from sm+ */}
        <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-x-visible [-webkit-overflow-scrolling:touch]"
            role="tablist"
            aria-label={t('applications.list_filter_aria_label')}
          >
            {ALL_STATUSES.map(status => {
              const isActive = activeFilter === status;
              const count = isActive ? totalCount : null;
              return (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleFilterChange(status)}
                  disabled={isLoading}
                  className={`px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border-2 transition-colors shrink-0 ${
                    isActive
                      ? `${STATUS_TAB_COLORS[status] ?? STATUS_TAB_COLORS.all} bg-surface`
                      : 'border-transparent text-subtle hover:bg-surface-muted'
                  }`}
                >
                  {statusTabLabel(status)}
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
        </div>

        {/* Error */}
        <AlertBanner type="error" message={error} />

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16" role="status" aria-live="polite">
            <span className="sr-only">{t('common.loading')}</span>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredApplications.length === 0 ? (
          /* Empty state */
          <div className="bg-surface rounded-xl shadow-sm border border-border px-4 py-10 sm:p-12 text-center">
            <FaInbox className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-dark mb-2">
              {searchQuery.trim()
                ? t('applications.list_empty_search')
                : activeFilter !== 'all'
                  ? t('applications.list_empty_filtered', { status: statusTabLabel(activeFilter) })
                  : t('applications.no_applications')}
            </h3>
            <p className="text-subtle text-sm mb-6">
              {searchQuery.trim() || activeFilter !== 'all'
                ? t('applications.list_empty_adjust')
                : t('applications.list_empty_browse_hint')}
            </p>
            {!searchQuery.trim() && activeFilter === 'all' && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors text-sm font-medium"
              >
                <FaBriefcase className="w-4 h-4" />
                {t('applications.browse_jobs_cta')}
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Application cards */}
            <div className="space-y-4">
              {filteredApplications.map(app => {
                const isWithdrawn = app.status === 'withdrawn';
                const jobStatus = getJobStatus(app);
                const jobClosed = jobStatus === 'closed' || jobStatus === 'filled';
                const theme = STATUS_CARD_THEME[app.status] ?? STATUS_CARD_THEME.reviewed;

                return (
                  <article
                    key={app._id}
                    className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:shadow-card ${theme.wash} ${theme.hoverBorder} ${
                      isWithdrawn ? 'opacity-[0.94] hover:opacity-100' : ''
                    }`}
                  >
                    <div
                      className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${theme.bar}`}
                      aria-hidden
                    />
                    <div className="relative flex flex-col items-stretch gap-4 p-4 pl-[1.15rem] sm:flex-row sm:items-center sm:gap-6 sm:p-5 sm:pl-7">
                      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${theme.icon}`}
                          aria-hidden
                        >
                          <FaBriefcase className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2.5">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <h3
                              className={`font-heading min-w-0 flex-1 text-base font-bold leading-snug tracking-tight break-words sm:text-lg ${
                                isWithdrawn ? 'text-subtle' : 'text-text-dark'
                              }`}
                            >
                              {getJobTitle(app)}
                            </h3>
                            <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                                  STATUS_BADGE_COLORS[app.status] ??
                                  'bg-neutral-100 text-muted border-border'
                                }`}
                              >
                                {t(`applications.status_${app.status}`, {
                                  defaultValue: app.status,
                                })}
                              </span>
                              {jobClosed && (
                                <span
                                  className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-lg border ${
                                    JOB_STATUS_BADGE[jobStatus] ?? ''
                                  }`}
                                >
                                  {jobStatus === 'closed'
                                    ? t('applications.job_listing_closed')
                                    : t('applications.job_listing_filled')}
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            className={`space-y-1 text-sm ${isWithdrawn ? 'text-subtle' : 'text-muted'}`}
                          >
                            <p className="flex items-center gap-2 font-medium text-text-dark">
                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface/90 ring-1 ring-inset ring-black/[0.06] ${
                                  isWithdrawn ? 'text-neutral-400' : 'text-primary'
                                }`}
                              >
                                <FaBuilding className="h-3.5 w-3.5" aria-hidden />
                              </span>
                              <span className="min-w-0 break-words leading-snug">
                                {getCompanyDisplay(app)}
                              </span>
                            </p>
                            {(() => {
                              const person = getEmployerContactPerson(app);
                              const emp = app.employerId;
                              const hasCompany =
                                emp && typeof emp === 'object' && emp.companyName?.trim();
                              if (person && hasCompany) {
                                return (
                                  <p className="pl-9 text-xs leading-relaxed text-subtle">
                                    {t('applications.list_employer_contact_prefix')}{' '}
                                    <span className="text-muted">{person}</span>
                                  </p>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur-[2px]">
                              <FaCalendarAlt className="h-3 w-3 shrink-0 text-subtle" aria-hidden />
                              <span className="break-words">
                                {t('applications.applied_on', {
                                  date: formatDate(app.appliedAt || app.createdAt),
                                })}
                              </span>
                            </span>
                            {app.interviewDate && !isWithdrawn && (
                              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-purple-200/90 bg-purple-50/90 px-3 py-1.5 text-xs font-medium text-purple-700">
                                <FaCalendarAlt className="h-3 w-3 shrink-0" aria-hidden />
                                <span className="break-words">
                                  {t('applications.interview_on_date', {
                                    date: formatDate(app.interviewDate),
                                  })}
                                </span>
                              </span>
                            )}
                          </div>

                          {isWithdrawn && app.withdrawalReason && (
                            <p className="rounded-lg border border-dashed border-border bg-surface-muted/60 px-3 py-2 text-xs leading-relaxed text-subtle">
                              <span className="font-medium not-italic text-muted">
                                {t('applications.list_withdrawal_note_prefix')}
                              </span>{' '}
                              <span className="italic">{app.withdrawalReason}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex w-full shrink-0 sm:w-auto sm:items-center sm:justify-center sm:border-l sm:border-border sm:pl-6">
                        <Link
                          to={`/my-applications/${app._id}`}
                          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 sm:min-w-[10.5rem] sm:py-2.5 sm:px-5 ${theme.cta}`}
                        >
                          {t('applications.view_details')}
                          <FaArrowRight
                            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination - only when not filtering by search (pagination is for API results) */}
            {!searchQuery.trim() && pagination && pagination.pages > 1 && (
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

export default MyApplications;

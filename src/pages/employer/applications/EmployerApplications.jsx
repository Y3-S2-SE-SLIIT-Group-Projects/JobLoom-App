import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../../hooks/useJobs';
import {
  loadAllJobStats,
  selectJobStatsMap,
  selectApplicationLoading,
} from '../../../store/slices/applicationSlice';

import DottedBackground from '../../../components/DottedBackground';
import { FaBriefcase, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import { C, T } from '../../dashboard/jobloomTokens';

const STATUS_BADGE = {
  open: 'bg-success/20 text-success border-success',
  closed: 'bg-error/10 text-error border-error/30',
  filled: 'bg-info/10 text-info border-info/20',
};

const STAT_COLORS = {
  pending: 'text-warning bg-warning/10',
  reviewed: 'text-info bg-info/10',
  shortlisted: 'text-purple-600 bg-purple-50',
  accepted: 'text-success bg-success/10',
  rejected: 'text-error bg-error/10',
};

const EmployerApplications = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { fetchMyJobs, loading: jobsLoading } = useJobs();
  const jobStatsMap = useSelector(selectJobStatsMap);
  const statsLoading = useSelector(selectApplicationLoading('allJobStats'));

  const [jobs, setJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMyJobs({ includeInactive: true });
        if (!cancelled) {
          setJobs(data);
          const ids = data.map(j => j._id);
          if (ids.length) dispatch(loadAllJobStats(ids));
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesSearch =
      !searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getTotalApplicants = stats => {
    if (!stats) return 0;
    // Backend returns stats.total; avoid double-counting by not summing all values
    if (typeof stats.total === 'number') return stats.total;
    const statusKeys = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];
    return statusKeys.reduce((sum, k) => sum + (stats[k] || 0), 0);
  };

  const isLoading = jobsLoading || statsLoading;

  return (
    <DottedBackground>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className={`rounded-2xl border ${C.border} ${C.bgSurface} shadow-sm overflow-hidden`}>
          <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-primary/10 via-sky-light/20 to-surface">
            <span
              className={`hero-badge-shimmer glass-effect inline-flex items-center gap-2 w-fit mb-2 px-3 py-1.5 ${C.primary} text-[0.62rem] ${T.bold} rounded-full tracking-widest uppercase ${T.body} border border-[color:color-mix(in_srgb,var(--color-sky-light)_60%,transparent)]`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-blue-green)] animate-pulse" />
              {t('employer.dashboard.badge')}
            </span>
            <h1 className={`text-xl sm:text-2xl md:text-[2rem] ${T.bold} text-text-dark mb-2`}>
              {t('employer.applications.list_title')}
            </h1>
            <p className={`text-sm md:text-base text-muted`}>
              {t('employer.applications.list_subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative min-w-0">
            <FaSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
            <input
              type="text"
              placeholder={t('employer.applications.search_jobs_placeholder')}
              aria-label={t('employer.applications.search_jobs_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full min-w-0 pl-10 sm:pl-11 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="w-4 h-4 text-subtle shrink-0" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            >
              <option value="all">{t('employer.applications.filter_all_job_statuses')}</option>
              <option value="open">{t('employer.jobs.filter_open')}</option>
              <option value="closed">{t('employer.jobs.filter_closed')}</option>
              <option value="filled">{t('employer.jobs.filter_filled')}</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16" role="status" aria-live="polite">
            <span className="sr-only">{t('common.loading')}</span>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-surface rounded-xl shadow-sm border border-border px-4 py-10 sm:p-12 text-center">
            <FaBriefcase className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-text-dark mb-2">
              {searchQuery || filterStatus !== 'all'
                ? t('employer.applications.empty_jobs_no_match')
                : t('employer.applications.empty_jobs_none')}
            </h3>
            <p className="text-sm text-muted mb-6">
              {searchQuery || filterStatus !== 'all'
                ? t('employer.applications.empty_jobs_adjust')
                : t('employer.applications.empty_jobs_hint')}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link
                to="/employer/create-job"
                className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors font-medium text-sm sm:text-base"
              >
                <FaBriefcase className="w-4 h-4 mr-2" />
                {t('employer.applications.create_job_cta')}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => {
              const stats = jobStatsMap[job._id];
              const total = getTotalApplicants(stats);

              return (
                <div
                  key={job._id}
                  className="bg-surface rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Job info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1">
                        <h3 className="text-base sm:text-lg font-bold text-text-dark truncate">
                          {job.title}
                        </h3>
                        <span
                          className={`self-start shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize ${STATUS_BADGE[job.status] || 'bg-neutral-100 text-muted border-border'}`}
                        >
                          {job.status === 'open' ||
                          job.status === 'closed' ||
                          job.status === 'filled'
                            ? t(`employer.jobs.filter_${job.status}`)
                            : job.status}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-subtle">
                        {job.jobRole || t('employer.jobs.job_position')} &middot;{' '}
                        {job.employmentType
                          ? t(`employment_types.${job.employmentType}`, {
                              defaultValue: job.employmentType,
                            })
                          : t('employment_types.full_time')}
                      </p>

                      {/* Stats pills */}
                      {stats && total > 0 ? (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                          {Object.entries(stats)
                            .filter(([status]) => status !== 'total')
                            .map(([status, count]) =>
                              count > 0 ? (
                                <span
                                  key={status}
                                  className={`text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full capitalize ${STAT_COLORS[status] || 'text-muted bg-neutral-100'}`}
                                >
                                  {t('employer.applications.stat_pill', {
                                    count,
                                    status: t(`applications.status_${status}`, {
                                      defaultValue: status,
                                    }),
                                  })}
                                </span>
                              ) : null
                            )}
                        </div>
                      ) : (
                        <p className="text-xs text-subtle mt-3">
                          {t('employer.applications.no_applications_for_job')}
                        </p>
                      )}
                    </div>

                    {/* Right side: count + button */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-text-dark">{total}</p>
                        <p className="text-xs text-subtle">
                          {total === 1
                            ? t('employer.applications.applicant_one')
                            : t('employer.applications.applicant_other')}
                        </p>
                      </div>
                      <Link
                        to={`/employer/applications/job/${job._id}`}
                        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors text-sm font-medium"
                      >
                        <FaEye className="w-4 h-4" />
                        {t('employer.applications.view')}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DottedBackground>
  );
};

export default EmployerApplications;

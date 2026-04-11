import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../../hooks/useJobs';
import { loadAllJobStats, selectJobStatsMap } from '../../../store/slices/applicationSlice';

import DottedBackground from '../../../components/DottedBackground';
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaDollarSign,
  FaUsers,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTimesCircle,
  FaCheckCircle,
  FaTrash,
  FaClock,
  FaClipboardList,
} from 'react-icons/fa';
import { getImageUrl } from '../../../utils/imageUrls';
import { C, T } from '../../dashboard/jobloomTokens';

const JobList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { fetchMyJobs, closeJob, markJobAsFilled, deleteJob, loading } = useJobs();
  const jobStatsMap = useSelector(selectJobStatsMap);

  const [jobs, setJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateSort, setDateSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionType, setActionType] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const loadJobs = async () => {
    try {
      const data = await fetchMyJobs();
      setJobs(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (jobs.length) {
      dispatch(loadAllJobStats(jobs.map(j => j._id)));
    }
  }, [dispatch, jobs]);

  const filteredJobs = jobs
    .filter(job => {
      const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
      const matchesSearch =
        searchQuery === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return dateSort === 'oldest' ? aTime - bTime : bTime - aTime;
    });

  const handleAction = (job, action) => {
    setSelectedJob(job);
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    try {
      if (actionType === 'close') {
        await closeJob(selectedJob._id);
        setToast({ type: 'success', message: 'Job closed successfully.' });
      } else if (actionType === 'filled') {
        await markJobAsFilled(selectedJob._id);
        setToast({ type: 'success', message: 'Job marked as filled successfully.' });
      } else if (actionType === 'delete') {
        await deleteJob(selectedJob._id);
        setToast({ type: 'success', message: 'Job deleted successfully.' });
      }

      await loadJobs();
      setShowConfirmDialog(false);
      setSelectedJob(null);
      setActionType('');
    } catch (error) {
      console.error('Error performing action:', error);
      setToast({
        type: 'error',
        message: error?.message || 'Action failed. Please try again.',
      });
      setShowConfirmDialog(false);
    }
  };

  const getStatusBadge = status => {
    const styles = {
      open: 'bg-success/20 text-success border-success',
      closed: 'bg-error/10 text-error border-error/30',
      filled: 'bg-info/10 text-info border-info/20',
    };

    return styles[status] || styles.open;
  };

  const getApplicantCount = jobId => {
    const stats = jobStatsMap[jobId];
    if (!stats || typeof stats !== 'object') return 0;
    if (typeof stats.total === 'number') return stats.total;

    const statusKeys = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];
    return statusKeys.reduce((sum, key) => sum + (stats[key] || 0), 0);
  };

  const getJobTypeColor = type => {
    const colors = {
      'full-time': 'bg-success/10 text-success',
      'part-time': 'bg-info/10 text-info',
      contract: 'bg-purple-100 text-purple-700',
      temporary: 'bg-accent/10 text-accent',
      freelance: 'bg-pink-100 text-pink-700',
    };

    return colors[type] || 'bg-neutral-100 text-muted';
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffTime / (1000 * 60));
        return `Posted ${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      }
      return `Posted ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }

    if (diffDays === 1) {
      return 'Posted 1 day ago';
    }

    return `Posted ${diffDays} days ago`;
  };

  const formatSalary = (amount, type, currency = 'LKR') => {
    if (!amount && amount !== 0) return t('employer.jobs.salary_not_specified');
    if (!type) return `${currency} ${amount.toLocaleString()}`;
    return `${currency} ${amount.toLocaleString()} / ${type}`;
  };

  return (
    <DottedBackground>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
        <section
          className={`rounded-2xl border ${C.border} ${C.bgSurface} shadow-sm overflow-hidden`}
        >
          <div className="p-5 md:p-6 bg-gradient-to-r from-primary/10 via-sky-light/20 to-surface">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <span
                  className={`hero-badge-shimmer glass-effect inline-flex items-center gap-2 w-fit mb-2 px-3 py-1.5 ${C.primary} text-[0.62rem] ${T.bold} rounded-full tracking-widest uppercase ${T.body} border border-[color:color-mix(in_srgb,var(--color-sky-light)_60%,transparent)]`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-blue-green)] animate-pulse" />
                  {t('employer.jobs.badge')}
                </span>
                <h1 className={`${T.xl} md:text-[2rem] ${T.bold} text-text-dark mb-2`}>
                  {t('employer.jobs.title')}
                </h1>
                <p className={`${T.sm} md:text-[var(--text-base)] text-muted`}>
                  {t('employer.jobs.subtitle')}
                </p>
              </div>
              <Link
                to="/employer/create-job"
                className="inline-flex items-center justify-center px-5 py-3 bg-primary text-white rounded-xl hover:bg-deep-blue transition-colors font-medium"
              >
                <FaBriefcase className="w-4 h-4 mr-2" />
                {t('employer.jobs.create_new')}
              </Link>
            </div>
          </div>
        </section>

        <section
          className={`${C.bgSurface} border ${C.border} rounded-2xl p-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between`}
        >
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
            <input
              type="text"
              placeholder={t('employer.jobs.search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <FaFilter className="w-5 h-5 text-subtle" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="all">{t('employer.jobs.filter_all')}</option>
              <option value="open">{t('employer.jobs.filter_open')}</option>
              <option value="closed">{t('employer.jobs.filter_closed')}</option>
              <option value="filled">{t('employer.jobs.filter_filled')}</option>
            </select>
            <select
              value={dateSort}
              onChange={e => setDateSort(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
            <FaBriefcase className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-dark mb-2">
              {t('employer.jobs.no_jobs')}
            </h3>
            <p className="text-muted mb-6">
              {searchQuery ? t('employer.jobs.no_jobs_search') : t('employer.jobs.no_jobs_empty')}
            </p>
            <Link
              to="/employer/create-job"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors font-medium"
            >
              <FaBriefcase className="w-4 h-4 mr-2" />
              {t('employer.jobs.create_first')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <article
                key={job._id}
                onClick={() => navigate(`/employer/jobs/${job._id}`)}
                className="bg-surface rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-neutral-100">
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
                      className={`w-8 h-8 text-subtle ${job.employer?.profileImage ? 'hidden' : 'block'}`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-text-dark mb-1 group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-muted font-medium">
                          {job.jobRole || t('employer.jobs.job_position')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getStatusBadge(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getJobTypeColor(job.employmentType)}`}
                      >
                        {job.employmentType || 'Full-time'}
                      </span>
                      {job.status === 'open' && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-700">
                          Urgently hiring
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted mb-4">
                      {job.location && (job.location.village || job.location.district) && (
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-subtle" />
                          <span>
                            {[job.location.village, job.location.district]
                              .filter(Boolean)
                              .join(', ') || t('employer.jobs.location_not_specified')}
                          </span>
                        </div>
                      )}

                      {(job.salaryAmount || job.salaryType) && (
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="w-4 h-4 text-subtle" />
                          <span>
                            {formatSalary(job.salaryAmount, job.salaryType, job.currency)}
                          </span>
                        </div>
                      )}

                      {job.positions ? (
                        <div className="flex items-center gap-2">
                          <FaUsers className="w-4 h-4 text-subtle" />
                          <span>
                            {job.positions} position{job.positions > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-2">
                        <FaClock className="w-4 h-4 text-subtle" />
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                    </div>

                    <div className="text-sm text-muted mb-4 line-clamp-2">
                      {job.description
                        ? `${job.description.replace(/<[^>]*>/g, '').substring(0, 180)}...`
                        : t('employer.jobs.no_description')}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-neutral-100">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/employer/jobs/${job._id}/edit`);
                        }}
                        className="px-4 py-2 text-sm font-medium text-info hover:bg-info/10 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FaEdit className="w-4 h-4" />
                        {t('common.edit')}
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleAction(job, 'close');
                        }}
                        disabled={job.status !== 'open'}
                        className="px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <FaTimesCircle className="w-4 h-4" />
                        {t('common.close')}
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleAction(job, 'filled');
                        }}
                        disabled={job.status !== 'open'}
                        className="px-4 py-2 text-sm font-medium text-success hover:bg-success/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <FaCheckCircle className="w-4 h-4" />
                        {t('employer.jobs.mark_filled')}
                      </button>

                      <Link
                        to={`/employer/applications/job/${job._id}`}
                        onClick={e => e.stopPropagation()}
                        className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FaClipboardList className="w-4 h-4" />
                        {t('navbar.applications')}
                        {(() => {
                          const count = getApplicantCount(job._id);
                          return count > 0 ? (
                            <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 bg-primary/20 rounded-full">
                              {count}
                            </span>
                          ) : null;
                        })()}
                      </Link>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleAction(job, 'delete');
                        }}
                        className="px-4 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2 ml-auto"
                      >
                        <FaTrash className="w-4 h-4" />
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-2">
              {t('employer.jobs.confirm_action')}
            </h3>
            <p className="text-muted mb-6">
              {t('employer.jobs.confirm_message', {
                action: actionType,
                title: selectedJob?.title || '',
              })}
              {actionType === 'delete' ? ` ${t('employer.jobs.cannot_undo')}` : ''}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-muted hover:bg-surface-muted rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${actionType === 'delete' ? 'bg-error hover:bg-error' : 'bg-primary hover:bg-deep-blue'}`}
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed left-4 bottom-4 z-[60] max-w-sm w-[calc(100%-2rem)] sm:w-auto">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg flex items-start gap-2 text-white ${
              toast.type === 'success' ? 'bg-success' : 'bg-error'
            }`}
          >
            <FaTimesCircle className="w-4 h-4 mt-0.5" />
            <span className="text-sm leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}
    </DottedBackground>
  );
};

export default JobList;

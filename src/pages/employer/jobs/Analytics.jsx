import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../../hooks/useJobs';
import {
  loadAllJobStats,
  selectJobStatsMap,
  selectApplicationLoading,
} from '../../../store/slices/applicationSlice';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FaChartLine, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';

import DottedBackground from '../../../components/DottedBackground';
import { C, T } from '../../dashboard/jobloomTokens';

const STATUS_COLORS = {
  pending: '#f59e0b',
  reviewed: '#3b82f6',
  shortlisted: '#8b5cf6',
  accepted: '#10b981',
  rejected: '#ef4444',
  withdrawn: '#6b7280',
};

const Analytics = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { fetchEmployerStats, fetchMyJobs, loading } = useJobs();
  const jobStatsMap = useSelector(selectJobStatsMap);
  const appStatsLoading = useSelector(selectApplicationLoading('allJobStats'));

  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setError('');
      const data = await fetchEmployerStats();
      setStats(data || null);
    } catch (err) {
      setStats(null);
      setError(err?.message || t('employer.analytics.load_failed'));
    }
  };

  const loadAppStats = async () => {
    try {
      const jobs = await fetchMyJobs({ includeInactive: true });
      if (jobs?.length) {
        dispatch(loadAllJobStats(jobs.map(j => j._id)));
      }
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    loadStats();
    loadAppStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    loadStats();
    loadAppStats();
  };

  const appStatusTotals = useMemo(() => {
    const totals = {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    };
    Object.values(jobStatsMap).forEach(s => {
      if (!s || typeof s !== 'object') return;
      Object.keys(totals).forEach(k => {
        totals[k] += s[k] || 0;
      });
    });
    return totals;
  }, [jobStatsMap]);

  const totalApplications = useMemo(
    () => Object.values(appStatusTotals).reduce((sum, v) => sum + v, 0),
    [appStatusTotals]
  );

  const statusChartData = useMemo(() => {
    const keys = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];
    return keys
      .map(k => ({
        name: t(`applications.status_${k}`),
        value: appStatusTotals[k],
        key: k,
      }))
      .filter(d => d.value > 0);
  }, [appStatusTotals, t]);

  const jobStatsCards = [
    { label: t('employer.analytics.total_jobs'), value: stats?.totalJobs },
    { label: t('employer.analytics.active_openings'), value: stats?.openJobs },
    {
      label: t('employer.analytics.total_applicants'),
      value: totalApplications || stats?.totalApplicants,
    },
    { label: t('employer.analytics.positions_filled'), value: stats?.filledJobs },
  ];

  const appStatusCards = [
    {
      label: t('applications.status_pending'),
      value: appStatusTotals.pending,
      color: STATUS_COLORS.pending,
    },
    {
      label: t('applications.status_reviewed'),
      value: appStatusTotals.reviewed,
      color: STATUS_COLORS.reviewed,
    },
    {
      label: t('applications.status_shortlisted'),
      value: appStatusTotals.shortlisted,
      color: STATUS_COLORS.shortlisted,
    },
    {
      label: t('applications.status_accepted'),
      value: appStatusTotals.accepted,
      color: STATUS_COLORS.accepted,
    },
    {
      label: t('applications.status_rejected'),
      value: appStatusTotals.rejected,
      color: STATUS_COLORS.rejected,
    },
    {
      label: t('applications.status_withdrawn'),
      value: appStatusTotals.withdrawn,
      color: STATUS_COLORS.withdrawn,
    },
  ];

  const jobChartData = [
    { name: t('employer.analytics.total_jobs_short'), value: stats?.totalJobs },
    { name: t('employer.analytics.open_jobs_short'), value: stats?.openJobs },
    {
      name: t('employer.analytics.applicants_short'),
      value: totalApplications || stats?.totalApplicants,
    },
    { name: t('employer.analytics.filled_jobs_short'), value: stats?.filledJobs },
  ].filter(item => typeof item.value === 'number');

  const hasStats = stats && Object.values(stats).some(v => typeof v === 'number');
  const hasJobChartData = jobChartData.length > 0;
  const hasAppData = totalApplications > 0;
  const isAnyLoading = loading || appStatsLoading;

  const renderStatValue = value => {
    if (isAnyLoading) return '--';
    if (typeof value === 'number') return value.toLocaleString();
    return 'N/A';
  };

  const customTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className={`${C.bgSurface} border ${C.border} rounded-lg px-3 py-2 shadow-md`}>
        <p className={`${T.sm} text-muted`}>{payload[0]?.payload?.name}</p>
        <p className={`${T.base} ${T.bold} text-text-dark`}>
          {payload[0]?.value?.toLocaleString()}
        </p>
      </div>
    );
  };

  const pieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <DottedBackground>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className={`rounded-2xl border ${C.border} ${C.bgSurface} shadow-sm overflow-hidden`}>
          <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-primary/10 via-sky-light/20 to-surface">
            <span
              className={`hero-badge-shimmer glass-effect inline-flex items-center gap-2 w-fit mb-2 px-3 py-1.5 ${C.primary} text-[0.62rem] ${T.bold} rounded-full tracking-widest uppercase ${T.body} border border-[color:color-mix(in_srgb,var(--color-sky-light)_60%,transparent)]`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-blue-green)] animate-pulse" />
              {t('employer.dashboard.badge')}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-[2rem] font-bold text-text-dark mb-2 flex items-center gap-3">
              <FaChartLine className="employer-card-gradient-text shrink-0" />
              {t('employer.analytics.title')}
            </h1>
            <p className="text-sm md:text-base text-muted">{t('employer.analytics.subtitle')}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-error mt-1 shrink-0" />
              <div>
                <p className={`${T.base} ${T.semibold} text-error`}>
                  {t('employer.analytics.unable_load')}
                </p>
                <p className={`${T.sm} text-muted`}>{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="px-3 py-2 rounded-lg bg-surface border border-border text-text-dark hover:bg-surface-muted transition-colors inline-flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
            >
              <FaSyncAlt className="w-4 h-4" /> {t('reviews.retry')}
            </button>
          </div>
        )}

        {/* Job overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {jobStatsCards.map((stat, index) => (
            <div
              key={index}
              className="employer-action-card rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-all"
            >
              <p
                className="text-xs sm:text-sm employer-card-gradient-text mb-1"
                style={{ opacity: 0.9 }}
              >
                {stat.label}
              </p>
              <p className="text-2xl sm:text-3xl font-bold employer-card-gradient-text">
                {renderStatValue(stat.value)}
              </p>
            </div>
          ))}
        </div>

        {/* Application status breakdown */}
        <div>
          <h2 className="text-base sm:text-xl font-bold employer-card-gradient-text mb-3 sm:mb-4">
            {t('employer.analytics.app_breakdown_title', 'Application Status Breakdown')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {appStatusCards.map((card, index) => (
              <div
                key={index}
                className="bg-surface rounded-xl shadow-sm border border-border p-3 sm:p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: card.color }}
                  />
                  <p className="text-xs sm:text-sm font-medium text-muted truncate">{card.label}</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-text-dark">
                  {isAnyLoading ? '--' : card.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job overview bar chart */}
          <div className="employer-action-card rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-xl font-bold employer-card-gradient-text mb-4">
              {t('employer.analytics.snapshot_title')}
            </h2>
            {!loading && !hasStats && !error && (
              <p className="text-sm mb-4 employer-card-gradient-text" style={{ opacity: 0.8 }}>
                {t('employer.analytics.no_data')}
              </p>
            )}
            <div className="h-64 sm:h-80">
              {hasJobChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobChartData} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} interval={0} />
                    <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip content={customTooltip} />
                    <Bar dataKey="value" fill="#219ebc" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center rounded-lg bg-[color:color-mix(in_srgb,var(--color-sky-light)_20%,transparent)] employer-card-gradient-text">
                  {loading
                    ? t('employer.analytics.loading_chart')
                    : t('employer.analytics.no_chart')}
                </div>
              )}
            </div>
          </div>

          {/* Application status pie chart */}
          <div className="employer-action-card rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-xl font-bold employer-card-gradient-text mb-4">
              {t('employer.analytics.app_status_chart_title', 'Application Status Distribution')}
            </h2>
            <div className="h-64 sm:h-80">
              {hasAppData && statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={pieLabel}
                      outerRadius="80%"
                      dataKey="value"
                    >
                      {statusChartData.map(entry => (
                        <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                      ))}
                    </Pie>
                    <Tooltip content={customTooltip} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={10}
                      formatter={value => (
                        <span className="text-xs sm:text-sm text-muted">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center rounded-lg bg-[color:color-mix(in_srgb,var(--color-sky-light)_20%,transparent)] employer-card-gradient-text">
                  {appStatsLoading
                    ? t('employer.analytics.loading_chart')
                    : t('employer.analytics.app_no_data', 'No application data to display')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DottedBackground>
  );
};

export default Analytics;

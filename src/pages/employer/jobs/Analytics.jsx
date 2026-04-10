import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../../hooks/useJobs';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { FaChartLine, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';

import DottedBackground from '../../../components/DottedBackground';
import { C, T } from '../../dashboard/jobloomTokens';

const Analytics = () => {
  const { t } = useTranslation();
  const { fetchEmployerStats, loading } = useJobs();
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
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statsCards = [
    {
      label: t('employer.analytics.total_jobs'),
      value: stats?.totalJobs,
    },
    {
      label: t('employer.analytics.active_openings'),
      value: stats?.openJobs,
    },
    {
      label: t('employer.analytics.total_applicants'),
      value: stats?.totalApplicants,
    },
    {
      label: t('employer.analytics.positions_filled'),
      value: stats?.filledJobs,
    },
  ];

  const chartData = [
    { name: t('employer.analytics.total_jobs_short'), value: stats?.totalJobs },
    { name: t('employer.analytics.open_jobs_short'), value: stats?.openJobs },
    { name: t('employer.analytics.applicants_short'), value: stats?.totalApplicants },
    { name: t('employer.analytics.filled_jobs_short'), value: stats?.filledJobs },
  ].filter(item => typeof item.value === 'number');

  const hasStats = stats && Object.values(stats).some(v => typeof v === 'number');
  const hasChartData = chartData.length > 0;

  const renderStatValue = value => {
    if (loading) return '--';
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

  return (
    <DottedBackground>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className={`rounded-2xl border ${C.border} ${C.bgSurface} shadow-sm overflow-hidden`}>
          <div className="p-5 md:p-6 bg-gradient-to-r from-primary/10 via-sky-light/20 to-surface">
            <span
              className={`hero-badge-shimmer glass-effect inline-flex items-center gap-2 w-fit mb-2 px-3 py-1.5 ${C.primary} text-[0.62rem] ${T.bold} rounded-full tracking-widest uppercase ${T.body} border border-[color:color-mix(in_srgb,var(--color-sky-light)_60%,transparent)]`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-blue-green)] animate-pulse" />
              {t('employer.dashboard.badge')}
            </span>
            <h1 className="text-2xl md:text-[2rem] font-bold text-text-dark mb-2 flex items-center gap-3">
              <FaChartLine className="employer-card-gradient-text" />
              {t('employer.analytics.title')}
            </h1>
            <p className="text-sm md:text-base text-muted">{t('employer.analytics.subtitle')}</p>
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-error mt-1" />
              <div>
                <p className={`${T.base} ${T.semibold} text-error`}>
                  {t('employer.analytics.unable_load')}
                </p>
                <p className={`${T.sm} text-muted`}>{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadStats}
              className="px-3 py-2 rounded-lg bg-surface border border-border text-text-dark hover:bg-surface-muted transition-colors inline-flex items-center gap-2"
            >
              <FaSyncAlt className="w-4 h-4" /> {t('reviews.retry')}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            return (
              <div
                key={index}
                className="employer-action-card rounded-xl shadow-sm p-6 hover:shadow-md transition-all"
              >
                <p className="text-sm employer-card-gradient-text mb-1" style={{ opacity: 0.9 }}>
                  {stat.label}
                </p>
                <p className="text-3xl font-bold employer-card-gradient-text">
                  {renderStatValue(stat.value)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="employer-action-card rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold employer-card-gradient-text mb-4">
            {t('employer.analytics.snapshot_title')}
          </h2>
          {!loading && !hasStats && !error && (
            <p className="text-sm mb-4 employer-card-gradient-text" style={{ opacity: 0.8 }}>
              {t('employer.analytics.no_data')}
            </p>
          )}
          <div className="h-80">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip content={customTooltip} />
                  <Bar dataKey="value" fill="#219ebc" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg bg-[color:color-mix(in_srgb,var(--color-sky-light)_20%,transparent)] employer-card-gradient-text">
                {loading ? t('employer.analytics.loading_chart') : t('employer.analytics.no_chart')}
              </div>
            )}
          </div>
        </div>
      </div>
    </DottedBackground>
  );
};

export default Analytics;

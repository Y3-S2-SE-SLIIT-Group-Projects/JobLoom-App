import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../../hooks/useJobs';
import { loadAllJobStats, selectJobStatsMap } from '../../../store/slices/applicationSlice';

import DottedBackground from '../../../components/DottedBackground';
import { C, T } from '../../dashboard/jobloomTokens';
import createJobImg from '../../../assets/images/create-job.svg';
import myJobsImg from '../../../assets/images/employer-illustration.svg';
import applicationListImg from '../../../assets/images/application-list.svg';
import profileImg from '../../../assets/images/profile.svg';

const EmployerDashboard = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { fetchMyJobs } = useJobs();
  const jobStatsMap = useSelector(selectJobStatsMap);

  const totalApplications = useMemo(() => {
    return Object.values(jobStatsMap).reduce((sum, stats) => {
      if (!stats || typeof stats !== 'object') return sum;
      if (typeof stats.total === 'number') return sum + stats.total;
      const statusKeys = [
        'pending',
        'reviewed',
        'shortlisted',
        'accepted',
        'rejected',
        'withdrawn',
      ];
      return sum + statusKeys.reduce((s, k) => s + (stats[k] || 0), 0);
    }, 0);
  }, [jobStatsMap]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const jobs = await fetchMyJobs({ includeInactive: true });
        if (!cancelled && jobs?.length) {
          dispatch(loadAllJobStats(jobs.map(j => j._id)));
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leftCards = [
    {
      title: t('employer.dashboard.quick_create_job'),
      description: t('employer.dashboard.quick_create_job_desc'),
      link: '/employer/create-job',
      image: createJobImg,
    },
    {
      title: t('employer.dashboard.quick_my_jobs'),
      description: t('employer.dashboard.quick_my_jobs_desc'),
      link: '/employer/my-jobs',
      image: myJobsImg,
    },
  ];

  const rightCards = [
    {
      title: t('employer.dashboard.info_profile'),
      description: t('employer.dashboard.info_profile_desc'),
      link: '/profile',
      image: profileImg,
    },
    {
      title: t('employer.dashboard.quick_applications'),
      description: t('employer.dashboard.quick_applications_desc'),
      link: '/employer/applications',
      image: applicationListImg,
    },
  ];

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
            <h1 className={`${T.xl} md:text-[2rem] font-bold text-text-dark leading-tight mb-2`}>
              {t('employer.dashboard.title')}
            </h1>
            <p className={`${T.sm} text-muted max-w-3xl`}>{t('employer.dashboard.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {leftCards.map((card, index) => (
              <Link
                key={index}
                to={card.link}
                className="block employer-action-card rounded-2xl shadow-lg p-5 sm:p-8 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="w-full max-w-[9rem] sm:w-36 aspect-square sm:h-36 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden mx-auto sm:mx-0">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold employer-card-gradient-text mb-2 transition-opacity break-words leading-snug">
                      {card.title}
                    </h3>
                    <p
                      className="mb-0 sm:mb-4 text-base sm:text-lg employer-card-gradient-text break-words leading-relaxed"
                      style={{ opacity: 0.9 }}
                    >
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="space-y-6">
            {rightCards.map((card, index) => {
              const isApplications = card.link === '/employer/applications';
              const description =
                isApplications && totalApplications > 0
                  ? t('employer.dashboard.quick_applications_desc_count', {
                      count: totalApplications,
                    })
                  : card.description;

              return (
                <Link
                  key={index}
                  to={card.link}
                  className="block employer-action-card rounded-2xl shadow-lg p-5 sm:p-8 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <div className="w-full max-w-[9rem] sm:w-36 aspect-square sm:h-36 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden mx-auto sm:mx-0">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold employer-card-gradient-text mb-2 transition-opacity break-words leading-snug">
                        {card.title}
                      </h3>
                      <p
                        className="mb-0 sm:mb-4 text-base sm:text-lg employer-card-gradient-text break-words leading-relaxed"
                        style={{ opacity: 0.9 }}
                      >
                        {description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DottedBackground>
  );
};

export default EmployerDashboard;

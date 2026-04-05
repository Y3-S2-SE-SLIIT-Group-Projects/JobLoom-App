import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../../hooks/useJobs';
import { loadAllJobStats, selectJobStatsMap } from '../../../store/slices/applicationSlice';

import DottedBackground from '../../../components/DottedBackground';
import { FaArrowRight, FaUserCircle } from 'react-icons/fa';
import { C, T } from '../../dashboard/jobloomTokens';
import createJobImg from '../../../assets/images/create-job.png';
import myJobsImg from '../../../assets/images/employer-illustration.svg';
import applicationListImg from '../../../assets/images/application-list.png';

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

  const quickActions = [
    {
      title: t('employer.dashboard.quick_create_job'),
      description: t('employer.dashboard.quick_create_job_desc'),
      link: '/employer/create-job',
      bgColor: 'bg-primary',
      textColor: 'text-white',
      image: createJobImg,
    },
    {
      title: t('employer.dashboard.quick_my_jobs'),
      description: t('employer.dashboard.quick_my_jobs_desc'),
      link: '/employer/my-jobs',
      bgColor: 'bg-success',
      textColor: 'text-white',
      image: myJobsImg,
    },
    {
      title: t('employer.dashboard.quick_applications'),
      description: t('employer.dashboard.quick_applications_desc'),
      link: '/employer/applications',
      bgColor: 'bg-info',
      textColor: 'text-white',
      image: applicationListImg,
    },
  ];

  const infoCards = [
    {
      title: t('employer.dashboard.info_profile'),
      description: t('employer.dashboard.info_profile_desc'),
      icon: FaUserCircle,
      color: 'text-muted',
      linkColor: 'text-muted',
      link: '/profile',
    },
  ];

  return (
    <DottedBackground>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className={`rounded-3xl border ${C.border} ${C.bgSurface} shadow-sm overflow-hidden`}>
          <div className="p-8 md:p-10 bg-gradient-to-r from-primary/10 via-sky-light/20 to-surface">
            <p className={`${T.sm} ${T.bold} tracking-widest uppercase text-primary mb-2`}>
              {t('employer.dashboard.badge')}
            </p>
            <h1
              className={`${T['2xl']} md:text-[2.6rem] font-bold text-text-dark leading-tight mb-3`}
            >
              {t('employer.dashboard.title')}
            </h1>
            <p className={`${T.base} text-muted max-w-3xl`}>{t('employer.dashboard.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {quickActions.map((action, index) => {
              const isApplications = action.link === '/employer/applications';
              const description =
                isApplications && totalApplications > 0
                  ? t('employer.dashboard.quick_applications_desc_count', {
                      count: totalApplications,
                    })
                  : action.description;

              return (
                <Link
                  key={index}
                  to={action.link}
                  className={`block ${action.bgColor} rounded-2xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden`}
                >
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-32 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                      <img
                        src={action.image}
                        alt={action.title}
                        className="w-full h-full object-contain p-3"
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-2xl font-bold ${action.textColor} mb-2 group-hover:opacity-90 transition-opacity`}
                      >
                        {action.title}
                      </h3>
                      <p className={`${action.textColor}/90 mb-4 text-lg`}>{description}</p>
                      <div
                        className={`flex items-center ${action.textColor} font-medium group-hover:translate-x-2 transition-transform`}
                      >
                        {t('employer.dashboard.get_started')}
                        <FaArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="space-y-4">
            {infoCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Link
                  key={index}
                  to={card.link}
                  className={`block ${C.bgSurface} rounded-xl shadow-sm border-l-4 ${C.border} p-6 hover:shadow-md hover:border-primary transition-all cursor-pointer group`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 ${card.color} bg-opacity-10 rounded-lg flex items-center justify-center`}
                    >
                      <IconComponent className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-dark mb-1">{card.title}</h4>
                      <p className="text-sm text-muted mb-3">{card.description}</p>
                      <div
                        className={`flex items-center ${card.linkColor} font-medium text-sm group-hover:translate-x-1 transition-transform`}
                      >
                        {t('employer.dashboard.view_more')}
                        <FaArrowRight className="w-4 h-4 ml-1" />
                      </div>
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

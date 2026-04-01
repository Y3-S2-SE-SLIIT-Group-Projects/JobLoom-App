import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useJobs } from '../../../hooks/useJobs';
import { loadAllJobStats, selectJobStatsMap } from '../../../store/slices/applicationSlice';

import DottedBackground from '../../../components/DottedBackground';
import { FaArrowRight, FaUserCircle, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import createJobImg from '../../../assets/images/create-job.png';
import myJobsImg from '../../../assets/images/employer-illustration.svg';
import applicationListImg from '../../../assets/images/application-list.png';

const EmployerDashboard = () => {
  const dispatch = useDispatch();
  const { fetchEmployerStats, fetchMyJobs } = useJobs();
  const jobStatsMap = useSelector(selectJobStatsMap);
  const totalApplications = useMemo(() => {
    return Object.values(jobStatsMap).reduce((sum, stats) => {
      if (!stats || typeof stats !== 'object') return sum;
      // Backend returns stats.total; avoid double-counting by not summing all values
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

  const loadStats = async () => {
    try {
      await fetchEmployerStats();
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const jobs = await fetchMyJobs({ includeInactive: true });
        if (!cancelled && jobs?.length) {
          dispatch(loadAllJobStats(jobs.map(j => j._id)));
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quickActions = [
    {
      title: 'Create New Job',
      description: 'Post a new job opening and find the perfect candidates',
      link: '/employer/create-job',
      bgColor: 'bg-primary',
      textColor: 'text-white',
      image: createJobImg,
    },
    {
      title: 'My Job Listings',
      description: 'View and manage all your active job postings',
      link: '/employer/my-jobs',
      bgColor: 'bg-success',
      textColor: 'text-white',
      image: myJobsImg,
    },
    {
      title: 'Applications',
      description: 'Review and manage job applications from candidates',
      link: '/employer/applications',
      bgColor: 'bg-info',
      textColor: 'text-white',
      image: applicationListImg,
    },
  ];

  const infoCards = [
    {
      title: 'Analytics',
      description: 'Check your task progress and overall team activity.',
      icon: FaChartBar,
      color: 'text-primary',
      borderColor: 'border-l-primary',
      linkColor: 'text-primary',
      link: '/employer/analytics',
    },
    {
      title: 'Profile',
      description: 'Update your profile or sign out of your account.',
      icon: FaUserCircle,
      color: 'text-muted',
      borderColor: 'border-l-muted',
      linkColor: 'text-muted',
      link: '/profile',
    },
    {
      title: 'Calendly',
      description: 'Connect Calendly to schedule interviews seamlessly.',
      icon: FaCalendarAlt,
      color: 'text-success',
      borderColor: 'border-l-success',
      linkColor: 'text-success',
      link: '/employer/settings/calendly',
    },
  ];

  return (
    <DottedBackground>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-2">Dashboard</h1>
          <p className="text-lg text-muted">Your central control surface</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Feature Cards */}
          <div className="lg:col-span-2 space-y-6">
            {quickActions.map((action, index) => {
              const isApplications = action.link === '/employer/applications';
              const description =
                isApplications && totalApplications > 0
                  ? `Review and manage ${totalApplications} application${totalApplications !== 1 ? 's' : ''} from candidates`
                  : action.description;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className={`block ${action.bgColor} rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 group overflow-hidden`}
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
                        Get started
                        <FaArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-4">
            {infoCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Link
                  key={index}
                  to={card.link}
                  className="block bg-surface rounded-xl shadow-sm border-l-4 border-border p-6 hover:shadow-md hover:border-primary transition-all cursor-pointer group"
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
                        View more
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

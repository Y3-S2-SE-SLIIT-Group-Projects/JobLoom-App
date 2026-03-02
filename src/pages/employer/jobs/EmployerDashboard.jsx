import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../../contexts/JobContext';

import DottedBackground from '../../../components/DottedBackground';
import { FaArrowRight, FaUserCircle, FaChartBar } from 'react-icons/fa';
import createJobImg from '../../../assets/images/create-job.png';
import myJobsImg from '../../../assets/images/my-jobs.png';
import applicationListImg from '../../../assets/images/application-list.png';

const EmployerDashboard = () => {
  const { fetchEmployerStats } = useJobs();

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

  const quickActions = [
    {
      title: 'Create New Job',
      description: 'Post a new job opening and find the perfect candidates',
      link: '/employer/create-job',
      bgColor: 'bg-[#6794D1]',
      textColor: 'text-white',
      image: createJobImg,
    },
    {
      title: 'My Job Listings',
      description: 'View and manage all your active job postings',
      link: '/employer/my-jobs',
      bgColor: 'bg-[#2CD2BD]',
      textColor: 'text-white',
      image: myJobsImg,
    },
    {
      title: 'Applications',
      description: 'Review and manage job applications from candidates',
      link: '/employer/applications',
      bgColor: 'bg-[#A68BF9]',
      textColor: 'text-white',
      image: applicationListImg,
    },
  ];

  const infoCards = [
    {
      title: 'Analytics',
      description: 'Check your task progress and overall team activity.',
      icon: FaChartBar,
      color: 'text-[#6794D1]',
      borderColor: 'border-l-[#6794D1]',
      linkColor: 'text-[#6794D1]',
      link: '/employer/analytics',
    },
    {
      title: 'Profile',
      description: 'Update your profile or sign out of your account.',
      icon: FaUserCircle,
      color: 'text-[#516876]',
      borderColor: 'border-l-[#516876]',
      linkColor: 'text-[#516876]',
      link: '/profile',
    },
  ];

  return (
    <DottedBackground>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2B373F] mb-2">Dashboard</h1>
          <p className="text-lg text-[#516876]">Your central control surface</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Feature Cards */}
          <div className="lg:col-span-2 space-y-6">
            {quickActions.map((action, index) => (
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
                    <p className={`${action.textColor}/90 mb-4 text-lg`}>{action.description}</p>
                    <div
                      className={`flex items-center ${action.textColor} font-medium group-hover:translate-x-2 transition-transform`}
                    >
                      Get started
                      <FaArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-4">
            {infoCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Link
                  key={index}
                  to={card.link}
                  className="block bg-white rounded-xl shadow-sm border-l-4 border-[#D2D5D9] p-6 hover:shadow-md hover:border-[#6794D1] transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 ${card.color} bg-opacity-10 rounded-lg flex items-center justify-center`}
                    >
                      <IconComponent className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#2B373F] mb-1">{card.title}</h4>
                      <p className="text-sm text-[#516876] mb-3">{card.description}</p>
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

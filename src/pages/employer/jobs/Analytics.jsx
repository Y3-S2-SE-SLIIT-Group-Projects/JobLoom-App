import { useEffect, useState } from 'react';
import { useJobs } from '../../../contexts/JobContext';

import DottedBackground from '../../../components/DottedBackground';
import {
  FaBriefcase,
  FaFileAlt,
  FaUsers,
  FaCheckCircle,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';

const Analytics = () => {
  const { fetchEmployerStats, loading } = useJobs();
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    try {
      const data = await fetchEmployerStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statsCards = [
    {
      label: 'Total Jobs Posted',
      value: stats?.totalJobs || 0,
      icon: FaBriefcase,
      gradient: 'from-[#6794D1] to-[#5a83c0]',
      change: '+12%',
      trend: 'up',
    },
    {
      label: 'Active Openings',
      value: stats?.openJobs || 0,
      icon: FaFileAlt,
      gradient: 'from-teal-500 to-teal-600',
      change: '+5%',
      trend: 'up',
    },
    {
      label: 'Total Applicants',
      value: stats?.totalApplicants || 0,
      icon: FaUsers,
      gradient: 'from-purple-500 to-purple-600',
      change: '+23%',
      trend: 'up',
    },
    {
      label: 'Positions Filled',
      value: stats?.filledJobs || 0,
      icon: FaCheckCircle,
      gradient: 'from-green-500 to-green-600',
      change: '+8%',
      trend: 'up',
    },
  ];

  return (
    <DottedBackground>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2B373F] mb-2 flex items-center gap-3">
            <FaChartLine className="text-[#6794D1]" />
            Analytics Dashboard
          </h1>
          <p className="text-lg text-[#516876]">Track your job posting performance and insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center shadow-lg`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-[#2CD2BD]' : 'text-red-600'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <FaArrowUp className="w-3 h-3" />
                    ) : (
                      <FaArrowDown className="w-3 h-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-sm text-[#516876] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[#2B373F]">{loading ? '--' : stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Additional Analytics Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
            <h3 className="text-xl font-bold text-[#2B373F] mb-4">Job Performance</h3>
            <div className="h-64 flex items-center justify-center text-[#516876]">
              <p>Chart visualization coming soon...</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-[#D2D5D9] p-6">
            <h3 className="text-xl font-bold text-[#2B373F] mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-[#F4F6F9] rounded-lg">
                <FaBriefcase className="w-5 h-5 text-[#6794D1] mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2B373F]">New job posted</p>
                  <p className="text-xs text-[#516876]">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#F4F6F9] rounded-lg">
                <FaUsers className="w-5 h-5 text-[#A68BF9] mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2B373F]">5 new applicants</p>
                  <p className="text-xs text-[#516876]">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#F4F6F9] rounded-lg">
                <FaCheckCircle className="w-5 h-5 text-[#2CD2BD] mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2B373F]">Position filled</p>
                  <p className="text-xs text-[#516876]">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DottedBackground>
  );
};

export default Analytics;

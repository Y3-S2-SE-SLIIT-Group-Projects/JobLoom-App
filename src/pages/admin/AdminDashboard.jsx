import { useState, useEffect } from 'react';
import {
  FaUsers,
  FaBriefcase,
  FaFileAlt,
  FaChartLine,
  FaUserPlus,
  FaRegCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaShieldAlt,
  FaArrowRight,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaDownload,
  FaCog,
  FaTrophy,
  FaRocket,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../services/adminApi';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ActionButton from '../../components/ui/ActionButton';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <FaExclamationCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-8 max-w-md">{error}</p>
        <ActionButton variant="primary" onClick={() => window.location.reload()}>
          Reload Dashboard
        </ActionButton>
      </div>
    );
  }

  const { overview, recentUsers, recentJobs, categoryStats, provinceStats } = stats;

  return (
    <div className="min-h-screen bg-surface-muted pb-12">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 via-sky-light/20 to-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <FaShieldAlt className="text-primary" />
                <span className="text-primary">Admin Dashboard</span>
              </div>
              <h1 className="text-3xl font-bold text-text-dark mb-2">Dashboard Overview</h1>
              <p className="text-muted text-base">
                Monitor platform performance and manage system resources
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-5 py-3 bg-surface rounded-xl border border-border text-center shadow-sm">
                <p className="text-muted text-xs uppercase font-semibold mb-1">Verification</p>
                <p className="text-2xl font-bold text-primary">{overview.verificationRate}%</p>
              </div>
              <div className="px-5 py-3 bg-surface rounded-xl border border-border text-center shadow-sm">
                <p className="text-muted text-xs uppercase font-semibold mb-1">Avg Apps</p>
                <p className="text-2xl font-bold text-primary">{overview.avgApplications}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={FaUsers}
            title="Total Users"
            value={overview.totalUsers}
            trend="up"
            trendValue="+12%"
            color="blue"
            delay={0}
          />
          <StatCard
            icon={FaBriefcase}
            title="Active Jobs"
            value={overview.totalJobs}
            trend="up"
            trendValue="+8%"
            color="green"
            delay={100}
          />
          <StatCard
            icon={FaFileAlt}
            title="Total Applications"
            value={overview.totalApplications}
            trend="up"
            trendValue="+15%"
            color="purple"
            delay={200}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FaCog className="text-primary w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-text-dark">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <Link
                  to="/admin/users"
                  className="flex items-center justify-between p-4 bg-surface-muted/30 rounded-lg hover:bg-primary/5 hover:border-primary border border-border transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-surface rounded-lg flex items-center justify-center text-primary border border-border">
                      <FaUsers className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-text-dark">User Control</span>
                  </div>
                  <FaArrowRight className="text-muted w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/admin/jobs"
                  className="flex items-center justify-between p-4 bg-surface-muted/30 rounded-lg hover:bg-primary/5 hover:border-primary border border-border transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-surface rounded-lg flex items-center justify-center text-primary border border-border">
                      <FaBriefcase className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-text-dark">Job Audit</span>
                  </div>
                  <FaArrowRight className="text-muted w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="flex items-center justify-between p-4 bg-surface-muted/30 rounded-lg hover:bg-primary/5 hover:border-primary border border-border transition-all group w-full text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-surface rounded-lg flex items-center justify-center text-primary border border-border">
                      <FaDownload className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-text-dark">Export Report</span>
                  </div>
                  <FaArrowRight className="text-muted w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Geographical Distribution */}
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <FaMapMarkerAlt className="text-orange-500 w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-text-dark">Top Provinces</h3>
              </div>
              <div className="space-y-3">
                {provinceStats.map((stat, idx) => (
                  <div key={stat._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted w-4">0{idx + 1}</span>
                      <span className="text-sm font-semibold text-text-dark">
                        {stat._id || 'Unknown'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-md border border-orange-100">
                      {stat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Stats */}
          <div className="lg:col-span-2 bg-surface rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FaLayerGroup className="text-primary w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-text-dark">Market Categories</h3>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Distribution
                </span>
              </div>
            </div>

            <div className="space-y-5">
              {categoryStats.map(stat => (
                <div key={stat._id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-dark group-hover:text-primary transition-colors">
                      {stat._id.charAt(0).toUpperCase() + stat._id.slice(1).replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-bold text-text-dark">{stat.count}</span>
                  </div>
                  <div className="h-3 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary group-hover:bg-deep-blue transition-all duration-1000 origin-left"
                      style={{
                        width: `${(stat.count / Math.max(...categoryStats.map(s => s.count))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
              <h2 className="text-base font-bold text-text-dark flex items-center gap-2">
                <FaUserPlus className="text-primary w-4 h-4" />
                Recent Users
              </h2>
              <Link
                to="/admin/users"
                className="text-primary text-xs font-bold uppercase tracking-wider hover:text-deep-blue"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentUsers.map(user => (
                <div
                  key={user._id}
                  className="p-4 flex items-center gap-3 hover:bg-surface-muted/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 group-hover:border-primary transition-all">
                    <div className="w-full h-full rounded-full bg-surface-muted flex items-center justify-center font-bold text-primary overflow-hidden text-sm">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-dark truncate leading-tight group-hover:text-primary transition-colors">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                        user.role === 'employer'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          : user.role === 'admin'
                            ? 'bg-purple-50 text-purple-600 border-purple-100'
                            : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}
                    >
                      {user.role === 'job_seeker' ? 'Seeker' : user.role}
                    </span>
                    <p className="text-xs text-muted font-medium mt-1.5 opacity-60">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
              <h2 className="text-base font-bold text-text-dark flex items-center gap-2">
                <FaBriefcase className="text-emerald-500 w-4 h-4" />
                Recent Jobs
              </h2>
              <Link
                to="/admin/jobs"
                className="text-primary text-xs font-bold uppercase tracking-wider hover:text-deep-blue"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentJobs.map(job => (
                <div
                  key={job._id}
                  className="p-4 flex items-center gap-3 hover:bg-surface-muted/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <FaBriefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-dark truncate leading-tight group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                      {job.title}
                    </p>
                    <p className="text-xs text-muted truncate mt-0.5 font-medium">
                      {job.employerId?.companyName || 'Company'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        job.status === 'open'
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}
                    >
                      {job.status}
                    </span>
                    <p className="text-xs text-muted font-medium mt-1.5 opacity-60">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

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
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../services/adminApi';

const StatCard = props => {
  const { icon: IconComponent, label, value, subtext, colorClass, bgColorClass, trend } = props;
  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div
        className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-500 ${bgColorClass}`}
      />
      <div className="flex items-start justify-between relative z-10">
        <div className={`p-3 rounded-xl ${bgColorClass}`}>
          <IconComponent className={`w-6 h-6 ${colorClass}`} />
        </div>
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
          >
            {trend > 0 ? `+${trend}%` : trend}
          </span>
        )}
      </div>
      <div className="mt-4 relative z-10">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-3xl font-black text-text-dark">{value}</h3>
        {subtext && <p className="text-[10px] text-muted mt-2 font-medium">{subtext}</p>}
      </div>
    </div>
  );
};

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 border-4 border-primary rounded-full border-t-transparent animate-spin mb-4" />
        <p className="text-muted font-medium animate-pulse">Aggregating system intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <FaExclamationCircle className="w-10 h-10 text-error" />
        </div>
        <h2 className="text-2xl font-bold text-text-dark mb-2">Operational Interruption</h2>
        <p className="text-muted mb-8 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-deep-blue shadow-lg shadow-primary/20 transition-all"
        >
          Initialize Refresh
        </button>
      </div>
    );
  }

  const { overview, recentUsers, recentJobs, categoryStats, provinceStats } = stats;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Hero Banner Section */}
      <div className="bg-deep-blue text-white pt-12 pb-24 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/10">
                <FaShieldAlt className="text-primary" /> Admin Command Center
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                System Overview
              </h1>
              <p className="text-white/60 text-lg max-w-2xl font-medium">
                Monitoring platform health, user engagement, and job market trends in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-5 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
                <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1">
                  User Verification
                </p>
                <p className="text-2xl font-black text-primary">{overview.verificationRate}%</p>
              </div>
              <div className="px-5 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
                <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1">
                  App Density
                </p>
                <p className="text-2xl font-black text-indigo-400">{overview.avgApplications}x</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={FaUsers}
            label="Active Users"
            value={overview.totalUsers.toLocaleString()}
            subtext="Total registered accounts"
            colorClass="text-blue-600"
            bgColorClass="bg-blue-600"
            trend={12}
          />
          <StatCard
            icon={FaBriefcase}
            label="Active Jobs"
            value={overview.totalJobs.toLocaleString()}
            subtext="Current open opportunities"
            colorClass="text-emerald-600"
            bgColorClass="bg-emerald-600"
            trend={8}
          />
          <StatCard
            icon={FaFileAlt}
            label="Applications"
            value={overview.totalApplications.toLocaleString()}
            subtext="Candidate submissions"
            colorClass="text-violet-600"
            bgColorClass="bg-violet-600"
            trend={15}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
              <h3 className="text-md font-black text-text-dark mb-6 flex items-center gap-2">
                <FaCog className="text-primary" /> Management
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/admin/users"
                  className="flex items-center justify-between p-4 bg-surface-muted/30 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-primary border border-border group-hover:scale-110 transition-transform">
                      <FaUsers />
                    </div>
                    <span className="font-bold text-sm text-text-dark">User Control</span>
                  </div>
                  <FaArrowRight className="text-muted w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/admin/jobs"
                  className="flex items-center justify-between p-4 bg-surface-muted/30 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-emerald-600 border border-border group-hover:scale-110 transition-transform">
                      <FaBriefcase />
                    </div>
                    <span className="font-bold text-sm text-text-dark">Job Audit</span>
                  </div>
                  <FaArrowRight className="text-muted w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="flex items-center justify-between p-4 bg-surface-muted/30 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group w-full text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-violet-600 border border-border group-hover:scale-110 transition-transform">
                      <FaDownload />
                    </div>
                    <span className="font-bold text-sm text-text-dark">Export Report</span>
                  </div>
                  <FaArrowRight className="text-muted w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Geographical Distribution */}
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
              <h3 className="text-md font-black text-text-dark mb-6 flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-500" /> Top Provinces
              </h3>
              <div className="space-y-4">
                {provinceStats.map((stat, idx) => (
                  <div key={stat._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-muted w-4">0{idx + 1}</span>
                      <span className="text-sm font-bold text-text-dark">
                        {stat._id || 'Unknown'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-black rounded-md border border-orange-100">
                      {stat.count} JOBS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trending Categories Chart */}
          <div className="lg:col-span-2 bg-surface rounded-2xl shadow-sm border border-border p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-text-dark flex items-center gap-2">
                <FaLayerGroup className="text-primary" /> Market Category Demands
              </h3>
              <div className="flex gap-2">
                <span className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  Jobs vs Industry
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {categoryStats.map(stat => (
                <div key={stat._id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-text-dark group-hover:text-primary transition-colors">
                      {stat._id.charAt(0).toUpperCase() + stat._id.slice(1).replace('_', ' ')}
                    </span>
                    <span className="text-sm font-black text-text-dark">{stat.count}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users List */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-white">
              <h2 className="text-lg font-black text-text-dark flex items-center gap-2">
                <FaUserPlus className="text-primary" />
                New Talent
              </h2>
              <Link
                to="/admin/users"
                className="text-primary text-xs font-black uppercase tracking-wider hover:text-deep-blue"
              >
                Directory
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentUsers.map(user => (
                <div
                  key={user._id}
                  className="p-5 flex items-center gap-4 hover:bg-surface-muted/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-primary/20 p-0.5 group-hover:border-primary transition-all">
                    <div className="w-full h-full rounded-full bg-surface-muted flex items-center justify-center font-black text-primary overflow-hidden">
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
                    <p className="text-sm font-black text-text-dark truncate leading-tight group-hover:text-primary transition-colors">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                        user.role === 'employer'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}
                    >
                      {user.role}
                    </span>
                    <p className="text-[10px] text-muted font-bold mt-1.5 uppercase tracking-tighter opacity-50">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Jobs List */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-white">
              <h2 className="text-lg font-black text-text-dark flex items-center gap-2">
                <FaBriefcase className="text-emerald-500" />
                Latest Market Openings
              </h2>
              <Link
                to="/admin/jobs"
                className="text-primary text-xs font-black uppercase tracking-wider hover:text-deep-blue"
              >
                Audit
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentJobs.map(job => (
                <div
                  key={job._id}
                  className="p-5 flex items-center gap-4 hover:bg-surface-muted/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <FaBriefcase />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-text-dark truncate leading-tight group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                      {job.title}
                    </p>
                    <p className="text-xs text-muted truncate mt-0.5 font-bold">
                      {job.employerId?.companyName || 'Private Employer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        job.status === 'open'
                          ? 'bg-green-500 text-white shadow-sm shadow-green-200'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}
                    >
                      {job.status}
                    </span>
                    <p className="text-[10px] text-muted font-bold mt-2 uppercase tracking-tighter opacity-50">
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

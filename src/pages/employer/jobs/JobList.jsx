import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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

const JobList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { fetchMyJobs, closeJob, markJobAsFilled, deleteJob, loading } = useJobs();
  const jobStatsMap = useSelector(selectJobStatsMap);
  const [jobs, setJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionType, setActionType] = useState('');

  const loadJobs = async () => {
    try {
      const data = await fetchMyJobs();
      setJobs(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (jobs.length) dispatch(loadAllJobStats(jobs.map(j => j._id)));
  }, [dispatch, jobs]);

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
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
      } else if (actionType === 'filled') {
        await markJobAsFilled(selectedJob._id);
      } else if (actionType === 'delete') {
        await deleteJob(selectedJob._id);
      }
      await loadJobs();
      setShowConfirmDialog(false);
      setSelectedJob(null);
      setActionType('');
    } catch (error) {
      console.error('Error performing action:', error);
      setShowConfirmDialog(false);
    }
  };

  const getStatusBadge = status => {
    const styles = {
      open: 'bg-[#2CD2BD]/20 text-[#2CD2BD] border-[#2CD2BD]',
      closed: 'bg-red-100 text-red-700 border-red-200',
      filled: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return styles[status] || styles.open;
  };

  const getApplicantCount = jobId => {
    const stats = jobStatsMap[jobId];
    if (!stats || typeof stats !== 'object') return 0;
    // Backend returns stats.total; avoid double-counting by not summing all values
    if (typeof stats.total === 'number') return stats.total;
    const statusKeys = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];
    return statusKeys.reduce((s, k) => s + (stats[k] || 0), 0);
  };

  const getJobTypeColor = type => {
    const colors = {
      'full-time': 'bg-green-100 text-green-700',
      'part-time': 'bg-blue-100 text-blue-700',
      contract: 'bg-purple-100 text-purple-700',
      temporary: 'bg-orange-100 text-orange-700',
      freelance: 'bg-pink-100 text-pink-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
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
    } else if (diffDays === 1) {
      return 'Posted 1 day ago';
    } else {
      return `Posted ${diffDays} days ago`;
    }
  };

  const formatSalary = (amount, type, currency = 'LKR') => {
    // Handle optional salary fields
    if (!amount || amount === undefined || amount === null) {
      return 'Salary not specified';
    }
    if (!type || type === undefined || type === null) {
      return `${currency} ${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()} / ${type}`;
  };

  return (
    <DottedBackground>
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Build Your Dream Team</h1>
          <p className="text-lg text-gray-600 mb-8">Post Jobs and Reach Qualified Candidates</p>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search job title or keyword"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="px-8 py-3 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors font-medium">
                Find jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} found
          </h2>
          <div className="flex items-center gap-4">
            <FaFilter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="all">All Jobs</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="filled">Filled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-[#6794D1] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search criteria.'
                : "You haven't posted any jobs yet."}
            </p>
            <Link
              to="/employer/create-job"
              className="inline-flex items-center px-6 py-3 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors font-medium"
            >
              <FaBriefcase className="w-4 h-4 mr-2" />
              Create Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div
                key={job._id}
                onClick={() => navigate(`/employer/jobs/${job._id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-6">
                  {/* Company Logo */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
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
                      className={`w-8 h-8 text-gray-400 ${job.employer?.profileImage ? 'hidden' : 'block'}`}
                    />
                  </div>

                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-[#2B373F] mb-1 group-hover:text-[#6794D1] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 font-medium">{job.jobRole || 'Job Position'}</p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getJobTypeColor(job.employmentType)}`}
                      >
                        {job.employmentType || 'Full-time'}
                      </span>
                      {job.status === 'open' && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-700">
                          Urgently hiring
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-4">
                      {job.location && (job.location.village || job.location.district) && (
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                          <span>
                            {[job.location.village, job.location.district]
                              .filter(Boolean)
                              .join(', ') || 'Location not specified'}
                          </span>
                        </div>
                      )}
                      {(job.salaryAmount || job.salaryType) && (
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="w-4 h-4 text-gray-400" />
                          <span>
                            {formatSalary(job.salaryAmount, job.salaryType, job.currency)}
                          </span>
                        </div>
                      )}
                      {job.positions && (
                        <div className="flex items-center gap-2">
                          <FaUsers className="w-4 h-4 text-gray-400" />
                          <span>
                            {job.positions} position{job.positions > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FaClock className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {job.description
                        ? job.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
                        : 'No description available.'}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/employer/jobs/${job._id}/edit`);
                        }}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FaEdit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleAction(job, 'close');
                        }}
                        disabled={job.status !== 'open'}
                        className="px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <FaTimesCircle className="w-4 h-4" />
                        Close
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleAction(job, 'filled');
                        }}
                        disabled={job.status !== 'open'}
                        className="px-4 py-2 text-sm font-medium text-[#2CD2BD] hover:bg-[#2CD2BD]/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <FaCheckCircle className="w-4 h-4" />
                        Mark Filled
                      </button>
                      <Link
                        to={`/employer/applications/job/${job._id}`}
                        onClick={e => e.stopPropagation()}
                        className="px-4 py-2 text-sm font-medium text-[#6794D1] hover:bg-[#6794D1]/10 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FaClipboardList className="w-4 h-4" />
                        Applications
                        {(() => {
                          const n = getApplicantCount(job._id);
                          return n > 0 ? (
                            <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 bg-[#6794D1]/20 rounded-full">
                              {n}
                            </span>
                          ) : null;
                        })()}
                      </Link>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleAction(job, 'delete');
                        }}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 ml-auto"
                      >
                        <FaTrash className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {actionType} the job "{selectedJob?.title}"?
              {actionType === 'delete' && ' This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#6794D1] hover:bg-[#5a83c0]'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </DottedBackground>
  );
};

export default JobList;

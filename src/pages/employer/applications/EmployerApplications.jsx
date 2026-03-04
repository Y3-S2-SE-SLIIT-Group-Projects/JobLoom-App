import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useJobs } from '../../../contexts/JobContext';
import {
  loadAllJobStats,
  selectJobStatsMap,
  selectApplicationLoading,
} from '../../../store/slices/applicationSlice';

import DottedBackground from '../../../components/DottedBackground';
import { FaBriefcase, FaClipboardList, FaEye, FaSearch, FaFilter } from 'react-icons/fa';

const STATUS_BADGE = {
  open: 'bg-[#2CD2BD]/20 text-[#2CD2BD] border-[#2CD2BD]',
  closed: 'bg-red-100 text-red-700 border-red-200',
  filled: 'bg-blue-100 text-blue-700 border-blue-200',
};

const STAT_COLORS = {
  pending: 'text-yellow-600 bg-yellow-50',
  reviewed: 'text-blue-600 bg-blue-50',
  shortlisted: 'text-purple-600 bg-purple-50',
  accepted: 'text-green-600 bg-green-50',
  rejected: 'text-red-600 bg-red-50',
};

const EmployerApplications = () => {
  const dispatch = useDispatch();
  const { fetchMyJobs, loading: jobsLoading } = useJobs();
  const jobStatsMap = useSelector(selectJobStatsMap);
  const statsLoading = useSelector(selectApplicationLoading('allJobStats'));

  const [jobs, setJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMyJobs({ includeInactive: true });
        if (!cancelled) {
          setJobs(data);
          const ids = data.map(j => j._id);
          if (ids.length) dispatch(loadAllJobStats(ids));
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesSearch =
      !searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getTotalApplicants = stats => {
    if (!stats) return 0;
    return Object.values(stats).reduce((sum, n) => sum + (typeof n === 'number' ? n : 0), 0);
  };

  const isLoading = jobsLoading || statsLoading;

  return (
    <DottedBackground>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <FaClipboardList className="w-7 h-7 text-[#6794D1]" />
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          </div>
          <p className="text-gray-600">
            Review and manage applications across all your job postings.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6794D1] focus:border-transparent outline-none text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="filled">Filled</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 border-4 border-[#6794D1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No matching jobs found' : 'No jobs yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create a job posting to start receiving applications.'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link
                to="/employer/create-job"
                className="inline-flex items-center px-6 py-3 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors font-medium"
              >
                <FaBriefcase className="w-4 h-4 mr-2" />
                Create a Job
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => {
              const stats = jobStatsMap[job._id];
              const total = getTotalApplicants(stats);

              return (
                <div
                  key={job._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Job info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-[#2B373F] truncate">{job.title}</h3>
                        <span
                          className={`shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize ${STATUS_BADGE[job.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {job.jobRole || 'Job Position'} &middot; {job.employmentType || 'Full-time'}
                      </p>

                      {/* Stats pills */}
                      {stats && total > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {Object.entries(stats).map(([status, count]) =>
                            count > 0 ? (
                              <span
                                key={status}
                                className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STAT_COLORS[status] || 'text-gray-600 bg-gray-100'}`}
                              >
                                {count} {status}
                              </span>
                            ) : null
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-3">No applications yet</p>
                      )}
                    </div>

                    {/* Right side: count + button */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#2B373F]">{total}</p>
                        <p className="text-xs text-gray-500">applicant{total !== 1 ? 's' : ''}</p>
                      </div>
                      <Link
                        to={`/employer/applications/job/${job._id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] transition-colors text-sm font-medium"
                      >
                        <FaEye className="w-4 h-4" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DottedBackground>
  );
};

export default EmployerApplications;

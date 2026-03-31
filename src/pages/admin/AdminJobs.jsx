import { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaRedo,
} from 'react-icons/fa';
import { getAdminJobs, updateAdminJob } from '../../services/adminApi';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [status, category]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminJobs({
        page: pagination.page,
        limit: pagination.limit,
        status: status || undefined,
        category: category || undefined,
        search: debouncedSearch || undefined,
      });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, status, category, debouncedSearch]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleStatusChange = async (jobId, newStatus) => {
    setUpdating(jobId);
    try {
      await updateAdminJob(jobId, { status: newStatus });
      setJobs(prev => prev.map(j => (j._id === jobId ? { ...j, status: newStatus } : j)));
    } catch (err) {
      alert(err.message || 'Failed to update job status');
    } finally {
      setUpdating(null);
    }
  };

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'open':
        return <FaCheckCircle className="text-green-500" />;
      case 'closed':
        return <FaTimesCircle className="text-red-500" />;
      case 'filled':
        return <FaClock className="text-orange-500" />;
      default:
        return null;
    }
  };

  if (error) {
    return <div className="p-8 text-center text-error font-bold">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-surface-muted bg-opacity-30 pb-12">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-deep-blue tracking-tight mb-2">
              Job Management
            </h1>
            <p className="text-muted">
              Monitor job postings, review activity, and manage visibility across the platform.
            </p>
          </div>
          <button
            onClick={fetchJobs}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-muted rounded-lg hover:text-primary hover:border-primary transition-all self-start md:self-center"
          >
            <FaRedo className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filters bar */}
        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by title, role or company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <FaFilter className="text-muted" />
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="px-4 py-2.5 border border-border rounded-lg outline-none bg-white text-sm"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="filled">Filled</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-lg outline-none bg-white text-sm"
            >
              <option value="">All Categories</option>
              <option value="agriculture">Agriculture</option>
              <option value="construction">Construction</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="IT">IT</option>
              <option value="healthcare">Healthcare</option>
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-muted/50 text-muted uppercase text-[11px] font-bold tracking-wider">
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Employer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && jobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted">
                      Loading jobs...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted">
                      No jobs found.
                    </td>
                  </tr>
                ) : (
                  jobs.map(job => (
                    <tr key={job._id} className="hover:bg-surface-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                            <FaBriefcase />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-text-dark truncate leading-tight">
                              {job.title}
                            </p>
                            <p className="text-xs text-muted truncate">{job.jobRole}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-muted w-3 h-3" />
                          <span className="text-sm font-medium text-muted">
                            {job.employerId?.companyName ||
                              (job.employerId
                                ? `${job.employerId.firstName} ${job.employerId.lastName}`
                                : 'Unknown')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="text-xs font-bold uppercase tracking-wide">
                            {job.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 bg-surface-muted rounded-md text-muted font-medium">
                          {job.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <select
                            className="text-xs border border-border rounded px-2 py-1 bg-white outline-none cursor-pointer focus:border-primary"
                            value={job.status}
                            disabled={updating === job._id}
                            onChange={e => handleStatusChange(job._id, e.target.value)}
                          >
                            <option value="open">Open</option>
                            <option value="filled">Filled</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="p-6 border-t border-border flex items-center justify-between bg-surface-muted/10">
            <p className="text-sm text-muted">
              Showing <span className="font-bold text-text-dark">{jobs.length}</span> of{' '}
              <span className="font-bold text-text-dark">{pagination.total}</span> jobs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-2 border border-border rounded-lg text-muted hover:bg-surface disabled:opacity-30 transition-all"
              >
                <FaChevronLeft className="w-3" />
              </button>
              <span className="text-sm font-medium text-muted px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-2 border border-border rounded-lg text-muted hover:bg-surface disabled:opacity-30 transition-all"
              >
                <FaChevronRight className="w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobs;

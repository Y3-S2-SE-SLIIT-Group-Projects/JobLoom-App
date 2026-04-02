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
  FaLayerGroup,
} from 'react-icons/fa';
import { getAdminJobs, updateAdminJob } from '../../services/adminApi';
import SearchInput from '../../components/ui/SearchInput';
import FilterSelect from '../../components/ui/FilterSelect';
import AdminStatusBadge from '../../components/ui/AdminStatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AdminEmptyState from '../../components/ui/AdminEmptyState';
import AdminPagination from '../../components/ui/AdminPagination';
import ActionButton from '../../components/ui/ActionButton';

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

  // Removed unused getStatusIcon function

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <AdminEmptyState
          title="Error Loading Jobs"
          description={error}
          actionLabel="Retry"
          action={fetchJobs}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted pb-12">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* Header */}
        <div className="bg-surface border-b border-border mb-6">
          <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                <FaBriefcase className="text-emerald-600 w-5 h-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-dark">Job Management</h1>
                <p className="text-muted text-sm mt-1">Manage {pagination.total} job postings</p>
              </div>
            </div>
            <ActionButton
              variant="secondary"
              icon={FaRedo}
              onClick={fetchJobs}
              loading={loading}
              size="md"
            >
              Refresh
            </ActionButton>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-surface rounded-xl border border-border shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, role, or company..."
                className="w-full"
              />
            </div>
            <div className="flex gap-4">
              <FilterSelect
                value={status}
                onChange={e => setStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'open', label: 'Open' },
                  { value: 'filled', label: 'Filled' },
                  { value: 'closed', label: 'Closed' },
                ]}
                icon={FaCheckCircle}
              />
              <FilterSelect
                value={category}
                onChange={e => setCategory(e.target.value)}
                options={[
                  { value: '', label: 'All Categories' },
                  { value: 'agriculture', label: 'Agriculture' },
                  { value: 'construction', label: 'Construction' },
                  { value: 'manufacturing', label: 'Manufacturing' },
                  { value: 'IT', label: 'IT' },
                  { value: 'healthcare', label: 'Healthcare' },
                ]}
                icon={FaLayerGroup}
              />
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          {loading && jobs.length === 0 ? (
            <LoadingSpinner size="md" text="Loading jobs..." />
          ) : jobs.length === 0 ? (
            <AdminEmptyState
              icon={FaBriefcase}
              title="No Jobs Found"
              description="Try adjusting your search or filter criteria"
              actionLabel="Clear Filters"
              action={() => {
                setSearch('');
                setStatus('');
                setCategory('');
              }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-muted/50 text-muted uppercase text-xs font-bold tracking-wider border-b border-border">
                      <th className="px-6 py-4">Job Details</th>
                      <th className="px-6 py-4">Employer</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {jobs.map(job => (
                      <tr
                        key={job._id}
                        className="hover:bg-surface-muted/20 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                              <FaBriefcase className="w-4 h-4" />
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
                          <AdminStatusBadge status={job.status} type="job" />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-0.5 bg-surface-muted rounded-md text-muted font-medium">
                            {job.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            className="text-xs border border-border rounded px-2 py-1 bg-surface outline-none cursor-pointer focus:border-primary hover:border-primary transition-colors"
                            value={job.status}
                            disabled={updating === job._id}
                            onChange={e => handleStatusChange(job._id, e.target.value)}
                          >
                            <option value="open">Open</option>
                            <option value="filled">Filled</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <AdminPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminJobs;

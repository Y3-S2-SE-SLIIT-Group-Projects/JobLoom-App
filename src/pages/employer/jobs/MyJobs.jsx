import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../../hooks/useJobs';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Edit,
  XCircle,
  CheckCircle,
  Trash2,
  Filter,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const MyJobs = () => {
  const { fetchMyJobs, closeJob, markJobAsFilled, deleteJob, loading } = useJobs();
  const [jobs, setJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionType, setActionType] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;

  const loadJobs = async () => {
    try {
      const data = await fetchMyJobs();
      setJobs(data);
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredJobs =
    filterStatus === 'all' ? jobs : jobs.filter(job => job.status === filterStatus);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

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
    } catch (err) {
      setError(err.message || 'Action failed');
      setShowConfirmDialog(false);
    }
  };

  const getStatusBadgeClass = status => {
    const styles = {
      open: 'bg-success/10 text-success border-success/30',
      closed: 'bg-error/10 text-error border-error/30',
      filled: 'bg-info/10 text-info border-info/30',
    };
    return styles[status] || 'bg-neutral-100 text-muted border-border';
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSalary = (amount, type) => {
    return `LKR ${amount.toLocaleString()} / ${type}`;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, jobs.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const changePage = newPage => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="bg-surface shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/employer/dashboard"
                className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-dark">My Jobs</h1>
                  <p className="text-sm text-subtle">{filteredJobs.length} jobs found</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-subtle" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Jobs</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="filled">Filled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-dark mb-2">No jobs found</h3>
              <p className="text-muted mb-6">
                {filterStatus === 'all'
                  ? "You haven't posted any jobs yet."
                  : `No ${filterStatus} jobs found.`}
              </p>
              <Link
                to="/employer/create-job"
                className="inline-flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Create Your First Job
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                      Job Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                      Salary
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                      Applicants
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                      Posted On
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedJobs.map(job => (
                    <tr key={job._id} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          to={`/employer/jobs/${job._id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {job.location.village}, {job.location.district}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formatSalary(job.salaryAmount, job.salaryType)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{job.applicantsCount || 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${getStatusBadgeClass(job.status)}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{formatDate(job.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/employer/jobs/edit/${job._id}`}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleAction(job, 'delete')}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredJobs.length > jobsPerPage && (
                <div className="px-4 py-4 border-t border-border bg-surface flex items-center justify-between">
                  <div className="text-sm text-muted">
                    Showing {paginatedJobs.length} of {filteredJobs.length} jobs
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-muted hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    <div className="text-sm text-muted px-2">
                      Page {currentPage} of {totalPages}
                    </div>
                    <button
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-muted hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-2">Confirm Action</h3>
            <p className="text-muted mb-6">
              Are you sure you want to {actionType} the job "{selectedJob?.title}"?
              {actionType === 'delete' && ' This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-muted hover:bg-surface-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  actionType === 'delete'
                    ? 'bg-error hover:bg-error'
                    : 'bg-primary hover:bg-deep-blue'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;

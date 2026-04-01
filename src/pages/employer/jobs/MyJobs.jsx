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
} from 'lucide-react';

const MyJobs = () => {
  const { fetchMyJobs, closeJob, markJobAsFilled, deleteJob, loading } = useJobs();
  const [jobs, setJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionType, setActionType] = useState('');
  const [error, setError] = useState('');

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

  const getStatusBadge = status => {
    const styles = {
      open: 'bg-success/10 text-success border-success/30',
      closed: 'bg-error/10 text-error border-error/30',
      filled: 'bg-info/10 text-info border-info/20',
    };
    return styles[status] || styles.open;
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

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Header */}
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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <div
                key={job._id}
                className="bg-surface rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-neutral-100">
                  <div className="flex items-start justify-between mb-3">
                    <Link
                      to={`/employer/jobs/${job._id}`}
                      className="text-lg font-semibold text-text-dark line-clamp-2 flex-1 hover:text-info transition-colors cursor-pointer"
                    >
                      {job.title}
                    </Link>
                    <span
                      className={`ml-2 px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(job.status)}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <Link to={`/employer/jobs/${job._id}`} className="block">
                    <p className="text-sm text-muted line-clamp-2 mb-3 hover:text-text-dark transition-colors">
                      {job.description
                        ? job.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                        : 'No description'}
                    </p>
                  </Link>
                  <div className="flex items-center text-sm text-subtle">
                    <span className="px-2 py-1 bg-neutral-100 rounded text-xs font-medium">
                      {job.category}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center text-sm text-muted">
                    <MapPin className="w-4 h-4 mr-2 text-subtle" />
                    {job.location.village}, {job.location.district}
                  </div>
                  <div className="flex items-center text-sm text-muted">
                    <DollarSign className="w-4 h-4 mr-2 text-subtle" />
                    {formatSalary(job.salaryAmount, job.salaryType)}
                  </div>
                  <div className="flex items-center text-sm text-muted">
                    <Users className="w-4 h-4 mr-2 text-subtle" />
                    {job.positions} position{job.positions > 1 ? 's' : ''} ·{' '}
                    {job.applicantsCount || 0} applicants
                  </div>
                  <div className="flex items-center text-sm text-muted">
                    <Calendar className="w-4 h-4 mr-2 text-subtle" />
                    Posted {formatDate(job.createdAt)}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-surface-muted border-t border-neutral-100 rounded-b-xl">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAction(job, 'close')}
                      disabled={job.status !== 'open'}
                      className="px-3 py-2 text-sm font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Close
                    </button>
                    <button
                      onClick={() => handleAction(job, 'filled')}
                      disabled={job.status !== 'open'}
                      className="px-3 py-2 text-sm font-medium text-success hover:bg-success/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Filled
                    </button>
                    <button
                      onClick={() => handleAction(job, 'delete')}
                      className="px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                    <button
                      disabled
                      className="px-3 py-2 text-sm font-medium text-info hover:bg-info/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
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

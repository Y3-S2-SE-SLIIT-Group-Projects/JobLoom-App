import { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaTimes,
  FaRedo,
} from 'react-icons/fa';
import { getAdminUsers, updateAdminUser } from '../../services/adminApi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // id of user currently being updated
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input and reset page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when role changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [role]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers({
        page: pagination.page,
        limit: pagination.limit,
        role: role || undefined,
        search: debouncedSearch || undefined,
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, role, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusToggle = async (userId, currentStatus) => {
    setUpdating(userId);
    try {
      await updateAdminUser(userId, { isActive: !currentStatus });
      // Update local state instead of refetching everything
      setUsers(prev => prev.map(u => (u._id === userId ? { ...u, isActive: !currentStatus } : u)));
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setUpdating(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`))
        return;
      await updateAdminUser(userId, { role: newRole });
      setUsers(prev => prev.map(u => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
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
              User Management
            </h1>
            <p className="text-muted">
              Review, manage roles, and monitor account status for all JobLoom users.
            </p>
          </div>
          <button
            onClick={fetchUsers}
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
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FaFilter className="text-muted" />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all bg-white"
            >
              <option value="">All Roles</option>
              <option value="job_seeker">Job Seeker</option>
              <option value="employer">Employer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-muted/50 text-muted uppercase text-[11px] font-bold tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted">
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr
                      key={user._id}
                      className="hover:bg-surface-muted/20 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden font-bold">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>
                                {user.firstName ? user.firstName[0] : 'U'}
                                {user.lastName ? user.lastName[0] : ''}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-text-dark truncate leading-tight">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider self-start ${
                              user.role === 'admin'
                                ? 'bg-indigo-100 text-indigo-700'
                                : user.role === 'employer'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-teal-100 text-teal-700'
                            }`}
                          >
                            {user.role.replace('_', ' ')}
                          </span>
                          <select
                            className="text-[10px] bg-transparent text-muted hover:text-primary outline-none cursor-pointer p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            value={user.role}
                            disabled={updating === user._id}
                            onChange={e => handleRoleChange(user._id, e.target.value)}
                          >
                            <option value="job_seeker">Set Job Seeker</option>
                            <option value="employer">Set Employer</option>
                            <option value="admin">Set Admin</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.isActive ? (
                            <FaCheck className="text-[10px]" />
                          ) : (
                            <FaTimes className="text-[10px]" />
                          )}
                          {user.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={updating === user._id}
                          onClick={() => handleStatusToggle(user._id, user.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                            user.isActive
                              ? 'text-error border border-error hover:bg-error/10'
                              : 'text-primary border border-primary hover:bg-primary/10'
                          }`}
                        >
                          {updating === user._id ? (
                            <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin mx-auto" />
                          ) : user.isActive ? (
                            'Disable'
                          ) : (
                            'Enable'
                          )}
                        </button>
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
              Showing <span className="font-bold text-text-dark">{users.length}</span> of{' '}
              <span className="font-bold text-text-dark">{pagination.total}</span> users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-2 border border-border rounded-lg text-muted hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <FaChevronLeft className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                      pagination.page === p
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted hover:bg-surface'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-2 border border-border rounded-lg text-muted hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

import { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaTimes,
  FaRedo,
  FaUsers,
  FaUserShield,
} from 'react-icons/fa';
import { getAdminUsers, updateAdminUser } from '../../services/adminApi';
import SearchInput from '../../components/ui/SearchInput';
import FilterSelect from '../../components/ui/FilterSelect';
import AdminStatusBadge from '../../components/ui/AdminStatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AdminEmptyState from '../../components/ui/AdminEmptyState';
import AdminPagination from '../../components/ui/AdminPagination';
import ActionButton from '../../components/ui/ActionButton';

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <AdminEmptyState
          title="Error Loading Users"
          description={error}
          actionLabel="Retry"
          action={fetchUsers}
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
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FaUsers className="text-primary w-5 h-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-dark">User Management</h1>
                <p className="text-muted text-sm mt-1">
                  Manage {pagination.total} registered users
                </p>
              </div>
            </div>
            <ActionButton
              variant="secondary"
              icon={FaRedo}
              onClick={fetchUsers}
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
                placeholder="Search by name or email..."
                className="w-full"
              />
            </div>
            <div className="md:w-56">
              <FilterSelect
                value={role}
                onChange={e => setRole(e.target.value)}
                options={[
                  { value: '', label: 'All Roles' },
                  { value: 'job_seeker', label: 'Job Seeker' },
                  { value: 'employer', label: 'Employer' },
                  { value: 'admin', label: 'Admin' },
                ]}
                icon={FaUserShield}
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          {loading && users.length === 0 ? (
            <LoadingSpinner size="md" text="Loading users..." />
          ) : users.length === 0 ? (
            <AdminEmptyState
              icon={FaUsers}
              title="No Users Found"
              description="Try adjusting your search or filter criteria"
              actionLabel="Clear Filters"
              action={() => {
                setSearch('');
                setRole('');
              }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-muted/50 text-muted uppercase text-xs font-bold tracking-wider border-b border-border">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map(user => (
                      <tr
                        key={user._id}
                        className="hover:bg-surface-muted/20 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden font-bold text-sm">
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
                            <AdminStatusBadge status={user.role} type="role" />
                            <select
                              className="text-xs bg-transparent text-muted hover:text-primary outline-none cursor-pointer p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              value={user.role}
                              disabled={updating === user._id}
                              onChange={e => handleRoleChange(user._id, e.target.value)}
                            >
                              <option value="job_seeker">Job Seeker</option>
                              <option value="employer">Employer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <AdminStatusBadge status={user.isActive} type="user" />
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ActionButton
                            variant={user.isActive ? 'danger' : 'success'}
                            size="sm"
                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                            loading={updating === user._id}
                            disabled={updating === user._id}
                          >
                            {user.isActive ? 'Disable' : 'Enable'}
                          </ActionButton>
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

export default AdminUsers;

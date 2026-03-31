import ProtectedRoute from '../../components/auth/ProtectedRoute';
import AdminDashboard from '../../pages/admin/AdminDashboard';
import AdminUsers from '../../pages/admin/AdminUsers';
import AdminJobs from '../../pages/admin/AdminJobs';

const adminRoutes = [
  {
    path: 'admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/users',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminUsers />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/jobs',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminJobs />
      </ProtectedRoute>
    ),
  },
];

export default adminRoutes;

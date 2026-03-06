import { lazy } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const MyApplications = lazy(() => import('../../pages/seeker/MyApplications'));
const SeekerApplicationDetail = lazy(() => import('../../pages/seeker/SeekerApplicationDetail'));

const seekerRoutes = [
  {
    path: 'my-applications',
    element: (
      <ProtectedRoute allowedRoles={['job_seeker']}>
        <MyApplications />
      </ProtectedRoute>
    ),
  },
  {
    path: 'my-applications/:id',
    element: (
      <ProtectedRoute allowedRoles={['job_seeker']}>
        <SeekerApplicationDetail />
      </ProtectedRoute>
    ),
  },
];

export default seekerRoutes;

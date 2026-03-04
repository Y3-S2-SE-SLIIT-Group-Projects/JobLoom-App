import { lazy } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ComingSoon from '../../pages/ComingSoon';

const EmployerDashboard = lazy(() => import('../../pages/employer/jobs/EmployerDashboard'));
const CreateJob = lazy(() => import('../../pages/employer/jobs/CreateJob'));
const JobList = lazy(() => import('../../pages/employer/jobs/JobList'));
const JobDetails = lazy(() => import('../../pages/employer/jobs/JobDetails'));
const EditJob = lazy(() => import('../../pages/employer/jobs/EditJob'));
const Analytics = lazy(() => import('../../pages/employer/jobs/Analytics'));

const employerRoutes = [
  {
    path: 'employer/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['employer']}>
        <EmployerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/create-job',
    element: (
      <ProtectedRoute allowedRoles={['employer']}>
        <CreateJob />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/my-jobs',
    element: (
      <ProtectedRoute allowedRoles={['employer']}>
        <JobList />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/jobs/:id',
    element: (
      <ProtectedRoute allowedRoles={['employer']}>
        <JobDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/jobs/:id/edit',
    element: (
      <ProtectedRoute allowedRoles={['employer']}>
        <EditJob />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/analytics',
    element: (
      <ProtectedRoute allowedRoles={['employer']}>
        <Analytics />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/applications',
    element: (
      <ProtectedRoute allowedRoles={['employer']}>
        <ComingSoon label="Applications" />
      </ProtectedRoute>
    ),
  },
];

export default employerRoutes;

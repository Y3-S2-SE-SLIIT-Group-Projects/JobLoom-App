import { lazy } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const EmployerDashboard = lazy(() => import('../../pages/employer/jobs/EmployerDashboard'));
const CreateJob = lazy(() => import('../../pages/employer/jobs/CreateJob'));
const JobList = lazy(() => import('../../pages/employer/jobs/JobList'));
const JobDetails = lazy(() => import('../../pages/employer/jobs/JobDetails'));
const EditJob = lazy(() => import('../../pages/employer/jobs/EditJob'));
const Analytics = lazy(() => import('../../pages/employer/jobs/Analytics'));
const EmployerApplications = lazy(
  () => import('../../pages/employer/applications/EmployerApplications')
);
const JobApplicationsList = lazy(
  () => import('../../pages/employer/applications/JobApplicationsList')
);
const ApplicationDetailPage = lazy(
  () => import('../../pages/employer/applications/ApplicationDetailPage')
);

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
        <EmployerApplications />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/applications/job/:jobId',
    element: (
      <ProtectedRoute allowedRoles={['employer']}>
        <JobApplicationsList />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/applications/:id',
    element: (
      <ProtectedRoute allowedRoles={['employer']}>
        <ApplicationDetailPage />
      </ProtectedRoute>
    ),
  },
];

export default employerRoutes;

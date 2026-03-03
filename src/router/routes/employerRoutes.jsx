import { lazy } from 'react';
import ComingSoon from '../../pages/ComingSoon';

const EmployerDashboard = lazy(() => import('../../pages/employer/jobs/EmployerDashboard'));
const CreateJob = lazy(() => import('../../pages/employer/jobs/CreateJob'));
const JobList = lazy(() => import('../../pages/employer/jobs/JobList'));
const JobDetails = lazy(() => import('../../pages/employer/jobs/JobDetails'));
const EditJob = lazy(() => import('../../pages/employer/jobs/EditJob'));
const Analytics = lazy(() => import('../../pages/employer/jobs/Analytics'));

const employerRoutes = [
  { path: 'employer/dashboard', element: <EmployerDashboard /> },
  { path: 'employer/create-job', element: <CreateJob /> },
  { path: 'employer/my-jobs', element: <JobList /> },
  { path: 'employer/jobs/:id', element: <JobDetails /> },
  { path: 'employer/jobs/:id/edit', element: <EditJob /> },
  { path: 'employer/analytics', element: <Analytics /> },
  { path: 'employer/applications', element: <ComingSoon label="Applications" /> },
];

export default employerRoutes;

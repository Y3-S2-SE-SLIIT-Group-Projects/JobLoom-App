import { lazy } from 'react';

const PublicDashboard = lazy(() => import('../../pages/dashboard/Dashboard'));
const PublicJobDetails = lazy(() => import('../../pages/PublicJobDetails'));

const publicRoutes = [
  { index: true, element: <PublicDashboard /> },
  { path: 'jobs/:id', element: <PublicJobDetails /> },
];

export default publicRoutes;

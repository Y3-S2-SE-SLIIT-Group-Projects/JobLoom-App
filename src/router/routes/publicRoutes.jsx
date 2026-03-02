import { lazy } from 'react';

const PublicDashboard = lazy(() => import('../../pages/dashboard/Dashboard'));

const publicRoutes = [{ path: 'jobs', element: <PublicDashboard /> }];

export default publicRoutes;

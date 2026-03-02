import { Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import NotFound from '../pages/NotFound';
import publicRoutes from './routes/publicRoutes';
import userRoutes from './routes/userRoutes';
import employerRoutes from './routes/employerRoutes';
import reviewRoutes from './routes/reviewRoutes';

/**
 * Root route config — composes feature route slices.
 * To add a new feature: create routes/featureRoutes.jsx and spread it below.
 */
const routeConfig = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/jobs" replace /> },
      ...publicRoutes,
      ...userRoutes,
      ...employerRoutes,
      ...reviewRoutes,
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routeConfig;

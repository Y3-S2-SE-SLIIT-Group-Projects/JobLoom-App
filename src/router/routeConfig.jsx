import AppLayout from '../layouts/AppLayout';
import NotFound from '../pages/NotFound';
import RouteErrorElement from '../components/RouteErrorElement';
import publicRoutes from './routes/publicRoutes';
import userRoutes from './routes/userRoutes';
import employerRoutes from './routes/employerRoutes';
import seekerRoutes from './routes/seekerRoutes';
import reviewRoutes from './routes/reviewRoutes';

import adminRoutes from './routes/adminRoutes';

/**
 * Root route config — composes feature route slices.
 * To add a new feature: create routes/featureRoutes.jsx and spread it below.
 */
const routeConfig = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorElement />,
    children: [
      ...publicRoutes,
      ...userRoutes,
      ...employerRoutes,
      ...seekerRoutes,
      ...reviewRoutes,
      ...adminRoutes,
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routeConfig;

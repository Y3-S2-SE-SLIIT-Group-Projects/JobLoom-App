import { lazy, Suspense } from 'react';
import AppLayout from '../layouts/AppLayout';
import NotFound from '../pages/NotFound';
import RouteErrorElement from '../components/RouteErrorElement';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Spinner from '../components/ui/Spinner';
import publicRoutes from './routes/publicRoutes';
import userRoutes from './routes/userRoutes';
import employerRoutes from './routes/employerRoutes';
import seekerRoutes from './routes/seekerRoutes';
import reviewRoutes from './routes/reviewRoutes';

import adminRoutes from './routes/adminRoutes';

const InterviewRoomPage = lazy(() => import('../pages/interview/InterviewRoomPage'));

/**
 * Virtual interview room — shared by employer + job seeker only.
 * Kept as a root-level route (not under AppLayout) so Jitsi can use the full viewport.
 */
const interviewRoute = {
  path: '/interview/:applicationId',
  errorElement: <RouteErrorElement />,
  element: (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-neutral-900">
          <Spinner size="lg" />
        </div>
      }
    >
      <ProtectedRoute allowedRoles={['employer', 'job_seeker']}>
        <InterviewRoomPage />
      </ProtectedRoute>
    </Suspense>
  ),
};

/**
 * Root route config — composes feature route slices.
 * To add a new feature: create routes/featureRoutes.jsx and spread it below.
 */
const routeConfig = [
  interviewRoute,
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

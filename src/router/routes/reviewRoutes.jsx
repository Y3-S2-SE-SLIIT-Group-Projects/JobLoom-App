import { lazy } from 'react';

const UserReviewsPage = lazy(() => import('../../pages/reviews/UserReviewsPage'));
const SubmitReviewPage = lazy(() => import('../../pages/reviews/SubmitReviewPage'));

// Static segments before param segments for clarity
const reviewRoutes = [
  { path: 'reviews/submit', element: <SubmitReviewPage /> },
  { path: 'reviews/submit/:jobId', element: <SubmitReviewPage /> },
  { path: 'reviews/:userId', element: <UserReviewsPage /> },
];

export default reviewRoutes;

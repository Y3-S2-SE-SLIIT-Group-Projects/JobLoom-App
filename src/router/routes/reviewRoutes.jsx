import { lazy } from 'react';

const UserReviewsPage = lazy(() => import('../../pages/reviews/UserReviewsPage'));
const SubmitReviewPage = lazy(() => import('../../pages/reviews/SubmitReviewPage'));
const MyReviewsPage = lazy(() => import('../../pages/reviews/MyReviewsPage'));

// Specific static segments before param segments
const reviewRoutes = [
  { path: 'reviews/my', element: <MyReviewsPage /> },
  { path: 'reviews/submit', element: <SubmitReviewPage /> },
  { path: 'reviews/submit/:jobId', element: <SubmitReviewPage /> },
  { path: 'reviews/:userId', element: <UserReviewsPage /> },
];

export default reviewRoutes;

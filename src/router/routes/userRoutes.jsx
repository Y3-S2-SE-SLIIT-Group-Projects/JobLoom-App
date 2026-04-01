import { lazy } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const Login = lazy(() => import('../../pages/auth/Login'));
const Register = lazy(() => import('../../pages/auth/Register'));
const VerifyRegistration = lazy(() => import('../../pages/auth/VerifyRegistration'));
const ForgotPassword = lazy(() => import('../../pages/auth/ForgotPassword'));
const UserProfile = lazy(() => import('../../pages/profile/UserProfile'));
const EditProfile = lazy(() => import('../../pages/profile/EditProfile'));
const CompleteProfile = lazy(() => import('../../pages/profile/CompleteProfile'));

const userRoutes = [
  // Auth routes
  { path: 'login', element: <Login /> },
  { path: 'register', element: <Register /> },
  { path: 'verify-registration', element: <VerifyRegistration /> },
  { path: 'forgot-password', element: <ForgotPassword /> },

  // Profile routes (Protected)
  {
    path: 'profile',
    element: (
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: 'profile/edit',
    element: (
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: 'profile/complete',
    element: (
      <ProtectedRoute>
        <CompleteProfile />
      </ProtectedRoute>
    ),
  },
];

export default userRoutes;

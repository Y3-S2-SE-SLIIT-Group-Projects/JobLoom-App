import { lazy } from 'react';

const Login = lazy(() => import('../../pages/auth/Login'));
const Register = lazy(() => import('../../pages/auth/Register'));
const VerifyRegistration = lazy(() => import('../../pages/auth/VerifyRegistration'));
const ForgotPassword = lazy(() => import('../../pages/auth/ForgotPassword'));
const UserProfile = lazy(() => import('../../pages/profile/UserProfile'));
const EditProfile = lazy(() => import('../../pages/profile/EditProfile'));

const userRoutes = [
  // Auth routes
  { path: 'login', element: <Login /> },
  { path: 'register', element: <Register /> },
  { path: 'verify-registration', element: <VerifyRegistration /> },
  { path: 'forgot-password', element: <ForgotPassword /> },

  // Profile routes
  { path: 'profile', element: <UserProfile /> },
  { path: 'profile/edit', element: <EditProfile /> },
];

export default userRoutes;

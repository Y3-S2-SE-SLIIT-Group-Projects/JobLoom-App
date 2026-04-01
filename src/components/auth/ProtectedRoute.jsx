import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../ui/Spinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading, token } = useSelector(state => state.user);
  const location = useLocation();

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentUser || !token) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Role not allowed - redirect to home or a forbidden page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

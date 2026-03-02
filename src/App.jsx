import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { JobProvider } from './contexts/JobContext';
import { UserProvider } from './contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';
import EmployerDashboard from './pages/employer/jobs/EmployerDashboard';
import PublicDashboard from './pages/dashboard/Dashboard';
import CreateJob from './pages/employer/jobs/CreateJob';
import JobList from './pages/employer/jobs/JobList';
import JobDetails from './pages/employer/jobs/JobDetails';
import EditJob from './pages/employer/jobs/EditJob';
import Analytics from './pages/employer/jobs/Analytics';
// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyRegistration from './pages/auth/VerifyRegistration';
import ForgotPassword from './pages/auth/ForgotPassword';
// Profile pages
import UserProfile from './pages/profile/UserProfile';
import EditProfile from './pages/profile/EditProfile';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <JobProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Navigate to="/jobs" replace />} />
              <Route path="/jobs" element={<PublicDashboard />} />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-registration" element={<VerifyRegistration />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Profile routes */}
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/profile/edit" element={<EditProfile />} />

              {/* Employer routes */}
              <Route path="/employer/dashboard" element={<EmployerDashboard />} />
              <Route path="/employer/create-job" element={<CreateJob />} />
              <Route path="/employer/my-jobs" element={<JobList />} />
              <Route path="/employer/jobs/:id" element={<JobDetails />} />
              <Route path="/employer/jobs/:id/edit" element={<EditJob />} />
              <Route path="/employer/analytics" element={<Analytics />} />
              <Route
                path="/employer/applications"
                element={<div className="p-8 text-center">Applications page coming soon...</div>}
              />

              <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
            </Routes>
          </ErrorBoundary>
        </JobProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;

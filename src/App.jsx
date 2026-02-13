import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { JobProvider } from './contexts/JobContext';
import ErrorBoundary from './components/ErrorBoundary';
import EmployerDashboard from './pages/employer/jobs/EmployerDashboard';
import CreateJob from './pages/employer/jobs/CreateJob';
import JobList from './pages/employer/jobs/JobList';
import JobDetails from './pages/employer/jobs/JobDetails';
import EditJob from './pages/employer/jobs/EditJob';
import Analytics from './pages/employer/jobs/Analytics';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <JobProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/employer/dashboard" replace />} />
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
    </BrowserRouter>
  );
}

export default App;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { JobProvider } from './contexts/JobContext';
import { UserProvider } from './contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';
import store from './store/index.js';
import './i18n';
import App from './App.jsx';
import './index.css';

/**
 * Global provider stack — order matters:
 * 1. StrictMode  — React dev checks
 * 2. ErrorBoundary — catches render errors across the whole tree
 * 3. Provider (Redux) — global server/async state
 * 4. UserProvider — auth/user context consumed throughout the app
 * 5. JobProvider — domain context consumed by job-related pages
 * 6. App — mounts the router
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <UserProvider>
          <JobProvider>
            <App />
          </JobProvider>
        </UserProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);

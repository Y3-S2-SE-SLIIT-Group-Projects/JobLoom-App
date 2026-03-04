import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
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
 * 4. JobProvider — domain context consumed by job-related pages
 * 5. App — mounts the router
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
 
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);

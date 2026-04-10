import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import ErrorBoundary from './components/ErrorBoundary';
import { OfflineProvider } from './offline/OfflineProvider';
import OfflineBanner from './components/OfflineBanner';
import store from './store/index.js';
import './i18n';
import App from './App.jsx';
import './index.css';

/**
 * Global provider stack — order matters:
 * 1. StrictMode  — React dev checks
 * 2. ErrorBoundary — catches render errors across the whole tree
 * 3. Provider (Redux) — global server/async state
 * 4. OfflineProvider — network status, sync queue, low data mode
 * 5. App — mounts the router
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <OfflineProvider>
          <App />
          <OfflineBanner />
        </OfflineProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);

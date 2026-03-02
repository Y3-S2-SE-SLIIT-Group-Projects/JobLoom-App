import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Spinner from '../components/ui/Spinner';

/**
 * AppLayout
 * The main UI shell rendered around every page.
 * Add persistent UI here: Navbar, Footer, Toasts, etc.
 * Providers belong in main.jsx — not here.
 */
const AppLayout = () => (
  <>
    <Navbar />
    <Suspense fallback={<Spinner size="lg" className="min-h-screen" />}>
      <Outlet />
    </Suspense>
  </>
);

export default AppLayout;

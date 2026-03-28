import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Spinner from '../components/ui/Spinner';

/**
 * AppLayout
 * The main UI shell rendered around every page.
 * Add persistent UI here: Navbar, Footer, Toasts, etc.
 * Providers belong in main.jsx — not here.
 */
const AppLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 flex flex-col">
      <Suspense fallback={<Spinner size="lg" className="flex-1" />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </div>
);

export default AppLayout;

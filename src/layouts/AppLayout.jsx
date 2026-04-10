import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
    <Toaster
      position="top-right"
      toastOptions={{ duration: 4000 }}
      containerStyle={{ zIndex: 9999 }}
    />
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

import { createBrowserRouter } from 'react-router-dom';
import routeConfig from './routeConfig';

/**
 * Application router
 * Built once from routeConfig and exported as a singleton.
 * Supports React Router v6 data APIs (loaders, actions) out of the box.
 */
const router = createBrowserRouter(routeConfig);

export default router;

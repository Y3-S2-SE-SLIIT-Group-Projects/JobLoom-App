import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

const RouteErrorElement = () => {
  const error = useRouteError();

  let title = 'Something went wrong';
  let message = 'The page could not be loaded. Please try again.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || message;
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl shadow-sm border border-error/30 p-6 max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-error mb-2">{title}</h2>
        <p className="text-muted mb-5">{message}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-deep-blue"
          >
            Reload Page
          </button>
          <Link
            to="/"
            className="px-4 py-2 border border-border text-muted rounded-lg hover:bg-surface-muted"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorElement;

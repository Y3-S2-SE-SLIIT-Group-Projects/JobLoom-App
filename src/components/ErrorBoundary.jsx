import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-sm border border-error/30 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-error mb-2">Something went wrong</h2>
            <p className="text-muted mb-4">
              {this.state.error?.message || 'An error occurred while loading the page.'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-deep-blue"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.history.back();
                }}
                className="w-full px-4 py-2 border border-border text-muted rounded-lg hover:bg-surface-muted"
              >
                Go Back
              </button>
            </div>
            {/* eslint-disable-next-line no-undef */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-subtle">Error Details</summary>
                <pre className="mt-2 text-xs bg-neutral-100 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

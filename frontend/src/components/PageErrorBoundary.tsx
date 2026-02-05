/**
 * Page-level Error Boundary
 * Wraps individual pages to catch and display errors gracefully
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Page Error Boundary caught an error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Log to error tracking service (e.g., Sentry) in production
    // if (import.meta.env.PROD) {
    //   logErrorToService(error, errorInfo);
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { pageName } = this.props;
      const { error } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h2>
              
              {pageName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Error in {pageName}
                </p>
              )}
              
              {error && (
                <div className="w-full mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-mono break-all">
                    {error.message || 'An unexpected error occurred'}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  className="flex-1 bg-crimson-red hover:bg-fire-red text-white"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
              
              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="mt-4 w-full text-left">
                  <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto max-h-48">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC to wrap pages with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string
) => {
  const WrappedComponent = (props: P) => (
    <PageErrorBoundary pageName={pageName}>
      <Component {...props} />
    </PageErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};

export default PageErrorBoundary;

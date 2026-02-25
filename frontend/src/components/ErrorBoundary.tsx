import React, { Component, ErrorInfo, ReactNode } from 'react';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';



interface Props {

  children: ReactNode;

  fallback?: ReactNode;

}



interface State {

  hasError: boolean;

  error: Error | null;

  errorInfo: ErrorInfo | null;

}



class ErrorBoundary extends Component<Props, State> {

  constructor(props: Props) {

    super(props);

    this.state = {

      hasError: false,

      error: null,

      errorInfo: null,

    };

  }



  static getDerivedStateFromError(error: Error): Partial<State> {

    return { hasError: true, error };

  }



  componentDidCatch(error: Error, errorInfo: ErrorInfo) {

    const errorData = {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      href: typeof window !== 'undefined' ? window.location.href : '',
      pathname: typeof window !== 'undefined' ? window.location.pathname : '',
      timestamp: new Date().toISOString(),
    };

    console.error('ErrorBoundary caught an error:', errorData);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('__lastErrorBoundary', JSON.stringify(errorData));
      }
    }catch {
      // ignore storage failures
    }

    this.setState({

      error,

      errorInfo,

    });

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

      if (this.props.fallback) {

        return this.props.fallback;

      }



      return (

        <ErrorFallback

          error={this.state.error}

          onReset={this.handleReset}

        />

      );

    }



    return this.props.children;

  }

}



const ErrorFallback = ({ error, onReset }: { error: Error | null; onReset: () => void }) => {

  const handleGoHome = () => {

    window.location.href = '/';

  };



  const isDev = import.meta.env.DEV;



  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">

      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">

        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">

          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />

        </div>

        

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">

          Đã xảy ra lỗi

        </h1>

        

        <p className="text-gray-600 dark:text-gray-400 mb-6">

          {error?.message || 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'}

        </p>



        {isDev && error && (

          <details className="mb-6 text-left">

            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">

              Chi tiết lỗi (Development)

            </summary>

            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">

              {error.stack}

            </pre>

          </details>

        )}



        <div className="flex flex-col sm:flex-row gap-3 justify-center">

          <Button

            onClick={onReset}

            className="bg-crimson-red hover:bg-fire-red text-white"

          >

            <RefreshCw className="w-4 h-4 mr-2" />

            Thử lại

          </Button>

          <Button

            variant="outline"

            onClick={handleGoHome}

            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"

          >

            <Home className="w-4 h-4 mr-2" />

            Về trang chủ

          </Button>

        </div>

      </div>

    </div>

  );

};



export default ErrorBoundary;


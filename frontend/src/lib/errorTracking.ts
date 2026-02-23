/**
 * Error Tracking Service
 * Supports Sentry integration when configured, falls back to console logging
 */

interface ErrorInfo {
  componentStack?: string;
  errorBoundary?: string;
}

let isSentryInitialized = false;

/**
 * Initialize error tracking service
 * Only initializes Sentry if DSN is provided
 */
export const initErrorTracking = async (): Promise<void> => {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!sentryDsn) {
    if (import.meta.env.DEV) {
      console.log('[Error Tracking] Sentry DSN not configured, using console logging');
    }
    return;
  }

  try {
    // Dynamically import Sentry to avoid bundling it if not needed
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Sentry is optional dependency, may not be installed
    const sentryModule = await import('@sentry/react').catch(() => null);
    if (!sentryModule) {
      return;
    }
    const Sentry = sentryModule;
    
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE || 'development',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      // Filter out known non-critical errors
      beforeSend(event: unknown, hint: { originalException?: unknown }) {
        // Filter out network errors that are expected
        if (hint.originalException instanceof Error) {
          const error = hint.originalException;
          // Ignore CORS errors, network timeouts, etc.
          if (
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('CORS')
          ) {
            return null; // Don't send to Sentry
          }
        }
        return event;
      },
    });

    isSentryInitialized = true;
    
    if (import.meta.env.DEV) {
      console.log('[Error Tracking] Sentry initialized successfully');
    }
  } catch (error) {
    console.warn('[Error Tracking] Failed to initialize Sentry:', error);
  }
};

/**
 * Log an error to the tracking service
 */
export const logError = (error: Error, errorInfo?: ErrorInfo): void => {
  if (isSentryInitialized) {
    try {
      // Dynamically import Sentry
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Sentry is optional dependency, may not be installed
      import('@sentry/react').catch(() => null).then((Sentry) => {
        if (!Sentry) {return;}
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo?.componentStack,
            },
          },
          tags: {
            errorBoundary: errorInfo?.errorBoundary || 'unknown',
          },
        });
      });
    } catch (err) {
      console.error('[Error Tracking] Failed to send error to Sentry:', err);
    }
  }

  // Always log to console in development
  if (import.meta.env.DEV) {
    console.error('[Error Tracking]', error, errorInfo);
  }
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (userId: string, email?: string, name?: string): void => {
  if (isSentryInitialized) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Sentry is optional dependency, may not be installed
    import('@sentry/react').catch(() => null).then((Sentry) => {
      if (!Sentry) {return;}
      Sentry.setUser({
        id: userId,
        email,
        username: name,
      });
    });
  }
};

/**
 * Clear user context (on logout)
 */
export const clearUserContext = (): void => {
  if (isSentryInitialized) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Sentry is optional dependency, may not be installed
    import('@sentry/react').catch(() => null).then((Sentry) => {
      if (!Sentry) {return;}
      Sentry.setUser(null);
    });
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, category?: string, level?: 'info' | 'warning' | 'error'): void => {
  if (isSentryInitialized) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Sentry is optional dependency, may not be installed
    import('@sentry/react').catch(() => null).then((Sentry) => {
      if (!Sentry) {return;}
      Sentry.addBreadcrumb({
        message,
        category: category || 'default',
        level: level || 'info',
      });
    });
  }
};

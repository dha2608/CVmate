// Analytics helper for product events
// Sends events to backend API for tracking and analysis

import { apiRequest } from './utils';

export type AnalyticsEventName =
  | 'cv_saved'
  | 'cv_ai_enhance'
  | 'interview_started'
  | 'interview_message_sent'
  | 'interview_ended'
  | 'job_applied'
  | 'cv_created'
  | 'cv_deleted'
  | 'cv_exported'
  | 'ats_checker_used'
  | 'template_selected'
  | 'user_registered'
  | 'user_logged_in'
  | 'premium_upgraded'
  | 'payment_completed'
  | 'page_view'
  | 'feature_used';

export interface AnalyticsPayload {
  [key: string]: unknown;
}

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Track an analytics event
 * Sends event to backend API for storage and analysis
 * Fails silently to not interrupt user experience
 */
export const trackEvent = async (name: AnalyticsEventName, payload?: AnalyticsPayload): Promise<void> => {
  try {
    const isDev = import.meta.env.DEV;
    
    // Log in development for debugging
    if (isDev) {
      console.log('[analytics]', name, payload || {});
    }

    // Get session ID
    const sessionId = getSessionId();

    // Send to backend API
    // Use fire-and-forget pattern to not block UI
    apiRequest<{ success: boolean; data: { id: string; eventName: string; timestamp: Date } }>('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        eventName: name,
        payload: payload || {},
        sessionId,
      }),
      requiresAuth: true, // Analytics can work with or without auth
    }).catch((error: unknown) => {
      // Silent fail - don't interrupt user experience
      if (isDev) {
        console.warn('[analytics] Failed to track event:', error);
      }
    });
  } catch (error: unknown) {
    // Silent fail - analytics should never break the app
    if (import.meta.env.DEV) {
      console.warn('[analytics] Error tracking event:', error);
    }
  }
};

/**
 * Track page view
 * Automatically called on route changes
 */
export const trackPageView = (path: string, title?: string): void => {
  trackEvent('page_view', {
    path,
    title: title || document.title,
  });
};

// Simple analytics helper for product events
// Hiện tại chỉ log ra console; có thể nâng cấp sau để gửi về backend / công cụ tracking

export type AnalyticsEventName =
  | 'cv_saved'
  | 'cv_ai_enhance'
  | 'interview_started'
  | 'interview_message_sent'
  | 'interview_ended'
  | 'job_applied';

export interface AnalyticsPayload {
  [key: string]: unknown;
}

export const trackEvent = (name: AnalyticsEventName, payload?: AnalyticsPayload) => {
  try {
    const isDev = import.meta.env.DEV;
    // Log in development only
    if (isDev) {
      console.log('[analytics]', name, payload || {});
    }
    // TODO: Send to backend analytics endpoint or third-party service
    // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ name, payload }) });
  } catch {
    // Silent fail
  }
};


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
    // Tạm thời: log ra console để dễ debug
    // Có thể thay thế bằng gửi request tới backend / bên thứ ba
    // eslint-disable-next-line no-console
    console.log('[analytics]', name, payload || {});
  } catch {
    // Silent fail
  }
};


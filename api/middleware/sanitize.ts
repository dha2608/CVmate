import { type Request, type Response, type NextFunction } from 'express';

// Very small, dependency-free sanitizer focused on removing executable HTML/script content.
// Frontend should still escape content on render; this is an additional backend guard.
const sanitizeString = (value: string): string => {
  let sanitized = value;

  // Remove script/style tags and their content
  sanitized = sanitized.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');

  // Strip on* event handlers (onclick, onerror, ...)
  sanitized = sanitized.replace(/\son\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/\son\w+='[^']*'/gi, '');

  // Strip javascript:, data: urls in href/src-style attributes
  sanitized = sanitized.replace(/\s(href|src)\s*=\s*"(javascript|data):[^"]*"/gi, '');
  sanitized = sanitized.replace(/\s(href|src)\s*=\s*'(javascript|data):[^']*'/gi, '');

  // Basic angle bracket escape to avoid simple HTML injection
  sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return sanitized;
};

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      result[key] = sanitizeValue(v);
    }
    return result;
  }

  return value;
};

export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  // Only sanitize non-file payloads; multer handles multipart/form-data separately.
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = sanitizeValue(req.body) as typeof req.body;
  }

  if (req.query && Object.keys(req.query).length > 0) {
    req.query = sanitizeValue(req.query) as typeof req.query;
  }

  if (req.params && Object.keys(req.params).length > 0) {
    req.params = sanitizeValue(req.params) as typeof req.params;
  }

  next();
};


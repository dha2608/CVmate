import { type Request, type Response, type NextFunction } from 'express';
import xss from 'xss';

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return xss(value, {
      whiteList: {
        a: ['href', 'title', 'target'],
        img: ['src', 'alt', 'title'],
      },
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
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

import type { Request } from 'express';
import csurf from 'csurf';
import logger from '../utils/logger.js';

/**
 * CSRF protection middleware.
 * Uses double-submit cookie strategy:
 *  - csurf sets a CSRF secret in a signed cookie
 *  - Frontend must send the token back in the `x-csrf-token` header for state-changing requests
 */
const isProduction = process.env.NODE_ENV === 'production';
const sameSiteValue = isProduction ? 'none' : 'lax';
const secureValue = isProduction;

// Log CSRF config on startup (only once)
if (!(global as any).csrfConfigLogged) {
  logger.info('CSRF Configuration:', {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    isProduction,
    sameSite: sameSiteValue,
    secure: secureValue,
  });
  (global as any).csrfConfigLogged = true;
}

export const csrfProtection = csurf({
  cookie: {
    key: 'cvmate_csrf',
    httpOnly: true,
    sameSite: sameSiteValue, // 'none' required for cross-origin in production
    secure: secureValue, // Must be true when sameSite is 'none'
  },
  value: (req: Request) => {
    return (req.headers['x-csrf-token'] as string) || '';
  },
});


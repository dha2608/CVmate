import type { Request } from 'express';
import csurf from 'csurf';

/**
 * CSRF protection middleware.
 * Uses double-submit cookie strategy:
 *  - csurf sets a CSRF secret in a signed cookie
 *  - Frontend must send the token back in the `x-csrf-token` header for state-changing requests
 */
export const csrfProtection = csurf({
  cookie: {
    key: 'cvmate_csrf',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  value: (req: Request) => {
    return (req.headers['x-csrf-token'] as string) || '';
  },
});


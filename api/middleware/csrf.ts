import type { Request } from 'express';
import csurf from 'csurf';

/**
 * CSRF protection middleware.
 * Uses double-submit cookie strategy:
 *  - csurf sets a CSRF secret in a signed cookie
 *  - Frontend must send the token back in the `x-csrf-token` header for state-changing requests
 */
const isProduction = process.env.NODE_ENV === 'production';

export const csrfProtection = csurf({
  cookie: {
    key: 'cvmate_csrf',
    httpOnly: true,
    // Use 'none' for cross-site (Vercel frontend -> Render backend)
    // This is required when frontend and backend are on different domains
    sameSite: isProduction ? 'none' : 'lax',
    // secure is required when sameSite is 'none'
    secure: isProduction,
  },
  value: (req: Request) => {
    return (req.headers['x-csrf-token'] as string) || '';
  },
});


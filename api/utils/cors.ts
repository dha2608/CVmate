/**
 * Shared CORS origin validation — used by SSE handlers that need explicit
 * Access-Control-Allow-Origin in writeHead() (Express cors middleware's
 * setHeader() headers don't survive Render/Vercel proxy 502s).
 */

const getAllowedOrigins = (): string[] =>
  process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:5173'];

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;

  const allowed = getAllowedOrigins();
  if (allowed.some((a) => origin === a || origin.startsWith(a))) return true;

  // Allow Vercel preview deployments
  if (origin.includes('.vercel.app') || origin.includes('.now.sh')) return true;

  // In development, allow localhost
  if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) return true;

  return false;
}

/**
 * Returns CORS headers for SSE writeHead(), validated against the allowlist.
 * Returns empty object if origin is not allowed.
 */
export function getSseCorsHeaders(origin: string | undefined): Record<string, string> {
  if (!origin || !isAllowedOrigin(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
  };
}

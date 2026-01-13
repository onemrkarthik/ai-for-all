/**
 * Middleware Configuration
 *
 * Centralized configuration for all middleware functionality.
 */

/**
 * Security Headers Configuration
 *
 * Content Security Policy and other security headers.
 */
export const securityConfig = {
  /**
   * Content Security Policy
   * Controls which resources can be loaded
   */
  contentSecurityPolicy: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Next.js requires unsafe-inline/eval
    'style-src': ["'self'", "'unsafe-inline'"], // Inline styles used in components
    'img-src': ["'self'", 'data:', 'https:', 'loremflickr.com'], // Allow external images
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'https://generativelanguage.googleapis.com'], // Gemini AI
    'frame-ancestors': ["'none'"], // Prevent clickjacking
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },

  /**
   * Additional Security Headers
   */
  headers: {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Control how much referrer information is included
    'Referrer-Policy': 'origin-when-cross-origin',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Enable browser XSS protection
    'X-XSS-Protection': '1; mode=block',

    // Control DNS prefetching
    'X-DNS-Prefetch-Control': 'on',

    // Permissions policy (formerly Feature-Policy)
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};

/**
 * Performance Monitoring Configuration
 */
export const performanceConfig = {
  /**
   * Enable performance timing headers
   */
  enableTimingHeaders: true,

  /**
   * Log slow requests (requests taking longer than this threshold)
   */
  slowRequestThreshold: 1000, // ms

  /**
   * Enable Server-Timing API headers
   */
  enableServerTiming: true,
};

/**
 * Logging Configuration
 */
export const loggingConfig = {
  /**
   * Enable request logging
   */
  enabled: true,

  /**
   * Log level: 'info' | 'warn' | 'error' | 'debug'
   */
  level: 'info' as const,

  /**
   * Include request body in logs (be careful with sensitive data)
   */
  logRequestBody: false,

  /**
   * Include response body in logs
   */
  logResponseBody: false,

  /**
   * Paths to exclude from logging (reduce noise)
   */
  excludePaths: [
    '/_next',
    '/favicon.ico',
    '/public',
  ],

  /**
   * Sensitive headers to redact from logs
   */
  sensitiveHeaders: [
    'authorization',
    'cookie',
    'x-api-key',
  ],
};

/**
 * Middleware Matcher Configuration
 *
 * Defines which routes the middleware should run on.
 */
export const matcherConfig = {
  /**
   * Include these paths
   */
  include: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],

  /**
   * Exclude these paths (will not run middleware)
   */
  exclude: [] as string[],
};

/**
 * Rate Limiting Configuration (future enhancement)
 */
export const rateLimitConfig = {
  /**
   * Enable rate limiting
   */
  enabled: false,

  /**
   * Requests per window
   */
  requestsPerWindow: 100,

  /**
   * Window duration in milliseconds
   */
  windowMs: 60000, // 1 minute
};

/**
 * Build CSP header string from config
 */
export function buildCSPHeader(): string {
  return Object.entries(securityConfig.contentSecurityPolicy)
    .map(([directive, sources]) => {
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

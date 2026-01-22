/**
 * Unit Tests for lib/proxy/config.ts
 *
 * Tests the middleware configuration and CSP builder.
 */

import {
  securityConfig,
  performanceConfig,
  loggingConfig,
  matcherConfig,
  rateLimitConfig,
  buildCSPHeader,
} from '@/lib/proxy/config';

describe('Middleware Configuration', () => {
  describe('securityConfig', () => {
    it('has valid content security policy', () => {
      expect(securityConfig.contentSecurityPolicy).toBeDefined();
      expect(securityConfig.contentSecurityPolicy['default-src']).toContain("'self'");
    });

    it('allows Gemini AI in connect-src', () => {
      const connectSrc = securityConfig.contentSecurityPolicy['connect-src'];
      expect(connectSrc).toContain('https://generativelanguage.googleapis.com');
    });

    it('prevents clickjacking with frame-ancestors', () => {
      expect(securityConfig.contentSecurityPolicy['frame-ancestors']).toContain("'none'");
    });

    it('has security headers defined', () => {
      expect(securityConfig.headers['X-Content-Type-Options']).toBe('nosniff');
      expect(securityConfig.headers['X-Frame-Options']).toBe('DENY');
      expect(securityConfig.headers['X-XSS-Protection']).toBe('1; mode=block');
    });

    it('has referrer policy defined', () => {
      expect(securityConfig.headers['Referrer-Policy']).toBe('origin-when-cross-origin');
    });

    it('has permissions policy for sensitive features', () => {
      expect(securityConfig.headers['Permissions-Policy']).toContain('camera=()');
      expect(securityConfig.headers['Permissions-Policy']).toContain('microphone=()');
    });
  });

  describe('performanceConfig', () => {
    it('has timing headers enabled', () => {
      expect(performanceConfig.enableTimingHeaders).toBe(true);
    });

    it('has slow request threshold defined', () => {
      expect(performanceConfig.slowRequestThreshold).toBe(1000);
    });

    it('has server timing enabled', () => {
      expect(performanceConfig.enableServerTiming).toBe(true);
    });
  });

  describe('loggingConfig', () => {
    it('has logging enabled', () => {
      expect(loggingConfig.enabled).toBe(true);
    });

    it('has appropriate log level', () => {
      expect(loggingConfig.level).toBe('info');
    });

    it('does not log request body by default', () => {
      expect(loggingConfig.logRequestBody).toBe(false);
    });

    it('excludes Next.js internal paths', () => {
      expect(loggingConfig.excludePaths).toContain('/_next');
      expect(loggingConfig.excludePaths).toContain('/favicon.ico');
    });

    it('redacts sensitive headers', () => {
      expect(loggingConfig.sensitiveHeaders).toContain('authorization');
      expect(loggingConfig.sensitiveHeaders).toContain('cookie');
    });
  });

  describe('matcherConfig', () => {
    it('has include patterns', () => {
      expect(matcherConfig.include.length).toBeGreaterThan(0);
    });

    it('excludes static files', () => {
      const pattern = matcherConfig.include[0];
      expect(pattern).toContain('_next/static');
      expect(pattern).toContain('_next/image');
      expect(pattern).toContain('favicon.ico');
    });
  });

  describe('rateLimitConfig', () => {
    it('is disabled by default', () => {
      expect(rateLimitConfig.enabled).toBe(false);
    });

    it('has reasonable default values', () => {
      expect(rateLimitConfig.requestsPerWindow).toBe(100);
      expect(rateLimitConfig.windowMs).toBe(60000);
    });
  });

  describe('buildCSPHeader', () => {
    it('returns a valid CSP string', () => {
      const csp = buildCSPHeader();
      expect(typeof csp).toBe('string');
      expect(csp.length).toBeGreaterThan(0);
    });

    it('includes default-src directive', () => {
      const csp = buildCSPHeader();
      expect(csp).toContain("default-src 'self'");
    });

    it('includes script-src directive', () => {
      const csp = buildCSPHeader();
      expect(csp).toContain('script-src');
    });

    it('includes connect-src directive with Gemini', () => {
      const csp = buildCSPHeader();
      expect(csp).toContain('connect-src');
      expect(csp).toContain('generativelanguage.googleapis.com');
    });

    it('separates directives with semicolons', () => {
      const csp = buildCSPHeader();
      expect(csp).toContain(';');
    });
  });
});

/**
 * Unit Tests for lib/proxy/config.ts
 *
 * Tests the middleware configuration and CSP header builder.
 */

import {
  securityConfig,
  performanceConfig,
  loggingConfig,
  matcherConfig,
  rateLimitConfig,
  buildCSPHeader,
} from '@/lib/proxy/config';

describe('Proxy Configuration', () => {
  describe('securityConfig', () => {
    it('has contentSecurityPolicy defined', () => {
      expect(securityConfig.contentSecurityPolicy).toBeDefined();
      expect(securityConfig.contentSecurityPolicy['default-src']).toContain("'self'");
    });

    it('has security headers defined', () => {
      expect(securityConfig.headers).toBeDefined();
      expect(securityConfig.headers['X-Content-Type-Options']).toBe('nosniff');
      expect(securityConfig.headers['X-Frame-Options']).toBe('DENY');
      expect(securityConfig.headers['X-XSS-Protection']).toBe('1; mode=block');
    });

    it('includes CSP directives for common sources', () => {
      const csp = securityConfig.contentSecurityPolicy;
      
      expect(csp['script-src']).toContain("'self'");
      expect(csp['style-src']).toContain("'self'");
      expect(csp['img-src']).toContain("'self'");
      expect(csp['font-src']).toContain("'self'");
      expect(csp['connect-src']).toContain("'self'");
    });

    it('includes Gemini API in connect-src', () => {
      expect(securityConfig.contentSecurityPolicy['connect-src']).toContain(
        'https://generativelanguage.googleapis.com'
      );
    });
  });

  describe('performanceConfig', () => {
    it('has timing headers enabled', () => {
      expect(performanceConfig.enableTimingHeaders).toBe(true);
    });

    it('has server timing enabled', () => {
      expect(performanceConfig.enableServerTiming).toBe(true);
    });

    it('has slow request threshold defined', () => {
      expect(performanceConfig.slowRequestThreshold).toBe(1000);
    });
  });

  describe('loggingConfig', () => {
    it('has logging enabled by default', () => {
      expect(loggingConfig.enabled).toBe(true);
    });

    it('has info log level', () => {
      expect(loggingConfig.level).toBe('info');
    });

    it('has request/response body logging disabled', () => {
      expect(loggingConfig.logRequestBody).toBe(false);
      expect(loggingConfig.logResponseBody).toBe(false);
    });

    it('has exclude paths defined', () => {
      expect(loggingConfig.excludePaths).toContain('/_next');
      expect(loggingConfig.excludePaths).toContain('/favicon.ico');
    });

    it('has sensitive headers defined', () => {
      expect(loggingConfig.sensitiveHeaders).toContain('authorization');
      expect(loggingConfig.sensitiveHeaders).toContain('cookie');
      expect(loggingConfig.sensitiveHeaders).toContain('x-api-key');
    });
  });

  describe('matcherConfig', () => {
    it('has include patterns defined', () => {
      expect(matcherConfig.include).toBeDefined();
      expect(matcherConfig.include.length).toBeGreaterThan(0);
    });

    it('has empty exclude array', () => {
      expect(matcherConfig.exclude).toEqual([]);
    });
  });

  describe('rateLimitConfig', () => {
    it('is disabled by default', () => {
      expect(rateLimitConfig.enabled).toBe(false);
    });

    it('has requests per window defined', () => {
      expect(rateLimitConfig.requestsPerWindow).toBe(100);
    });

    it('has window duration defined', () => {
      expect(rateLimitConfig.windowMs).toBe(60000);
    });
  });

  describe('buildCSPHeader', () => {
    it('returns a string', () => {
      const result = buildCSPHeader();
      expect(typeof result).toBe('string');
    });

    it('includes all CSP directives', () => {
      const result = buildCSPHeader();
      
      expect(result).toContain('default-src');
      expect(result).toContain('script-src');
      expect(result).toContain('style-src');
      expect(result).toContain('img-src');
      expect(result).toContain('font-src');
      expect(result).toContain('connect-src');
    });

    it('separates directives with semicolons', () => {
      const result = buildCSPHeader();
      expect(result).toContain(';');
    });

    it('includes self in default-src', () => {
      const result = buildCSPHeader();
      expect(result).toContain("default-src 'self'");
    });
  });
});

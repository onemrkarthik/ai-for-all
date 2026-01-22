/**
 * Unit Tests for lib/proxy/handlers.ts
 *
 * Tests the proxy handler functions.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  addSecurityHeaders,
  logRequest,
  startPerformanceMonitoring,
  endPerformanceMonitoring,
  handleProxyError,
  addCORSHeaders,
  addRequestId,
  addCompressionHeaders,
} from '@/lib/proxy/handlers';

/* eslint-disable @typescript-eslint/no-require-imports */
// Mock logger
jest.mock('@/lib/proxy/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    logRequest: jest.fn(),
    logPerformance: jest.fn(),
  },
}));

describe('Proxy Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addSecurityHeaders', () => {
    it('adds CSP header to response', () => {
      const request = new NextRequest('http://localhost/test');
      const response = NextResponse.next();

      const result = addSecurityHeaders(request, response);

      expect(result.headers.get('Content-Security-Policy')).toBeTruthy();
    });

    it('adds X-Content-Type-Options header', () => {
      const request = new NextRequest('http://localhost/test');
      const response = NextResponse.next();

      const result = addSecurityHeaders(request, response);

      expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('adds X-Frame-Options header', () => {
      const request = new NextRequest('http://localhost/test');
      const response = NextResponse.next();

      const result = addSecurityHeaders(request, response);

      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('adds X-XSS-Protection header', () => {
      const request = new NextRequest('http://localhost/test');
      const response = NextResponse.next();

      const result = addSecurityHeaders(request, response);

      expect(result.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });
  });

  describe('logRequest', () => {
    it('logs the request', () => {
      const { logger } = require('@/lib/proxy/logger');
      const request = new NextRequest('http://localhost/api/photos?id=1');

      logRequest(request);

      expect(logger.logRequest).toHaveBeenCalledWith(
        'GET',
        expect.stringContaining('/api/photos'),
        expect.anything()
      );
    });
  });

  describe('startPerformanceMonitoring', () => {
    it('returns a start time', () => {
      const request = new NextRequest('http://localhost/test');

      const startTime = startPerformanceMonitoring(request);

      expect(typeof startTime).toBe('number');
      expect(startTime).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('endPerformanceMonitoring', () => {
    it('adds X-Response-Time header', () => {
      const request = new NextRequest('http://localhost/test');
      const response = NextResponse.next();
      const startTime = Date.now() - 100; // 100ms ago

      const result = endPerformanceMonitoring(request, response, startTime);

      expect(result.headers.get('X-Response-Time')).toBeTruthy();
    });

    it('adds Server-Timing header', () => {
      const request = new NextRequest('http://localhost/test');
      const response = NextResponse.next();
      const startTime = Date.now() - 50;

      const result = endPerformanceMonitoring(request, response, startTime);

      expect(result.headers.get('Server-Timing')).toContain('total;dur=');
    });

    it('logs slow requests', () => {
      const { logger } = require('@/lib/proxy/logger');
      const request = new NextRequest('http://localhost/test');
      const response = NextResponse.next();
      const startTime = Date.now() - 2000; // 2 seconds ago

      endPerformanceMonitoring(request, response, startTime);

      expect(logger.warn).toHaveBeenCalledWith(
        'Slow request detected',
        expect.objectContaining({
          duration: expect.any(Number),
        })
      );
    });
  });

  describe('handleProxyError', () => {
    it('returns 500 response for errors', () => {
      const request = new NextRequest('http://localhost/test');
      const error = new Error('Test error');

      const result = handleProxyError(error, request);

      expect(result.status).toBe(500);
    });

    it('logs the error', () => {
      const { logger } = require('@/lib/proxy/logger');
      const request = new NextRequest('http://localhost/test');
      const error = new Error('Test error');

      handleProxyError(error, request);

      expect(logger.error).toHaveBeenCalledWith(
        'Proxy error',
        expect.objectContaining({
          error: 'Test error',
        })
      );
    });

    it('handles non-Error objects', () => {
      const { logger } = require('@/lib/proxy/logger');
      const request = new NextRequest('http://localhost/test');

      handleProxyError('String error', request);

      expect(logger.error).toHaveBeenCalledWith(
        'Proxy error',
        expect.objectContaining({
          error: 'String error',
        })
      );
    });
  });

  describe('addCORSHeaders', () => {
    it('adds CORS headers for API routes', () => {
      const request = new NextRequest('http://localhost/api/photos');
      const response = NextResponse.next();

      const result = addCORSHeaders(request, response);

      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(result.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });

    it('does not add CORS headers for non-API routes', () => {
      const request = new NextRequest('http://localhost/photos');
      const response = NextResponse.next();

      const result = addCORSHeaders(request, response);

      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('handles OPTIONS preflight requests', () => {
      const request = new NextRequest('http://localhost/api/photos', { method: 'OPTIONS' });
      const response = NextResponse.next();

      const result = addCORSHeaders(request, response);

      expect(result.status).toBe(204);
    });
  });

  describe('addRequestId', () => {
    it('adds X-Request-ID header', () => {
      const request = new NextRequest('http://localhost/test');
      const response = NextResponse.next();

      const result = addRequestId(request, response);

      expect(result.headers.get('X-Request-ID')).toBeTruthy();
      expect(result.headers.get('X-Request-ID')).toMatch(/^req_/);
    });
  });

  describe('addCompressionHeaders', () => {
    it('adds Vary header', () => {
      const response = NextResponse.next();

      const result = addCompressionHeaders(response);

      expect(result.headers.get('Vary')).toBe('Accept-Encoding');
    });
  });
});

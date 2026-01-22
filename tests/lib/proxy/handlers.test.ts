/**
 * Unit Tests for lib/proxy/handlers.ts
 *
 * Tests the middleware handler functions.
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
import { logger } from '@/lib/proxy/logger';

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: jest.fn().mockImplementation((body, init) => ({
    headers: new Map(Object.entries(init?.headers || {})),
    status: init?.status || 200,
  })),
}));

// Mock the logger
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

// Get typed mock
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Proxy Handlers', () => {
  let mockRequest: NextRequest;
  let mockResponse: NextResponse;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock request
    mockRequest = {
      method: 'GET',
      url: 'http://localhost:3000/api/test',
      nextUrl: {
        pathname: '/api/test',
        search: '',
      },
      headers: new Headers({
        'user-agent': 'TestAgent',
      }),
    } as unknown as NextRequest;

    // Create mock response with writable headers
    const headersMap = new Map<string, string>();
    mockResponse = {
      headers: {
        set: (key: string, value: string) => headersMap.set(key, value),
        get: (key: string) => headersMap.get(key),
        entries: () => headersMap.entries(),
      },
      status: 200,
    } as unknown as NextResponse;
  });

  describe('addSecurityHeaders', () => {
    it('adds CSP header to response', () => {
      const result = addSecurityHeaders(mockRequest, mockResponse);
      
      expect(result.headers.get('Content-Security-Policy')).toBeDefined();
    });

    it('adds X-Content-Type-Options header', () => {
      const result = addSecurityHeaders(mockRequest, mockResponse);
      
      expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('adds X-Frame-Options header', () => {
      const result = addSecurityHeaders(mockRequest, mockResponse);
      
      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('adds X-XSS-Protection header', () => {
      const result = addSecurityHeaders(mockRequest, mockResponse);
      
      expect(result.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });
  });

  describe('logRequest', () => {
    it('calls logger.logRequest', () => {
      logRequest(mockRequest);
      
      expect(mockLogger.logRequest).toHaveBeenCalledWith(
        'GET',
        '/api/test',
        mockRequest.headers
      );
    });
  });

  describe('startPerformanceMonitoring', () => {
    it('returns start time', () => {
      const startTime = startPerformanceMonitoring(mockRequest);
      
      expect(typeof startTime).toBe('number');
      expect(startTime).toBeGreaterThan(0);
    });

    it('returns current timestamp', () => {
      const before = Date.now();
      const startTime = startPerformanceMonitoring(mockRequest);
      const after = Date.now();
      
      expect(startTime).toBeGreaterThanOrEqual(before);
      expect(startTime).toBeLessThanOrEqual(after);
    });
  });

  describe('endPerformanceMonitoring', () => {
    it('adds X-Response-Time header', () => {
      const startTime = Date.now() - 100; // 100ms ago
      
      const result = endPerformanceMonitoring(mockRequest, mockResponse, startTime);
      
      expect(result.headers.get('X-Response-Time')).toMatch(/\d+ms/);
    });

    it('adds Server-Timing header', () => {
      const startTime = Date.now() - 50;
      
      const result = endPerformanceMonitoring(mockRequest, mockResponse, startTime);
      
      expect(result.headers.get('Server-Timing')).toMatch(/total;dur=\d+/);
    });

    it('logs performance', () => {
      const startTime = Date.now() - 100;
      
      endPerformanceMonitoring(mockRequest, mockResponse, startTime);
      
      expect(mockLogger.logPerformance).toHaveBeenCalled();
    });

    it('warns on slow requests', () => {
      const startTime = Date.now() - 2000; // 2 seconds ago
      
      endPerformanceMonitoring(mockRequest, mockResponse, startTime);
      
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('handleProxyError', () => {
    it('logs the error', () => {
      const error = new Error('Test error');
      
      handleProxyError(error, mockRequest);
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Proxy error',
        expect.objectContaining({
          error: 'Test error',
          method: 'GET',
          url: 'http://localhost:3000/api/test',
        })
      );
    });

    it('handles non-Error objects', () => {
      handleProxyError('string error', mockRequest);
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Proxy error',
        expect.objectContaining({
          error: 'string error',
        })
      );
    });
  });

  describe('addCORSHeaders', () => {
    it('adds CORS headers for API routes', () => {
      const result = addCORSHeaders(mockRequest, mockResponse);
      
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(result.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(result.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });

    it('does not add CORS headers for non-API routes', () => {
      mockRequest.nextUrl.pathname = '/page';
      
      const result = addCORSHeaders(mockRequest, mockResponse);
      
      expect(result.headers.get('Access-Control-Allow-Origin')).toBeUndefined();
    });
  });

  describe('addRequestId', () => {
    it('adds X-Request-ID header', () => {
      const result = addRequestId(mockRequest, mockResponse);
      
      const requestId = result.headers.get('X-Request-ID');
      expect(requestId).toBeDefined();
      expect(requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('generates unique request IDs', () => {
      // Create separate response objects to test unique IDs
      const headersMap1 = new Map<string, string>();
      const mockResponse1 = {
        headers: {
          set: (key: string, value: string) => headersMap1.set(key, value),
          get: (key: string) => headersMap1.get(key),
        },
        status: 200,
      } as unknown as NextResponse;

      const headersMap2 = new Map<string, string>();
      const mockResponse2 = {
        headers: {
          set: (key: string, value: string) => headersMap2.set(key, value),
          get: (key: string) => headersMap2.get(key),
        },
        status: 200,
      } as unknown as NextResponse;

      addRequestId(mockRequest, mockResponse1);
      addRequestId(mockRequest, mockResponse2);
      
      expect(mockResponse1.headers.get('X-Request-ID')).not.toBe(mockResponse2.headers.get('X-Request-ID'));
    });
  });

  describe('addCompressionHeaders', () => {
    it('adds Vary header', () => {
      const result = addCompressionHeaders(mockResponse);
      
      expect(result.headers.get('Vary')).toBe('Accept-Encoding');
    });
  });
});

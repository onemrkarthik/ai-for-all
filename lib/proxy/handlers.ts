/**
 * Proxy Handlers
 *
 * Individual proxy handler functions that can be composed together.
 */

import { NextRequest, NextResponse } from 'next/server';
import { securityConfig, performanceConfig, buildCSPHeader } from './config';
import { logger } from './logger';

/**
 * Performance timing data stored during request lifecycle
 */
const requestTimings = new Map<string, number>();

/**
 * Security Headers Middleware
 *
 * Adds security headers to all responses.
 *
 * @param request - Incoming request
 * @param response - Response to modify
 * @returns Modified response with security headers
 */
export function addSecurityHeaders(request: NextRequest, response: NextResponse): NextResponse {
  // Add CSP header
  const cspHeader = buildCSPHeader();
  response.headers.set('Content-Security-Policy', cspHeader);

  // Add other security headers
  Object.entries(securityConfig.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  logger.debug('Security headers added', {
    url: request.url,
    headers: Object.keys(securityConfig.headers),
  });

  return response;
}

/**
 * Request Logging Middleware
 *
 * Logs incoming requests with method, URL, and headers.
 *
 * @param request - Incoming request
 */
export function logRequest(request: NextRequest): void {
  logger.logRequest(
    request.method,
    request.nextUrl.pathname + request.nextUrl.search,
    request.headers
  );
}

/**
 * Performance Monitoring Middleware (Start)
 *
 * Records the start time of a request for performance tracking.
 *
 * @param request - Incoming request
 * @returns Request start time
 */
export function startPerformanceMonitoring(request: NextRequest): number {
  const startTime = Date.now();
  const requestKey = `${request.method}:${request.url}`;
  requestTimings.set(requestKey, startTime);

  return startTime;
}

/**
 * Performance Monitoring Middleware (End)
 *
 * Calculates request duration and adds performance headers.
 *
 * @param request - Incoming request
 * @param response - Response to modify
 * @param startTime - Request start time
 * @returns Modified response with performance headers
 */
export function endPerformanceMonitoring(
  request: NextRequest,
  response: NextResponse,
  startTime: number
): NextResponse {
  const duration = Date.now() - startTime;
  const requestKey = `${request.method}:${request.url}`;

  // Clean up timing data
  requestTimings.delete(requestKey);

  // Log performance
  logger.logPerformance(
    request.method,
    request.nextUrl.pathname + request.nextUrl.search,
    duration,
    response.status
  );

  // Add performance headers if enabled
  if (performanceConfig.enableTimingHeaders) {
    response.headers.set('X-Response-Time', `${duration}ms`);
  }

  // Add Server-Timing API header if enabled
  if (performanceConfig.enableServerTiming) {
    response.headers.set('Server-Timing', `total;dur=${duration}`);
  }

  // Warn on slow requests
  if (duration > performanceConfig.slowRequestThreshold) {
    logger.warn('Slow request detected', {
      method: request.method,
      url: request.nextUrl.pathname,
      duration,
      threshold: performanceConfig.slowRequestThreshold,
    });
  }

  return response;
}

/**
 * Error Handling Proxy
 *
 * Catches and logs errors in proxy execution.
 *
 * @param error - Error that occurred
 * @param request - Incoming request
 * @returns Error response
 */
export function handleProxyError(error: unknown, request: NextRequest): NextResponse {
  logger.error('Proxy error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    method: request.method,
    url: request.url,
  });

  // Return a generic error response
  // In production, you might want to return a custom error page
  return new NextResponse('Internal Server Error', { status: 500 });
}

/**
 * CORS Headers Middleware (Optional)
 *
 * Adds CORS headers if needed for API routes.
 *
 * @param request - Incoming request
 * @param response - Response to modify
 * @returns Modified response with CORS headers
 */
export function addCORSHeaders(request: NextRequest, response: NextResponse): NextResponse {
  // Only add CORS headers for API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return response;
  }

  // Add CORS headers (customize as needed)
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

/**
 * Request ID Middleware
 *
 * Adds a unique request ID to each request for tracing.
 *
 * @param request - Incoming request
 * @param response - Response to modify
 * @returns Modified response with request ID header
 */
export function addRequestId(request: NextRequest, response: NextResponse): NextResponse {
  // Generate unique request ID
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add to response headers
  response.headers.set('X-Request-ID', requestId);

  logger.debug('Request ID generated', {
    requestId,
    url: request.url,
  });

  return response;
}

/**
 * Compression Headers Middleware
 *
 * Adds headers to enable compression.
 *
 * @param response - Response to modify
 * @returns Modified response with compression hints
 */
export function addCompressionHeaders(response: NextResponse): NextResponse {
  // Next.js handles compression automatically, but we can add hints
  response.headers.set('Vary', 'Accept-Encoding');

  return response;
}

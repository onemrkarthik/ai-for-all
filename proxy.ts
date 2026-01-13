/**
 * Next.js Proxy
 *
 * Runs before every route is handled. This file must be at the root level.
 *
 * Features:
 * - Request logging
 * - Performance monitoring
 * - Security headers (CSP, X-Frame-Options, etc.)
 * - Request ID tracking
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  logRequest,
  addSecurityHeaders,
  startPerformanceMonitoring,
  endPerformanceMonitoring,
  handleProxyError,
  addRequestId,
  addCompressionHeaders,
} from './lib/proxy/handlers';

/**
 * Main proxy function
 *
 * Executes in the order:
 * 1. Request logging
 * 2. Performance monitoring (start)
 * 3. Process request (Next.js routing)
 * 4. Add security headers
 * 5. Add request ID
 * 6. Add compression headers
 * 7. Performance monitoring (end)
 *
 * @param request - Incoming request
 * @returns Response with added headers
 */
export async function proxy(request: NextRequest) {
  try {
    // 1. Log incoming request
    logRequest(request);

    // 2. Start performance monitoring
    const startTime = startPerformanceMonitoring(request);

    // 3. Continue with the request (get response from route handler)
    const response = NextResponse.next();

    // 4. Add security headers
    addSecurityHeaders(request, response);

    // 5. Add request ID for tracing
    addRequestId(request, response);

    // 6. Add compression hints
    addCompressionHeaders(response);

    // 7. End performance monitoring and add timing headers
    endPerformanceMonitoring(request, response, startTime);

    return response;
  } catch (error) {
    // Handle any errors in proxy execution
    return handleProxyError(error, request);
  }
}

/**
 * Proxy Configuration
 *
 * Specifies which routes this proxy should run on.
 * Uses a matcher pattern to include/exclude paths.
 *
 * Match all request paths except for the ones starting with:
 * - _next/static (static files)
 * - _next/image (image optimization files)
 * - favicon.ico (favicon file)
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

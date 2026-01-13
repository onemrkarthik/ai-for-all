# Middleware System

Centralized middleware management for request handling, logging, security, and performance monitoring.

## Overview

The middleware runs **before every route** is handled, providing a central place to:
- Log incoming requests
- Monitor performance
- Add security headers
- Track request IDs
- Handle errors

## Architecture

```
/middleware.ts           # Main middleware (must be at root)
/lib/middleware/
├── config.ts           # Configuration
├── logger.ts           # Logging utilities
├── handlers.ts         # Individual middleware handlers
├── index.ts            # Public exports
└── README.md           # This file
```

## Features

### 1. Request Logging

Logs all incoming requests with method, URL, user agent, and IP address.

```
ℹ️ [2026-01-09T...] [INFO] → GET /api/photos/1
ℹ️ [2026-01-09T...] [INFO] ✅ GET /api/photos/1 - 200 (45.23ms)
```

**Configuration** (`lib/middleware/config.ts`):
```typescript
export const loggingConfig = {
  enabled: true,
  level: 'info',
  excludePaths: ['/_next', '/favicon.ico'],
  sensitiveHeaders: ['authorization', 'cookie'],
};
```

### 2. Performance Monitoring

Tracks request duration and adds performance headers to responses.

**Headers Added:**
- `X-Response-Time`: Request duration in milliseconds
- `Server-Timing`: Server-Timing API for browser DevTools

**Slow Request Detection:**
Requests exceeding the threshold (default: 1000ms) are logged as warnings.

```
⚠️ [2026-01-09T...] [WARN] Slow request detected
  {
    "method": "GET",
    "url": "/api/slow-endpoint",
    "duration": 1523.45,
    "threshold": 1000
  }
```

**Configuration:**
```typescript
export const performanceConfig = {
  enableTimingHeaders: true,
  slowRequestThreshold: 1000, // ms
  enableServerTiming: true,
};
```

### 3. Security Headers

Adds comprehensive security headers to all responses:

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Configurable CSP | Prevent XSS, code injection |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Enable browser XSS protection |
| `Referrer-Policy` | `origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | Camera, mic, geo disabled | Control browser features |

**CSP Configuration:**
```typescript
export const securityConfig = {
  contentSecurityPolicy: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'https:', 'loremflickr.com'],
    // ... more directives
  },
};
```

### 4. Request ID Tracking

Adds a unique ID to each request for distributed tracing:

```
X-Request-ID: req_1704844800000_abc123xyz
```

Useful for:
- Correlating logs across services
- Debugging specific requests
- Performance analysis

### 5. Error Handling

Catches and logs errors in middleware execution:

```
❌ [2026-01-09T...] [ERROR] Middleware error
  {
    "error": "Database connection failed",
    "stack": "Error: ...",
    "method": "GET",
    "url": "/api/endpoint"
  }
```

## Usage

### Basic Usage

The middleware runs automatically on all routes. No action needed!

### Access Logger in Application Code

```typescript
import { logger } from '@/lib/middleware';

// In your API route or component
logger.info('User action', { userId: 123, action: 'login' });
logger.warn('Deprecation warning', { feature: 'oldAPI' });
logger.error('Operation failed', { error: err.message });
```

### Modify Configuration

Edit `/lib/middleware/config.ts`:

```typescript
// Enable/disable features
export const loggingConfig = {
  enabled: true, // Set to false to disable logging
  level: 'debug', // Change log level
};

// Adjust performance thresholds
export const performanceConfig = {
  slowRequestThreshold: 500, // Lower threshold
};

// Add custom security headers
export const securityConfig = {
  headers: {
    'X-Custom-Header': 'custom-value',
  },
};
```

### Exclude Paths from Middleware

Edit matcher configuration in `/lib/middleware/config.ts`:

```typescript
export const matcherConfig = {
  include: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  exclude: [
    '/public',
    '/admin', // Example: exclude admin routes
  ],
};
```

Then update `/middleware.ts` config:

```typescript
export const config = {
  matcher: matcherConfig.include,
};
```

### Add Custom Middleware Handler

1. **Create handler** in `/lib/middleware/handlers.ts`:

```typescript
export function myCustomHandler(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  // Your logic here
  response.headers.set('X-Custom', 'value');
  return response;
}
```

2. **Use in main middleware** (`/middleware.ts`):

```typescript
import { myCustomHandler } from './lib/middleware/handlers';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add your custom handler
  myCustomHandler(request, response);

  return response;
}
```

## Middleware Execution Order

```
1. Request arrives
2. Log request (logRequest)
3. Start performance timer (startPerformanceMonitoring)
4. Next.js processes route
5. Add security headers (addSecurityHeaders)
6. Add request ID (addRequestId)
7. Add compression headers (addCompressionHeaders)
8. End performance timer (endPerformanceMonitoring)
9. Response sent
```

## Performance Impact

Middleware overhead is minimal:
- Request logging: ~1-2ms
- Security headers: ~0.5ms
- Performance monitoring: ~0.5ms
- **Total: ~2-3ms per request**

## Debugging

### View Middleware Logs

Check your console/terminal where Next.js is running:

```
ℹ️ [2026-01-09T10:30:00.000Z] [INFO] → GET /api/photos
ℹ️ [2026-01-09T10:30:00.050Z] [INFO] ✅ GET /api/photos - 200 (50.23ms)
```

### Enable Debug Logging

In `/lib/middleware/config.ts`:

```typescript
export const loggingConfig = {
  level: 'debug', // Show debug logs
};
```

### Check Response Headers

In browser DevTools (Network tab), inspect response headers:

```
X-Response-Time: 45.23ms
X-Request-ID: req_1704844800000_abc123xyz
Server-Timing: total;dur=45.23
Content-Security-Policy: default-src 'self'; ...
```

## Common Patterns

### Conditional Middleware

Run middleware only for specific routes:

```typescript
export async function middleware(request: NextRequest) {
  // Only run for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Your API-specific middleware
  }

  return NextResponse.next();
}
```

### Modify Requests

```typescript
export async function middleware(request: NextRequest) {
  // Add custom header to request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-custom-header', 'value');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
```

### Redirect Based on Conditions

```typescript
export async function middleware(request: NextRequest) {
  // Example: Redirect unauthenticated users
  const isAuthenticated = request.cookies.get('auth-token');

  if (!isAuthenticated && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

## Best Practices

- ✅ Keep middleware lightweight (avoid heavy computations)
- ✅ Use async operations sparingly
- ✅ Log important events, not every detail
- ✅ Set appropriate performance thresholds
- ✅ Exclude static assets from logging
- ✅ Redact sensitive data from logs
- ❌ Don't perform database queries in middleware
- ❌ Don't make external API calls unnecessarily
- ❌ Don't log sensitive information (passwords, tokens)

## Troubleshooting

### Middleware Not Running

1. Check file location: Must be `/middleware.ts` at root
2. Check matcher configuration
3. Verify Next.js version (middleware requires 12.2+)

### Headers Not Appearing

1. Check if route is excluded in matcher
2. Verify response is being returned
3. Check for header conflicts in route handlers

### Performance Issues

1. Reduce logging verbosity
2. Exclude more paths from logging
3. Disable unnecessary features
4. Check for slow operations in custom handlers

## Future Enhancements

Potential features to add:

- [ ] Rate limiting per IP/user
- [ ] Request/response caching
- [ ] A/B testing support
- [ ] Feature flags
- [ ] Authentication helpers
- [ ] Bot detection
- [ ] Geographic routing

## See Also

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [ARCHITECTURE.md](/ARCHITECTURE.md) - Full architecture documentation
- [Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)

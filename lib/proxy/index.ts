/**
 * Proxy Module
 *
 * Centralized proxy utilities for request handling.
 *
 * @example
 * ```ts
 * import { logger } from '@/lib/proxy';
 *
 * logger.info('Custom log message', { data: 'example' });
 * ```
 */

// Export configuration
export {
  securityConfig,
  performanceConfig,
  loggingConfig,
  matcherConfig,
  rateLimitConfig,
  buildCSPHeader,
} from './config';

// Export logger
export { logger, LogLevel } from './logger';
export type { LogEntry, RequestLogEntry, PerformanceLogEntry } from './logger';

// Export handlers
export {
  addSecurityHeaders,
  logRequest,
  startPerformanceMonitoring,
  endPerformanceMonitoring,
  handleProxyError,
  addCORSHeaders,
  addRequestId,
  addCompressionHeaders,
} from './handlers';

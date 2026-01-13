/**
 * Middleware Logger
 *
 * Provides structured logging for middleware operations.
 */

import { loggingConfig } from './config';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Request log entry
 */
export interface RequestLogEntry extends LogEntry {
  method: string;
  url: string;
  userAgent?: string;
  referer?: string;
  ip?: string;
}

/**
 * Performance log entry
 */
export interface PerformanceLogEntry extends LogEntry {
  method: string;
  url: string;
  duration: number;
  status?: number;
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const emoji = {
    [LogLevel.DEBUG]: '🔍',
    [LogLevel.INFO]: 'ℹ️',
    [LogLevel.WARN]: '⚠️',
    [LogLevel.ERROR]: '❌',
  };

  const parts = [
    `${emoji[entry.level]} [${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    entry.message,
  ];

  if (entry.data) {
    parts.push(JSON.stringify(entry.data, null, 2));
  }

  return parts.join(' ');
}

/**
 * Redact sensitive data from objects
 */
function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted = { ...obj };

  for (const key of loggingConfig.sensitiveHeaders) {
    if (key in redacted) {
      redacted[key] = '[REDACTED]';
    }
  }

  return redacted;
}

/**
 * Logger class
 */
class Logger {
  private enabled: boolean;

  constructor() {
    this.enabled = loggingConfig.enabled;
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!this.enabled) return;

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      data: data ? redactSensitive(data) : undefined,
    };

    const formatted = formatLogEntry(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.log(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log error message
   */
  error(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log incoming request
   */
  logRequest(method: string, url: string, headers?: Headers): void {
    if (!this.enabled) return;

    // Check if path should be excluded
    const shouldExclude = loggingConfig.excludePaths.some(path => url.includes(path));
    if (shouldExclude) return;

    const entry: Partial<RequestLogEntry> = {
      method,
      url,
    };

    if (headers) {
      entry.userAgent = headers.get('user-agent') || undefined;
      entry.referer = headers.get('referer') || undefined;
      entry.ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || undefined;
    }

    this.info(`→ ${method} ${url}`, entry as Record<string, unknown>);
  }

  /**
   * Log request performance
   */
  logPerformance(method: string, url: string, duration: number, status?: number): void {
    if (!this.enabled) return;

    // Check if path should be excluded
    const shouldExclude = loggingConfig.excludePaths.some(path => url.includes(path));
    if (shouldExclude) return;

    const entry: Partial<PerformanceLogEntry> = {
      method,
      url,
      duration,
      status,
    };

    const durationFormatted = `${duration.toFixed(2)}ms`;
    const statusEmoji = status && status >= 400 ? '❌' : '✅';

    const message = status
      ? `${statusEmoji} ${method} ${url} - ${status} (${durationFormatted})`
      : `← ${method} ${url} (${durationFormatted})`;

    // Warn on slow requests
    if (duration > 1000) {
      this.warn(message, entry as Record<string, unknown>);
    } else {
      this.info(message, entry as Record<string, unknown>);
    }
  }
}

/**
 * Export singleton logger instance
 */
export const logger = new Logger();

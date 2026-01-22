/**
 * Unit Tests for lib/proxy/logger.ts
 *
 * Tests the middleware logger functionality.
 */

import { logger, LogLevel } from '@/lib/proxy/logger';

describe('Proxy Logger', () => {
  let consoleSpy: {
    debug: jest.SpyInstance;
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('LogLevel enum', () => {
    it('has all log levels defined', () => {
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
    });
  });

  describe('logger.debug', () => {
    it('logs debug messages', () => {
      logger.debug('Test debug message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('includes data in debug logs', () => {
      logger.debug('Test debug', { key: 'value' });
      expect(consoleSpy.debug).toHaveBeenCalled();
    });
  });

  describe('logger.info', () => {
    it('logs info messages', () => {
      logger.info('Test info message');
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('includes data in info logs', () => {
      logger.info('Test info', { key: 'value' });
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe('logger.warn', () => {
    it('logs warning messages', () => {
      logger.warn('Test warning message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('includes data in warning logs', () => {
      logger.warn('Test warning', { key: 'value' });
      expect(consoleSpy.warn).toHaveBeenCalled();
    });
  });

  describe('logger.error', () => {
    it('logs error messages', () => {
      logger.error('Test error message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('includes data in error logs', () => {
      logger.error('Test error', { key: 'value' });
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('logger.logRequest', () => {
    it('logs requests with method and URL', () => {
      logger.logRequest('GET', '/api/test');
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('logs requests with headers', () => {
      const headers = new Headers({
        'user-agent': 'TestAgent',
        'referer': 'http://localhost',
      });
      logger.logRequest('POST', '/api/test', headers);
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('excludes paths from logging config', () => {
      logger.logRequest('GET', '/_next/static/chunk.js');
      // Should not log excluded paths
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('excludes favicon from logging', () => {
      logger.logRequest('GET', '/favicon.ico');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('logger.logPerformance', () => {
    it('logs performance with duration', () => {
      logger.logPerformance('GET', '/api/test', 150);
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('logs performance with status code', () => {
      logger.logPerformance('GET', '/api/test', 100, 200);
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('logs warning for slow requests', () => {
      logger.logPerformance('GET', '/api/slow', 1500);
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('excludes paths from performance logging', () => {
      logger.logPerformance('GET', '/_next/static/chunk.js', 100);
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('sensitive data redaction', () => {
    it('redacts authorization header', () => {
      logger.info('Test', { authorization: 'Bearer secret123' });
      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).not.toContain('secret123');
    });

    it('redacts cookie header', () => {
      logger.info('Test', { cookie: 'session=abc123' });
      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).not.toContain('abc123');
    });

    it('redacts x-api-key header', () => {
      logger.info('Test', { 'x-api-key': 'my-secret-key' });
      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).not.toContain('my-secret-key');
    });
  });
});

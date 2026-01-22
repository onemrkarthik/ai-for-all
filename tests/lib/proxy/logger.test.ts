/**
 * Unit Tests for lib/proxy/logger.ts
 *
 * Tests the middleware logger.
 */

import { logger, LogLevel } from '@/lib/proxy/logger';

describe('Middleware Logger', () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('LogLevel enum', () => {
    it('has correct values', () => {
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
    });
  });

  describe('logger.info', () => {
    it('logs info messages', () => {
      logger.info('Test info message');

      expect(console.log).toHaveBeenCalled();
    });

    it('logs info messages with data', () => {
      logger.info('Test message', { key: 'value' });

      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('logger.warn', () => {
    it('logs warning messages', () => {
      logger.warn('Test warning');

      expect(console.warn).toHaveBeenCalled();
    });

    it('logs warning messages with data', () => {
      logger.warn('Test warning', { issue: 'something' });

      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('logger.error', () => {
    it('logs error messages', () => {
      logger.error('Test error');

      expect(console.error).toHaveBeenCalled();
    });

    it('logs error messages with data', () => {
      logger.error('Test error', { details: 'error details' });

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('logger.debug', () => {
    it('logs debug messages', () => {
      logger.debug('Test debug');

      // Debug may or may not log depending on log level config
      // Just ensure it doesn't throw
      expect(() => logger.debug('Test')).not.toThrow();
    });
  });

  describe('logger.logRequest', () => {
    it('logs request information', () => {
      const headers = new Headers();
      headers.set('user-agent', 'Test Agent');
      headers.set('referer', 'http://example.com');

      logger.logRequest('GET', '/api/photos', headers);

      expect(console.log).toHaveBeenCalled();
    });

    it('handles missing headers', () => {
      const headers = new Headers();

      expect(() => logger.logRequest('GET', '/api/photos', headers)).not.toThrow();
    });
  });

  describe('logger.logPerformance', () => {
    it('logs performance information', () => {
      logger.logPerformance('GET', '/api/photos', 150, 200);

      expect(console.log).toHaveBeenCalled();
    });

    it('logs performance without status', () => {
      logger.logPerformance('POST', '/api/contact', 200);

      expect(console.log).toHaveBeenCalled();
    });
  });
});

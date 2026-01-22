/**
 * Unit Tests for lib/api/builder.ts
 *
 * Tests API route building utilities.
 */

import { buildUrl, RouteBuilder, createRouteBuilder } from '@/lib/api/builder';
import type { RouteConfig } from '@/lib/api/config';

describe('API Builder Utilities', () => {
  // Mock route configs for testing
  const mockRouteGet: RouteConfig<{ id: number }, never, never, unknown> = {
    method: 'GET',
    path: '/api/photos/:id',
  };

  const mockRouteWithQuery: RouteConfig<
    never,
    { offset: number; limit: number },
    never,
    unknown
  > = {
    method: 'GET',
    path: '/api/feed',
  };

  const mockRouteWithBoth: RouteConfig<
    { id: number },
    { tab?: string },
    never,
    unknown
  > = {
    method: 'GET',
    path: '/api/professionals/:id',
  };

  describe('buildUrl', () => {
    it('returns path unchanged when no params', () => {
      const config: RouteConfig = { method: 'GET', path: '/api/test' };
      expect(buildUrl(config)).toBe('/api/test');
    });

    it('substitutes path parameters', () => {
      const result = buildUrl(mockRouteGet, {
        pathParams: { id: 123 },
      });
      expect(result).toBe('/api/photos/123');
    });

    it('adds query parameters', () => {
      const result = buildUrl(mockRouteWithQuery, {
        queryParams: { offset: 20, limit: 10 },
      });
      expect(result).toContain('/api/feed?');
      expect(result).toContain('offset=20');
      expect(result).toContain('limit=10');
    });

    it('combines path and query parameters', () => {
      const result = buildUrl(mockRouteWithBoth, {
        pathParams: { id: 5 },
        queryParams: { tab: 'photos' },
      });
      expect(result).toBe('/api/professionals/5?tab=photos');
    });

    it('filters out undefined and null query params', () => {
      const result = buildUrl(mockRouteWithBoth, {
        pathParams: { id: 1 },
        queryParams: { tab: undefined },
      });
      expect(result).toBe('/api/professionals/1');
    });

    it('JSON stringifies object query params', () => {
      const config: RouteConfig<never, { filters: object }, never, unknown> = {
        method: 'GET',
        path: '/api/search',
      };
      const result = buildUrl(config, {
        queryParams: { filters: { color: 'blue', size: 'large' } },
      });
      expect(result).toContain('/api/search?');
      expect(result).toContain('filters=');
      // URL encoded JSON
      expect(decodeURIComponent(result)).toContain(
        '{"color":"blue","size":"large"}'
      );
    });
  });

  describe('RouteBuilder', () => {
    it('builds URL with path params', () => {
      const builder = new RouteBuilder(mockRouteGet);
      const url = builder.url({ pathParams: { id: 456 } });
      expect(url).toBe('/api/photos/456');
    });

    it('exposes HTTP method', () => {
      const builder = new RouteBuilder(mockRouteGet);
      expect(builder.method).toBe('GET');
    });

    it('exposes path template', () => {
      const builder = new RouteBuilder(mockRouteGet);
      expect(builder.path).toBe('/api/photos/:id');
    });

    it('builds URL without params', () => {
      const config: RouteConfig = { method: 'GET', path: '/api/health' };
      const builder = new RouteBuilder(config);
      expect(builder.url()).toBe('/api/health');
    });
  });

  describe('createRouteBuilder', () => {
    it('creates RouteBuilder instance', () => {
      const builder = createRouteBuilder(mockRouteGet);
      expect(builder).toBeInstanceOf(RouteBuilder);
    });

    it('creates functional builder', () => {
      const builder = createRouteBuilder(mockRouteGet);
      expect(builder.url({ pathParams: { id: 789 } })).toBe('/api/photos/789');
    });
  });
});

/**
 * Unit Tests for lib/navigation/routes.ts
 *
 * Tests route building and navigation helpers.
 */

import { buildRoute, routes, nav } from '@/lib/navigation/routes';

describe('Navigation Routes', () => {
  describe('buildRoute', () => {
    it('returns path unchanged when no params provided', () => {
      expect(buildRoute('/test')).toBe('/test');
      expect(buildRoute('/')).toBe('/');
    });

    it('substitutes path parameters', () => {
      const result = buildRoute('/professionals/:id', {
        pathParams: { id: 5 },
      });
      expect(result).toBe('/professionals/5');
    });

    it('substitutes multiple path parameters', () => {
      const result = buildRoute('/users/:userId/posts/:postId', {
        pathParams: { userId: 10, postId: 20 },
      });
      expect(result).toBe('/users/10/posts/20');
    });

    it('adds query parameters', () => {
      const result = buildRoute('/', {
        queryParams: { photo: 123 },
      });
      expect(result).toBe('/?photo=123');
    });

    it('adds multiple query parameters', () => {
      const result = buildRoute('/search', {
        queryParams: { q: 'kitchen', page: 2 },
      });
      // URLSearchParams may order differently, check both params exist
      expect(result).toContain('/search?');
      expect(result).toContain('q=kitchen');
      expect(result).toContain('page=2');
    });

    it('combines path and query parameters', () => {
      const result = buildRoute('/professionals/:id', {
        pathParams: { id: 5 },
        queryParams: { tab: 'photos' },
      });
      expect(result).toBe('/professionals/5?tab=photos');
    });

    it('filters out undefined and null query params', () => {
      const result = buildRoute('/test', {
        queryParams: { a: 1, b: undefined, c: null, d: 'valid' },
      });
      expect(result).toContain('a=1');
      expect(result).toContain('d=valid');
      expect(result).not.toContain('b=');
      expect(result).not.toContain('c=');
    });

    it('handles empty query params object', () => {
      const result = buildRoute('/test', {
        queryParams: {},
      });
      expect(result).toBe('/test');
    });

    it('converts numeric values to strings', () => {
      const result = buildRoute('/page/:num', {
        pathParams: { num: 42 },
      });
      expect(result).toBe('/page/42');
    });
  });

  describe('routes', () => {
    it('defines home route', () => {
      expect(routes.home.index.path).toBe('/');
    });

    it('defines professionals routes', () => {
      expect(routes.professionals.list.path).toBe('/professionals');
      expect(routes.professionals.detail.path).toBe('/professionals/:id');
    });

    it('defines photos routes', () => {
      expect(routes.photos.ideas.path).toBe(
        '/photos/kitchen-ideas-and-designs-phbr0-bp~t_709'
      );
    });

    it('defines styles routes', () => {
      expect(routes.styles.list.path).toBe('/styles');
      expect(routes.styles.detail.path).toBe('/styles/:style');
    });
  });

  describe('nav helpers', () => {
    describe('nav.home', () => {
      it('generates home URL without params', () => {
        expect(nav.home.index()).toBe('/');
      });

      it('generates home URL with photo param', () => {
        expect(nav.home.index({ photo: 123 })).toBe('/?photo=123');
      });

      it('handles undefined photo param', () => {
        expect(nav.home.index({ photo: undefined })).toBe('/');
      });
    });

    describe('nav.professionals', () => {
      it('generates professionals list URL', () => {
        expect(nav.professionals.list()).toBe('/professionals');
      });

      it('generates professional detail URL', () => {
        expect(nav.professionals.detail(5)).toBe('/professionals/5');
        expect(nav.professionals.detail(123)).toBe('/professionals/123');
      });
    });

    describe('nav.photos', () => {
      it('generates kitchen ideas URL', () => {
        expect(nav.photos.ideas()).toBe(
          '/photos/kitchen-ideas-and-designs-phbr0-bp~t_709'
        );
      });
    });

    describe('nav.styles', () => {
      it('generates styles list URL', () => {
        expect(nav.styles.list()).toBe('/styles');
      });

      it('generates style detail URL', () => {
        expect(nav.styles.detail('modern')).toBe('/styles/modern');
        expect(nav.styles.detail('farmhouse')).toBe('/styles/farmhouse');
      });
    });
  });
});

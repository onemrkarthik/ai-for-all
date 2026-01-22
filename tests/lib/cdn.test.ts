/**
 * Unit Tests for lib/cdn.ts
 *
 * Tests CDN URL wrapping functionality.
 */

import { wrapUrl } from '@/lib/cdn';

describe('CDN Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('wrapUrl', () => {
    describe('when CDN is not configured', () => {
      beforeEach(() => {
        delete process.env.NEXT_PUBLIC_CDN_URL;
      });

      it('returns original URL unchanged', () => {
        expect(wrapUrl('/images/photo.jpg')).toBe('/images/photo.jpg');
      });

      it('returns absolute URLs unchanged', () => {
        expect(wrapUrl('https://example.com/image.jpg')).toBe(
          'https://example.com/image.jpg'
        );
      });

      it('returns empty string for undefined input', () => {
        expect(wrapUrl(undefined)).toBe('');
      });

      it('returns empty string for empty string input', () => {
        expect(wrapUrl('')).toBe('');
      });
    });

    describe('when CDN is configured', () => {
      beforeEach(() => {
        process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.example.com';
      });

      it('prefixes relative URLs with CDN', () => {
        expect(wrapUrl('/images/photo.jpg')).toBe(
          'https://cdn.example.com/images/photo.jpg'
        );
      });

      it('adds leading slash to relative URLs without one', () => {
        expect(wrapUrl('images/photo.jpg')).toBe(
          'https://cdn.example.com/images/photo.jpg'
        );
      });

      it('wraps absolute HTTP URLs with CDN prefix', () => {
        expect(wrapUrl('https://example.com/image.jpg')).toBe(
          'https://cdn.example.com/https://example.com/image.jpg'
        );
      });

      it('wraps protocol-relative URLs with CDN prefix', () => {
        expect(wrapUrl('//example.com/image.jpg')).toBe(
          'https://cdn.example.com///example.com/image.jpg'
        );
      });

      it('handles CDN URL with trailing slash', () => {
        process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.example.com/';
        expect(wrapUrl('/images/photo.jpg')).toBe(
          'https://cdn.example.com/images/photo.jpg'
        );
      });

      it('returns empty string for undefined input', () => {
        expect(wrapUrl(undefined)).toBe('');
      });
    });
  });
});

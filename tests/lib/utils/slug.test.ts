/**
 * Unit Tests for lib/utils/slug.ts
 *
 * Tests slug parsing, generation, and display name formatting.
 */

import {
  parseTopicSlug,
  generateTopicSlug,
  getTopicDisplayName,
  getTopicPath,
  DEFAULT_TOPIC,
} from '@/lib/utils/slug';

describe('Slug Utilities', () => {
  describe('parseTopicSlug', () => {
    it('parses a valid slug correctly', () => {
      const result = parseTopicSlug('kitchen-ideas-and-designs-phbr0-bp~t_709');

      expect(result).toEqual({
        name: 'kitchen-ideas-and-designs',
        id: 709,
        slug: 'kitchen-ideas-and-designs-phbr0-bp~t_709',
      });
    });

    it('parses slugs with single word names', () => {
      const result = parseTopicSlug('modern-phbr0-bp~t_123');

      expect(result).toEqual({
        name: 'modern',
        id: 123,
        slug: 'modern-phbr0-bp~t_123',
      });
    });

    it('parses slugs with large IDs', () => {
      const result = parseTopicSlug('test-topic-phbr0-bp~t_999999');

      expect(result).toEqual({
        name: 'test-topic',
        id: 999999,
        slug: 'test-topic-phbr0-bp~t_999999',
      });
    });

    it('returns null for invalid slugs without the pattern', () => {
      expect(parseTopicSlug('invalid-slug')).toBeNull();
      expect(parseTopicSlug('no-id-here')).toBeNull();
      expect(parseTopicSlug('')).toBeNull();
    });

    it('returns null for slugs with wrong pattern format', () => {
      expect(parseTopicSlug('test-phbr0-bp~t_')).toBeNull(); // Missing ID
      expect(parseTopicSlug('-phbr0-bp~t_123')).toBeNull(); // Missing name (edge case)
    });
  });

  describe('generateTopicSlug', () => {
    it('generates slug from name and ID', () => {
      const result = generateTopicSlug('Kitchen Ideas', 709);
      expect(result).toBe('kitchen-ideas-phbr0-bp~t_709');
    });

    it('handles names with special characters', () => {
      const result = generateTopicSlug('Modern & Contemporary!', 100);
      expect(result).toBe('modern-contemporary-phbr0-bp~t_100');
    });

    it('handles names with multiple spaces', () => {
      const result = generateTopicSlug('Too   Many   Spaces', 50);
      expect(result).toBe('too-many-spaces-phbr0-bp~t_50');
    });

    it('trims leading/trailing special characters', () => {
      const result = generateTopicSlug('---Clean Name---', 1);
      expect(result).toBe('clean-name-phbr0-bp~t_1');
    });

    it('handles already slugified names', () => {
      const result = generateTopicSlug('already-slugified', 42);
      expect(result).toBe('already-slugified-phbr0-bp~t_42');
    });
  });

  describe('getTopicDisplayName', () => {
    it('converts slugified name to display name', () => {
      const result = getTopicDisplayName('kitchen-ideas-and-designs');
      expect(result).toBe('Kitchen Ideas And Designs');
    });

    it('handles single word names', () => {
      const result = getTopicDisplayName('modern');
      expect(result).toBe('Modern');
    });

    it('handles empty string', () => {
      const result = getTopicDisplayName('');
      expect(result).toBe('');
    });
  });

  describe('getTopicPath', () => {
    it('generates correct path from TopicInfo', () => {
      const topicInfo = {
        name: 'test-topic',
        id: 123,
        slug: 'test-topic-phbr0-bp~t_123',
      };

      expect(getTopicPath(topicInfo)).toBe('/photos/test-topic-phbr0-bp~t_123');
    });

    it('works with DEFAULT_TOPIC', () => {
      expect(getTopicPath(DEFAULT_TOPIC)).toBe(
        '/photos/kitchen-ideas-and-designs-phbr0-bp~t_709'
      );
    });
  });

  describe('DEFAULT_TOPIC', () => {
    it('has expected default values', () => {
      expect(DEFAULT_TOPIC.name).toBe('kitchen-ideas-and-designs');
      expect(DEFAULT_TOPIC.id).toBe(709);
      expect(DEFAULT_TOPIC.slug).toBe('kitchen-ideas-and-designs-phbr0-bp~t_709');
    });
  });
});

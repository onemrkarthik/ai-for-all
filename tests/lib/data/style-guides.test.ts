/**
 * Unit Tests for lib/data/style-guides.ts
 *
 * Tests the style guides data structure and content.
 */

import { STYLE_GUIDES, StyleGuide, StyleFacet } from '@/lib/data/style-guides';

describe('Style Guides', () => {
  describe('STYLE_GUIDES structure', () => {
    it('is a non-empty object', () => {
      expect(STYLE_GUIDES).toBeDefined();
      expect(typeof STYLE_GUIDES).toBe('object');
      expect(Object.keys(STYLE_GUIDES).length).toBeGreaterThan(0);
    });

    it('contains modern style guide', () => {
      expect(STYLE_GUIDES.modern).toBeDefined();
    });

    it('all guides have required properties', () => {
      Object.values(STYLE_GUIDES).forEach((guide: StyleGuide) => {
        expect(guide.name).toBeDefined();
        expect(guide.slug).toBeDefined();
        expect(guide.tagline).toBeDefined();
        expect(guide.overview).toBeDefined();
        expect(guide.facets).toBeDefined();
      });
    });
  });

  describe('StyleGuide shape', () => {
    const modern = STYLE_GUIDES.modern;

    it('has name property', () => {
      expect(modern.name).toBe('Modern');
    });

    it('has slug property', () => {
      expect(modern.slug).toBe('modern');
    });

    it('has tagline property', () => {
      expect(typeof modern.tagline).toBe('string');
      expect(modern.tagline.length).toBeGreaterThan(0);
    });

    it('has overview property', () => {
      expect(typeof modern.overview).toBe('string');
      expect(modern.overview.length).toBeGreaterThan(100); // Substantial content
    });

    it('may have heroImage property', () => {
      // heroImage is optional
      if (modern.heroImage) {
        expect(typeof modern.heroImage).toBe('string');
      }
    });
  });

  describe('StyleFacet structure', () => {
    const modern = STYLE_GUIDES.modern;
    const facetKeys = [
      'layout',
      'cabinetFinish',
      'countertop',
      'backsplash',
      'flooring',
      'appliances',
      'colorPalette',
      'lighting',
    ] as const;

    it('has all required facet keys', () => {
      facetKeys.forEach((key) => {
        expect(modern.facets[key]).toBeDefined();
      });
    });

    it('each facet has title property', () => {
      facetKeys.forEach((key) => {
        const facet: StyleFacet = modern.facets[key];
        expect(facet.title).toBeDefined();
        expect(typeof facet.title).toBe('string');
        expect(facet.title.length).toBeGreaterThan(0);
      });
    });

    it('each facet has description property', () => {
      facetKeys.forEach((key) => {
        const facet: StyleFacet = modern.facets[key];
        expect(facet.description).toBeDefined();
        expect(typeof facet.description).toBe('string');
        expect(facet.description.length).toBeGreaterThan(20);
      });
    });

    it('each facet has tips array', () => {
      facetKeys.forEach((key) => {
        const facet: StyleFacet = modern.facets[key];
        expect(facet.tips).toBeDefined();
        expect(Array.isArray(facet.tips)).toBe(true);
        expect(facet.tips.length).toBeGreaterThan(0);
      });
    });

    it('tips are non-empty strings', () => {
      facetKeys.forEach((key) => {
        const facet: StyleFacet = modern.facets[key];
        facet.tips.forEach((tip) => {
          expect(typeof tip).toBe('string');
          expect(tip.length).toBeGreaterThan(10);
        });
      });
    });
  });

  describe('All style guides validation', () => {
    const styleKeys = Object.keys(STYLE_GUIDES);

    it('has multiple style guides', () => {
      expect(styleKeys.length).toBeGreaterThanOrEqual(1);
    });

    it('slug matches the key', () => {
      Object.entries(STYLE_GUIDES).forEach(([key, guide]) => {
        expect(guide.slug).toBe(key);
      });
    });

    it('all guides have 8 facets', () => {
      Object.values(STYLE_GUIDES).forEach((guide: StyleGuide) => {
        expect(Object.keys(guide.facets)).toHaveLength(8);
      });
    });

    it('each facet has at least 3 tips', () => {
      Object.values(STYLE_GUIDES).forEach((guide: StyleGuide) => {
        Object.values(guide.facets).forEach((facet: StyleFacet) => {
          expect(facet.tips.length).toBeGreaterThanOrEqual(3);
        });
      });
    });
  });

  describe('Content quality checks', () => {
    it('overview is substantial (100+ chars)', () => {
      Object.values(STYLE_GUIDES).forEach((guide: StyleGuide) => {
        expect(guide.overview.length).toBeGreaterThan(100);
      });
    });

    it('tagline is concise (under 100 chars)', () => {
      Object.values(STYLE_GUIDES).forEach((guide: StyleGuide) => {
        expect(guide.tagline.length).toBeLessThan(100);
      });
    });

    it('names are capitalized', () => {
      Object.values(STYLE_GUIDES).forEach((guide: StyleGuide) => {
        expect(guide.name[0]).toBe(guide.name[0].toUpperCase());
      });
    });
  });
});

/**
 * Unit Tests for lib/services/photos.ts
 *
 * Tests photo service functions with mocked database.
 */

// Create mock statement objects
const mockSelectPhotos = { all: jest.fn(), get: jest.fn() };
const mockSelectAttributesByPhotoId = { all: jest.fn(), get: jest.fn() };
const mockSelectPhotoById = { all: jest.fn(), get: jest.fn() };
const mockSelectReviewsByProfessionalId = { all: jest.fn(), get: jest.fn() };
const mockGetAverageRating = { all: jest.fn(), get: jest.fn() };
const mockDynamicPrepare = { all: jest.fn(), get: jest.fn() };

// Mock the database before importing the service
jest.mock('@/lib/db', () => ({
  db: {
    prepare: jest.fn((sql: string) => {
      if (sql.includes('SELECT id, title, source, image_url')) {
        return mockSelectPhotos;
      }
      if (sql.includes('SELECT label, value FROM photo_attributes')) {
        return mockSelectAttributesByPhotoId;
      }
      if (sql.includes('FROM photos p') && sql.includes('JOIN photos_professionals')) {
        return mockSelectPhotoById;
      }
      if (sql.includes('FROM reviews') && sql.includes('ORDER BY created_at')) {
        return mockSelectReviewsByProfessionalId;
      }
      if (sql.includes('AVG(rating)')) {
        return mockGetAverageRating;
      }
      if (sql.includes('COUNT(*)')) {
        return mockDynamicPrepare;
      }
      // Dynamic queries for filtered photos
      return mockDynamicPrepare;
    }),
  },
}));

// Mock the CDN utility
jest.mock('@/lib/cdn', () => ({
  wrapUrl: jest.fn((url: string) => url ? `https://cdn.test${url}` : ''),
}));

import { wrapUrl } from '@/lib/cdn';
import {
  getPhotos,
  getPhotoById,
  getFilteredPhotos,
  getFilteredPhotosCount,
} from '@/lib/services/photos';

describe('Photo Service', () => {
  // Mock data
  const mockPhotoRows = [
    { id: 1, title: 'Modern Kitchen', source: 'Designer A', image_url: '/images/1.jpg' },
    { id: 2, title: 'Farmhouse Kitchen', source: 'Designer B', image_url: '/images/2.jpg' },
  ];

  const mockPhotoWithProfessional = {
    id: 1,
    title: 'Modern Kitchen',
    source: 'Designer A',
    image_url: '/images/1.jpg',
    description: 'A beautiful modern kitchen',
    prof_id: 10,
    prof_name: 'John Designer',
    prof_company: 'Design Co',
  };

  const mockAttributes = [
    { label: 'Style', value: 'Modern' },
    { label: 'Color', value: 'White' },
  ];

  const mockReviews = [
    { id: 1, reviewer_name: 'Alice', rating: 5, comment: 'Great work!', created_at: '2024-01-01' },
  ];

  const mockRatingStats = { avg_rating: 4.5, review_count: 10 };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mock implementations
    mockSelectPhotos.all.mockReturnValue(mockPhotoRows);
    mockSelectPhotos.get.mockReturnValue(undefined);
    mockSelectAttributesByPhotoId.all.mockReturnValue(mockAttributes);
    mockSelectPhotoById.get.mockReturnValue(mockPhotoWithProfessional);
    mockSelectReviewsByProfessionalId.all.mockReturnValue(mockReviews);
    mockGetAverageRating.get.mockReturnValue(mockRatingStats);
    mockDynamicPrepare.all.mockReturnValue(mockPhotoRows);
    mockDynamicPrepare.get.mockReturnValue({ count: 100 });
  });

  describe('getPhotos', () => {
    it('returns photos with CDN-wrapped image URLs', () => {
      const result = getPhotos({ offset: 0, limit: 10 });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Modern Kitchen',
        source: 'Designer A',
        image: 'https://cdn.test/images/1.jpg',
      });
      expect(wrapUrl).toHaveBeenCalledWith('/images/1.jpg');
    });

    it('passes correct limit and offset to query', () => {
      getPhotos({ offset: 20, limit: 10 });

      expect(mockSelectPhotos.all).toHaveBeenCalledWith(10, 20);
    });

    it('returns empty array when no photos found', () => {
      mockSelectPhotos.all.mockReturnValue([]);

      const result = getPhotos({ offset: 0, limit: 10 });

      expect(result).toEqual([]);
    });
  });

  describe('getPhotoById', () => {
    it('returns null when photo not found', () => {
      mockSelectPhotoById.get.mockReturnValue(undefined);

      const result = getPhotoById(999);

      expect(result).toBeNull();
    });

    it('returns photo with professional and attributes', () => {
      const result = getPhotoById(1);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.title).toBe('Modern Kitchen');
      expect(result?.professional?.id).toBe(10);
      expect(result?.professional?.name).toBe('John Designer');
      expect(result?.attributes).toHaveLength(2);
    });

    it('includes reviews in professional data', () => {
      const result = getPhotoById(1);

      expect(result?.professional?.reviews).toHaveLength(1);
      expect(result?.professional?.reviews?.[0].reviewerName).toBe('Alice');
    });

    it('includes rating stats', () => {
      const result = getPhotoById(1);

      expect(result?.professional?.averageRating).toBe(4.5);
      expect(result?.professional?.reviewCount).toBe(10);
    });
  });

  describe('getFilteredPhotos', () => {
    it('returns unfiltered photos when no filters provided', () => {
      const result = getFilteredPhotos({ offset: 0, limit: 10 });

      expect(result).toHaveLength(2);
    });

    it('returns unfiltered photos when filters are empty', () => {
      const result = getFilteredPhotos({ offset: 0, limit: 10, filters: {} });

      expect(result).toHaveLength(2);
    });

    it('returns unfiltered photos when all filter values are null', () => {
      const result = getFilteredPhotos({
        offset: 0,
        limit: 10,
        filters: { Style: null, Color: null },
      });

      expect(result).toHaveLength(2);
    });

    it('applies filters when provided', () => {
      mockDynamicPrepare.all.mockReturnValue([mockPhotoRows[0]]);

      const result = getFilteredPhotos({
        offset: 0,
        limit: 10,
        filters: { Style: 'Modern' },
      });

      expect(result).toHaveLength(1);
    });
  });

  describe('getFilteredPhotosCount', () => {
    it('returns total count when no filters', () => {
      const result = getFilteredPhotosCount();

      expect(result).toBe(100);
    });

    it('returns filtered count when filters provided', () => {
      mockDynamicPrepare.get.mockReturnValue({ count: 25 });

      const result = getFilteredPhotosCount({ Style: 'Modern' });

      expect(result).toBe(25);
    });

    it('returns total count when filter values are null', () => {
      const result = getFilteredPhotosCount({ Style: null });

      expect(result).toBe(100);
    });
  });
});

/**
 * Unit Tests for lib/services/professionals.ts
 *
 * Tests professional service functions with mocked database.
 */

// Create mock statement objects
const mockSelectProfessionalById = { all: jest.fn(), get: jest.fn() };
const mockSelectReviewsByProfessionalId = { all: jest.fn(), get: jest.fn() };
const mockGetAverageRating = { all: jest.fn(), get: jest.fn() };
const mockSelectPhotosByProfessionalId = { all: jest.fn(), get: jest.fn() };
const mockSelectAllProfessionals = { all: jest.fn(), get: jest.fn() };
const mockGetProjectCount = { all: jest.fn(), get: jest.fn() };

// Mock the database before importing the service
jest.mock('@/lib/db', () => ({
  db: {
    prepare: jest.fn((sql: string) => {
      if (sql.includes('SELECT id, name, company') && sql.includes('WHERE id = ?')) {
        return mockSelectProfessionalById;
      }
      if (sql.includes('FROM reviews') && sql.includes('ORDER BY created_at')) {
        return mockSelectReviewsByProfessionalId;
      }
      if (sql.includes('AVG(rating)')) {
        return mockGetAverageRating;
      }
      if (sql.includes('FROM photos p') && sql.includes('JOIN photos_professionals')) {
        return mockSelectPhotosByProfessionalId;
      }
      if (sql.includes('SELECT id, name, company') && sql.includes('ORDER BY name')) {
        return mockSelectAllProfessionals;
      }
      if (sql.includes('COUNT(*)') && sql.includes('photos_professionals')) {
        return mockGetProjectCount;
      }
      return { all: jest.fn(), get: jest.fn() };
    }),
  },
}));

import {
  getProfessionalById,
  getAllProfessionals,
} from '@/lib/services/professionals';

describe('Professional Service', () => {
  // Mock data
  const mockProfessionalRow = {
    id: 1,
    name: 'John Designer',
    company: 'Design Co',
  };

  const mockReviews = [
    { id: 1, reviewer_name: 'Alice', rating: 5, comment: 'Excellent work!', created_at: '2024-01-01' },
    { id: 2, reviewer_name: 'Bob', rating: 4, comment: 'Great designer', created_at: '2024-01-02' },
  ];

  const mockRatingStats = { avg_rating: 4.5, review_count: 10 };
  const mockProjectCount = { count: 25 };

  const mockPhotos = [
    { id: 1, title: 'Kitchen 1', image_url: '/images/1.jpg' },
    { id: 2, title: 'Kitchen 2', image_url: '/images/2.jpg' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mock implementations
    mockSelectProfessionalById.get.mockReturnValue(mockProfessionalRow);
    mockSelectReviewsByProfessionalId.all.mockReturnValue(mockReviews);
    mockGetAverageRating.get.mockReturnValue(mockRatingStats);
    mockSelectPhotosByProfessionalId.all.mockReturnValue(mockPhotos);
    mockSelectAllProfessionals.all.mockReturnValue([mockProfessionalRow]);
    mockGetProjectCount.get.mockReturnValue(mockProjectCount);
  });

  describe('getProfessionalById', () => {
    it('returns null when professional not found', () => {
      mockSelectProfessionalById.get.mockReturnValue(undefined);

      const result = getProfessionalById(999);

      expect(result).toBeNull();
    });

    it('returns professional with reviews and photos', () => {
      const result = getProfessionalById(1);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('John Designer');
      expect(result?.company).toBe('Design Co');
      expect(result?.averageRating).toBe(4.5);
      expect(result?.reviewCount).toBe(10);
      expect(result?.reviews).toHaveLength(2);
      expect(result?.photos).toHaveLength(2);
      expect(result?.totalProjects).toBe(2);
    });

    it('handles professional with no reviews', () => {
      mockSelectReviewsByProfessionalId.all.mockReturnValue([]);
      mockGetAverageRating.get.mockReturnValue({ avg_rating: null, review_count: 0 });

      const result = getProfessionalById(1);

      expect(result?.averageRating).toBeUndefined();
      expect(result?.reviewCount).toBe(0);
      expect(result?.reviews).toEqual([]);
    });

    it('rounds average rating to one decimal place', () => {
      mockGetAverageRating.get.mockReturnValue({ avg_rating: 4.333333, review_count: 3 });

      const result = getProfessionalById(1);

      expect(result?.averageRating).toBe(4.3);
    });
  });

  describe('getAllProfessionals', () => {
    it('returns empty array when no professionals', () => {
      mockSelectAllProfessionals.all.mockReturnValue([]);

      const result = getAllProfessionals();

      expect(result).toEqual([]);
    });

    it('returns list of professionals with stats', () => {
      const mockProfessionals = [
        { id: 1, name: 'John', company: 'Co A' },
        { id: 2, name: 'Jane', company: 'Co B' },
      ];
      mockSelectAllProfessionals.all.mockReturnValue(mockProfessionals);

      // Set up sequential returns for rating and project count
      mockGetAverageRating.get
        .mockReturnValueOnce({ avg_rating: 4.5, review_count: 10 })
        .mockReturnValueOnce({ avg_rating: 4.8, review_count: 20 });
      mockGetProjectCount.get
        .mockReturnValueOnce({ count: 5 })
        .mockReturnValueOnce({ count: 15 });

      const result = getAllProfessionals();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: 'John',
        company: 'Co A',
        averageRating: 4.5,
        reviewCount: 10,
        projectCount: 5,
      });
      expect(result[1]).toEqual({
        id: 2,
        name: 'Jane',
        company: 'Co B',
        averageRating: 4.8,
        reviewCount: 20,
        projectCount: 15,
      });
    });

    it('handles professionals with no ratings', () => {
      mockGetAverageRating.get.mockReturnValue({ avg_rating: null, review_count: 0 });
      mockGetProjectCount.get.mockReturnValue({ count: 0 });

      const result = getAllProfessionals();

      expect(result[0].averageRating).toBeUndefined();
      expect(result[0].reviewCount).toBe(0);
      expect(result[0].projectCount).toBe(0);
    });
  });
});

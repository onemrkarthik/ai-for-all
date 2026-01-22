/**
 * Unit Tests for lib/data.ts
 *
 * Tests data fetching utilities.
 */

// Mock the photos service
jest.mock('@/lib/services/photos', () => ({
  getPhotos: jest.fn(),
  getFilteredPhotosCount: jest.fn(),
}));

import { getPhotos, getFilteredPhotosCount } from '@/lib/services/photos';
import { fetchLiveStreamData, fetchPaginatedPhotos } from '@/lib/data';

describe('Data Utilities', () => {
  const mockPhotos = [
    { id: 1, title: 'Photo 1', source: 'Source 1', image: '/img1.jpg' },
    { id: 2, title: 'Photo 2', source: 'Source 2', image: '/img2.jpg' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getPhotos as jest.Mock).mockReturnValue(mockPhotos);
    (getFilteredPhotosCount as jest.Mock).mockReturnValue(100);
  });

  describe('fetchLiveStreamData', () => {
    it('returns photos after specified delay', async () => {
      const start = Date.now();
      const result = await fetchLiveStreamData(0, 10, 50);
      const elapsed = Date.now() - start;

      expect(result).toEqual(mockPhotos);
      expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some timing variance
      expect(getPhotos).toHaveBeenCalledWith({ offset: 0, limit: 10 });
    });

    it('passes correct offset and limit', async () => {
      await fetchLiveStreamData(20, 5, 0);

      expect(getPhotos).toHaveBeenCalledWith({ offset: 20, limit: 5 });
    });
  });

  describe('fetchPaginatedPhotos', () => {
    it('returns paginated result for first page', async () => {
      const result = await fetchPaginatedPhotos(1, 20);

      expect(result).toEqual({
        photos: mockPhotos,
        totalCount: 100,
        page: 1,
        totalPages: 5,
        itemsPerPage: 20,
      });
      expect(getPhotos).toHaveBeenCalledWith({ offset: 0, limit: 20 });
    });

    it('calculates correct offset for later pages', async () => {
      await fetchPaginatedPhotos(3, 20);

      expect(getPhotos).toHaveBeenCalledWith({ offset: 40, limit: 20 });
    });

    it('calculates correct total pages', async () => {
      (getFilteredPhotosCount as jest.Mock).mockReturnValue(55);

      const result = await fetchPaginatedPhotos(1, 20);

      expect(result.totalPages).toBe(3); // 55 / 20 = 2.75, rounded up to 3
    });

    it('uses default items per page of 100', async () => {
      await fetchPaginatedPhotos(1);

      expect(getPhotos).toHaveBeenCalledWith({ offset: 0, limit: 100 });
    });
  });
});

/**
 * Unit Tests for app/api/feed/route.ts
 *
 * Tests the feed API endpoint.
 * @jest-environment node
 */

// Mock the photos service
jest.mock('@/lib/services/photos', () => ({
  getPhotos: jest.fn(),
  getFilteredPhotos: jest.fn(),
  getFilteredPhotosCount: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/feed/route';
import { getPhotos, getFilteredPhotos, getFilteredPhotosCount } from '@/lib/services/photos';

describe('Feed API', () => {
  const mockPhotos = [
    { id: 1, title: 'Photo 1', source: 'Source 1', image: '/img1.jpg' },
    { id: 2, title: 'Photo 2', source: 'Source 2', image: '/img2.jpg' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getPhotos as jest.Mock).mockReturnValue(mockPhotos);
    (getFilteredPhotos as jest.Mock).mockReturnValue(mockPhotos);
    (getFilteredPhotosCount as jest.Mock).mockReturnValue(100);
  });

  function createRequest(url: string): NextRequest {
    return new NextRequest(new URL(url, 'http://localhost:3000'));
  }

  describe('GET /api/feed', () => {
    it('returns photos with default pagination', async () => {
      const request = createRequest('/api/feed');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.photos).toEqual(mockPhotos);
      expect(data.offset).toBe(0);
      expect(data.limit).toBe(20);
      expect(getPhotos).toHaveBeenCalledWith({ offset: 0, limit: 20 });
    });

    it('respects offset and limit parameters', async () => {
      const request = createRequest('/api/feed?offset=40&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(data.offset).toBe(40);
      expect(data.limit).toBe(10);
      expect(getPhotos).toHaveBeenCalledWith({ offset: 40, limit: 10 });
    });

    it('applies filters when provided', async () => {
      const filters = { Style: 'Modern', Color: 'White' };
      const filtersParam = encodeURIComponent(JSON.stringify(filters));
      const request = createRequest(`/api/feed?filters=${filtersParam}`);

      await GET(request);

      expect(getFilteredPhotos).toHaveBeenCalledWith({
        offset: 0,
        limit: 20,
        filters,
      });
    });

    it('includes total count when filters are applied', async () => {
      const filters = { Style: 'Modern' };
      const filtersParam = encodeURIComponent(JSON.stringify(filters));
      const request = createRequest(`/api/feed?filters=${filtersParam}`);

      const response = await GET(request);
      const data = await response.json();

      expect(data.totalCount).toBe(100);
      expect(getFilteredPhotosCount).toHaveBeenCalledWith(filters);
    });

    it('ignores invalid JSON in filters parameter', async () => {
      const request = createRequest('/api/feed?filters=invalid-json');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getPhotos).toHaveBeenCalled();
      expect(data.totalCount).toBeUndefined();
    });

    it('uses getPhotos when no filters', async () => {
      const request = createRequest('/api/feed');

      await GET(request);

      expect(getPhotos).toHaveBeenCalled();
      expect(getFilteredPhotos).not.toHaveBeenCalled();
    });
  });
});

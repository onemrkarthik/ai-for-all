/**
 * Unit Tests for app/api/photos/[id]/route.ts
 *
 * Tests the photo detail API endpoint.
 * @jest-environment node
 */

// Mock the photos service
jest.mock('@/lib/services/photos', () => ({
  getPhotoById: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/photos/[id]/route';
import { getPhotoById } from '@/lib/services/photos';

describe('Photos API', () => {
  const mockPhoto = {
    id: 1,
    title: 'Modern Kitchen',
    source: 'Designer A',
    image: '/images/1.jpg',
    description: 'A beautiful modern kitchen',
    professional: {
      id: 10,
      name: 'John Designer',
      company: 'Design Co',
      averageRating: 4.5,
      reviewCount: 10,
      reviews: [],
    },
    attributes: [
      { label: 'Style', value: 'Modern' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createRequest(): NextRequest {
    return new NextRequest(new URL('http://localhost:3000/api/photos/1'));
  }

  describe('GET /api/photos/:id', () => {
    it('returns photo when found', async () => {
      (getPhotoById as jest.Mock).mockReturnValue(mockPhoto);

      const request = createRequest();
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPhoto);
      expect(getPhotoById).toHaveBeenCalledWith(1);
    });

    it('returns 404 when photo not found', async () => {
      (getPhotoById as jest.Mock).mockReturnValue(null);

      const request = createRequest();
      const response = await GET(request, { params: Promise.resolve({ id: '999' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Photo not found');
    });

    it('returns 400 for invalid ID', async () => {
      const request = createRequest();
      const response = await GET(request, { params: Promise.resolve({ id: 'abc' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid ID');
      expect(getPhotoById).not.toHaveBeenCalled();
    });

    it('parses numeric string ID correctly', async () => {
      (getPhotoById as jest.Mock).mockReturnValue(mockPhoto);

      const request = createRequest();
      await GET(request, { params: Promise.resolve({ id: '123' }) });

      expect(getPhotoById).toHaveBeenCalledWith(123);
    });
  });
});

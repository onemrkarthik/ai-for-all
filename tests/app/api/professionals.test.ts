/**
 * Unit Tests for app/api/professionals/[id]/route.ts
 *
 * Tests the professional detail API endpoint.
 * @jest-environment node
 */

// Mock the professionals service
jest.mock('@/lib/services/professionals', () => ({
  getProfessionalById: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/professionals/[id]/route';
import { getProfessionalById } from '@/lib/services/professionals';

describe('Professionals API', () => {
  const mockProfessional = {
    id: 1,
    name: 'John Designer',
    company: 'Design Co',
    averageRating: 4.5,
    reviewCount: 10,
    reviews: [
      { id: 1, reviewerName: 'Alice', rating: 5, comment: 'Great!', createdAt: '2024-01-01' },
    ],
    photos: [
      { id: 1, title: 'Kitchen 1', image: '/img1.jpg' },
    ],
    totalProjects: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for error handling tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createRequest(): NextRequest {
    return new NextRequest(new URL('http://localhost:3000/api/professionals/1'));
  }

  describe('GET /api/professionals/:id', () => {
    it('returns professional when found', async () => {
      (getProfessionalById as jest.Mock).mockReturnValue(mockProfessional);

      const request = createRequest();
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProfessional);
      expect(getProfessionalById).toHaveBeenCalledWith(1);
    });

    it('returns 404 when professional not found', async () => {
      (getProfessionalById as jest.Mock).mockReturnValue(null);

      const request = createRequest();
      const response = await GET(request, { params: Promise.resolve({ id: '999' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Professional not found');
    });

    it('returns 400 for invalid ID', async () => {
      const request = createRequest();
      const response = await GET(request, { params: Promise.resolve({ id: 'abc' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid professional ID');
      expect(getProfessionalById).not.toHaveBeenCalled();
    });

    it('returns 500 on service error', async () => {
      (getProfessionalById as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const request = createRequest();
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch professional');
    });

    it('parses numeric string ID correctly', async () => {
      (getProfessionalById as jest.Mock).mockReturnValue(mockProfessional);

      const request = createRequest();
      await GET(request, { params: Promise.resolve({ id: '123' }) });

      expect(getProfessionalById).toHaveBeenCalledWith(123);
    });
  });
});

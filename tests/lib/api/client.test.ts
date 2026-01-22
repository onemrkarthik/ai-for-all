/**
 * Unit Tests for lib/api/client.ts
 *
 * Tests the API client wrapper functions and error handling.
 */

import { api, ApiError } from '@/lib/api/client';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ApiError', () => {
    it('creates error with correct message', () => {
      const error = new ApiError(404, 'Not Found', { error: 'Resource not found' });

      expect(error.message).toBe('API Error 404: Not Found');
      expect(error.name).toBe('ApiError');
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
      expect(error.body).toEqual({ error: 'Resource not found' });
    });

    it('is() returns true for matching status', () => {
      const error = new ApiError(404, 'Not Found', {});

      expect(error.is(404)).toBe(true);
      expect(error.is(500)).toBe(false);
    });

    it('isClientError() returns true for 4xx', () => {
      const error400 = new ApiError(400, 'Bad Request', {});
      const error404 = new ApiError(404, 'Not Found', {});
      const error500 = new ApiError(500, 'Server Error', {});

      expect(error400.isClientError()).toBe(true);
      expect(error404.isClientError()).toBe(true);
      expect(error500.isClientError()).toBe(false);
    });

    it('isServerError() returns true for 5xx', () => {
      const error500 = new ApiError(500, 'Server Error', {});
      const error503 = new ApiError(503, 'Service Unavailable', {});
      const error404 = new ApiError(404, 'Not Found', {});

      expect(error500.isServerError()).toBe(true);
      expect(error503.isServerError()).toBe(true);
      expect(error404.isServerError()).toBe(false);
    });
  });

  describe('api.feed.list', () => {
    it('fetches photos with default parameters', async () => {
      const mockResponse = {
        photos: [{ id: 1, title: 'Kitchen', image: '/test.jpg', source: 'Test' }],
        totalCount: 1,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.feed.list();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/feed'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('fetches photos with pagination parameters', async () => {
      const mockResponse = { photos: [], totalCount: 0 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await api.feed.list({ offset: 20, limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=20'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
    });

    it('fetches photos with filters', async () => {
      const mockResponse = { photos: [], totalCount: 0 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await api.feed.list({ filters: { Style: 'Modern' } });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('filters='),
        expect.any(Object)
      );
    });
  });

  describe('api.photos.get', () => {
    it('fetches photo by ID', async () => {
      const mockPhoto = { id: 123, title: 'Test Photo' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPhoto),
      });

      const result = await api.photos.get(123);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/photos/123'),
        expect.any(Object)
      );
      expect(result).toEqual(mockPhoto);
    });

    it('throws ApiError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Photo not found' }),
      });

      await expect(api.photos.get(999)).rejects.toThrow(ApiError);
    });
  });

  describe('api.professionals.get', () => {
    it('fetches professional by ID', async () => {
      const mockProfessional = { id: 5, name: 'John Designer' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfessional),
      });

      const result = await api.professionals.get(5);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/professionals/5'),
        expect.any(Object)
      );
      expect(result).toEqual(mockProfessional);
    });
  });

  describe('api.contact.latest', () => {
    it('fetches latest conversation by professional ID', async () => {
      const mockConversation = { conversation: { id: 1, messages: [] } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConversation),
      });

      const result = await api.contact.latest(10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('professionalId=10'),
        expect.any(Object)
      );
      expect(result).toEqual(mockConversation);
    });
  });

  describe('api.contact.conversation', () => {
    it('fetches conversation by ID', async () => {
      const mockConversation = { conversation: { id: 1, messages: [] } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConversation),
      });

      const result = await api.contact.conversation(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact/conversation/1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockConversation);
    });
  });

  describe('api.contact.byProfessional', () => {
    it('fetches conversation by professional ID', async () => {
      const mockConversation = { conversation: { id: 1, messages: [] } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConversation),
      });

      const result = await api.contact.byProfessional(10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('professionalId=10'),
        expect.any(Object)
      );
      expect(result).toEqual(mockConversation);
    });
  });

  describe('api.contact.init', () => {
    it('initializes conversation with POST request', async () => {
      const mockResponse = { id: 1, messages: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const body = { professionalId: 10, message: 'Hello!' };
      const result = await api.contact.init(body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact/init'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('api.contact.chat', () => {
    it('sends chat message with POST request', async () => {
      const mockResponse = { message: { content: 'Response' }, suggestions: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const body = { conversationId: 1, message: 'Hello!' };
      const result = await api.contact.chat(body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact/chat'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('api.contact.markViewed', () => {
    it('marks conversation as viewed with POST request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const body = { conversationId: 1 };
      const result = await api.contact.markViewed(body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact/mark-viewed'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('Error handling', () => {
    it('throws ApiError with parsed JSON body on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid input' }),
      });

      try {
        await api.photos.get(1);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(400);
        expect((error as ApiError).body).toEqual({ error: 'Invalid input' });
      }
    });

    it('handles non-JSON error response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Not JSON')),
      });

      try {
        await api.photos.get(1);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).body).toEqual({ error: 'Internal Server Error' });
      }
    });
  });
});

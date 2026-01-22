/**
 * Unit Tests for app/api/contact/conversation/[id]/route.ts
 *
 * Tests the GET endpoint for fetching a specific conversation by ID.
 */

import { NextRequest } from 'next/server';

// Mock the chat service
jest.mock('@/lib/services/chat', () => ({
  getConversation: jest.fn(),
}));

import { getConversation } from '@/lib/services/chat';
import { GET } from '@/app/api/contact/conversation/[id]/route';

const mockGetConversation = getConversation as jest.Mock;

describe('GET /api/contact/conversation/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when id is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact/conversation/abc');
    const params = Promise.resolve({ id: 'abc' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid conversation ID');
  });

  it('returns 404 when conversation not found', async () => {
    mockGetConversation.mockReturnValue(null);

    const request = new NextRequest('http://localhost:3000/api/contact/conversation/999');
    const params = Promise.resolve({ id: '999' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Conversation not found');
    expect(mockGetConversation).toHaveBeenCalledWith(999);
  });

  it('returns conversation when found', async () => {
    const mockConversation = {
      id: 1,
      professional_id: 10,
      last_summary: 'Kitchen project',
      messages: [
        { id: 1, role: 'user', content: 'Hello', created_at: '2024-01-01T10:00:00Z' },
      ],
    };
    mockGetConversation.mockReturnValue(mockConversation);

    const request = new NextRequest('http://localhost:3000/api/contact/conversation/1');
    const params = Promise.resolve({ id: '1' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversation.id).toBe(1);
    expect(data.conversation.professional_id).toBe(10);
  });

  it('returns 500 on internal error', async () => {
    mockGetConversation.mockImplementation(() => {
      throw new Error('Database error');
    });

    const request = new NextRequest('http://localhost:3000/api/contact/conversation/1');
    const params = Promise.resolve({ id: '1' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch conversation');
  });
});

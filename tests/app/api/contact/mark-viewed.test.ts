/**
 * Unit Tests for app/api/contact/mark-viewed/route.ts
 *
 * Tests the POST endpoint for marking a conversation as viewed.
 */

import { NextRequest } from 'next/server';

// Mock the chat service
jest.mock('@/lib/services/chat', () => ({
  markConversationAsViewed: jest.fn(),
}));

import { markConversationAsViewed } from '@/lib/services/chat';
import { POST } from '@/app/api/contact/mark-viewed/route';

const mockMarkViewed = markConversationAsViewed as jest.Mock;

describe('POST /api/contact/mark-viewed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when conversationId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact/mark-viewed', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Conversation ID is required');
  });

  it('marks conversation as viewed successfully', async () => {
    mockMarkViewed.mockReturnValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/contact/mark-viewed', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockMarkViewed).toHaveBeenCalledWith(1);
  });

  it('returns 500 on internal error', async () => {
    mockMarkViewed.mockImplementation(() => {
      throw new Error('Database error');
    });

    const request = new NextRequest('http://localhost:3000/api/contact/mark-viewed', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to mark conversation as viewed');
  });
});

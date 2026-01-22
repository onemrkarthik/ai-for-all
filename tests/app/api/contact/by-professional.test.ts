/**
 * Unit Tests for app/api/contact/by-professional/route.ts
 *
 * Tests the GET endpoint for fetching conversation by professional ID.
 */

import { NextRequest } from 'next/server';

// Mock the chat service
jest.mock('@/lib/services/chat', () => ({
  getLatestConversationByProfessionalId: jest.fn(),
}));

import { getLatestConversationByProfessionalId } from '@/lib/services/chat';
import { GET } from '@/app/api/contact/by-professional/route';

const mockGetLatestConversation = getLatestConversationByProfessionalId as jest.Mock;

describe('GET /api/contact/by-professional', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when professionalId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact/by-professional');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Professional ID is required');
  });

  it('returns null conversation when none exists', async () => {
    mockGetLatestConversation.mockReturnValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/contact/by-professional?professionalId=10'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversation).toBeNull();
    expect(mockGetLatestConversation).toHaveBeenCalledWith(10);
  });

  it('returns conversation with messages', async () => {
    const mockConversation = {
      id: 1,
      professional_id: 10,
      last_summary: 'Kitchen project',
      last_viewed_at: '2024-01-15T10:00:00Z',
      has_new_messages: true,
      messages: [
        { id: 1, role: 'user', content: 'Hello', created_at: '2024-01-01T10:00:00Z' },
        { id: 2, role: 'assistant', content: 'Hi!', created_at: '2024-01-01T10:01:00Z' },
      ],
    };
    mockGetLatestConversation.mockReturnValue(mockConversation);

    const request = new NextRequest(
      'http://localhost:3000/api/contact/by-professional?professionalId=10'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversation.id).toBe(1);
    expect(data.conversation.professional_id).toBe(10);
    expect(data.conversation.has_new_messages).toBe(true);
    expect(data.conversation.messages).toHaveLength(2);
  });

  it('returns 500 on internal error', async () => {
    mockGetLatestConversation.mockImplementation(() => {
      throw new Error('Database error');
    });

    const request = new NextRequest(
      'http://localhost:3000/api/contact/by-professional?professionalId=10'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch conversation');
  });
});

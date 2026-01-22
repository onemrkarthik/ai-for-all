/**
 * Unit Tests for app/api/contact/latest/route.ts
 *
 * Tests the GET endpoint for fetching the latest conversation by professional ID.
 */

// Mock the chat service
jest.mock('@/lib/services/chat', () => ({
  getLatestConversationByProfessionalId: jest.fn(),
}));

import { getLatestConversationByProfessionalId } from '@/lib/services/chat';
import { GET } from '@/app/api/contact/latest/route';

const mockGetLatestConversation = getLatestConversationByProfessionalId as jest.Mock;

describe('GET /api/contact/latest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when professionalId is missing', async () => {
    const request = new Request('http://localhost:3000/api/contact/latest');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing professionalId');
  });

  it('returns null conversation when none exists', async () => {
    mockGetLatestConversation.mockReturnValue(null);

    const request = new Request(
      'http://localhost:3000/api/contact/latest?professionalId=10'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversation).toBeNull();
    expect(mockGetLatestConversation).toHaveBeenCalledWith(10);
  });

  it('returns conversation when found', async () => {
    const mockConversation = {
      id: 1,
      professional_id: 10,
      messages: [
        { id: 1, role: 'user', content: 'Hello', created_at: '2024-01-01T10:00:00Z' },
      ],
    };
    mockGetLatestConversation.mockReturnValue(mockConversation);

    const request = new Request(
      'http://localhost:3000/api/contact/latest?professionalId=10'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversation.id).toBe(1);
  });

  it('returns 500 on internal error', async () => {
    mockGetLatestConversation.mockImplementation(() => {
      throw new Error('Database error');
    });

    const request = new Request(
      'http://localhost:3000/api/contact/latest?professionalId=10'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
  });
});

/**
 * Unit Tests for app/api/contact/chat/route.ts
 *
 * Tests the POST endpoint for adding messages to an existing conversation.
 */

// Mock the dependencies
jest.mock('@/lib/services/chat', () => ({
  addMessage: jest.fn(),
  getConversation: jest.fn(),
  updateConversationSummary: jest.fn(),
}));

jest.mock('@/lib/services/professionals', () => ({
  getProfessionalById: jest.fn(),
}));

jest.mock('@/lib/ai', () => ({
  generateAIResponse: jest.fn(),
}));

import { addMessage, getConversation, updateConversationSummary } from '@/lib/services/chat';
import { getProfessionalById } from '@/lib/services/professionals';
import { generateAIResponse } from '@/lib/ai';
import { POST } from '@/app/api/contact/chat/route';

const mockAddMessage = addMessage as jest.Mock;
const mockGetConversation = getConversation as jest.Mock;
const mockUpdateSummary = updateConversationSummary as jest.Mock;
const mockGetProfessional = getProfessionalById as jest.Mock;
const mockGenerateAI = generateAIResponse as jest.Mock;

describe('POST /api/contact/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when conversationId is missing', async () => {
    const request = new Request('http://localhost:3000/api/contact/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  it('returns 400 when message is missing', async () => {
    const request = new Request('http://localhost:3000/api/contact/chat', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  it('returns 404 when conversation not found', async () => {
    mockGetConversation.mockReturnValue(null);

    const request = new Request('http://localhost:3000/api/contact/chat', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 999, message: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Conversation not found');
  });

  it('returns 404 when professional not found', async () => {
    mockGetConversation.mockReturnValue({
      id: 1,
      professional_id: 999,
      messages: [],
    });
    mockGetProfessional.mockReturnValue(null);

    const request = new Request('http://localhost:3000/api/contact/chat', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 1, message: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Professional not found');
  });

  it('adds message and returns AI response', async () => {
    const mockConversation = {
      id: 1,
      professional_id: 10,
      messages: [
        { id: 1, role: 'user', content: 'Hello', created_at: '2024-01-01T10:00:00Z' },
      ],
    };
    const mockProfessional = { id: 10, name: 'John Designer' };
    const mockAIResponse = {
      response: 'Great question!',
      suggestions: ['More info?'],
      isSufficient: false,
      projectSummary: 'Kitchen project details',
    };

    mockGetConversation
      .mockReturnValueOnce(mockConversation) // First call - initial check
      .mockReturnValueOnce({
        ...mockConversation,
        messages: [
          ...mockConversation.messages,
          { id: 2, role: 'user', content: 'New message', created_at: '2024-01-01T10:01:00Z' },
        ],
      }); // Second call - after adding user message

    mockGetProfessional.mockReturnValue(mockProfessional);
    mockAddMessage
      .mockReturnValueOnce(undefined) // User message
      .mockReturnValueOnce({ id: 3, role: 'assistant', content: 'Great question!', created_at: '2024-01-01T10:01:01Z' }); // AI message
    mockGenerateAI.mockResolvedValue(mockAIResponse);
    mockUpdateSummary.mockReturnValue(undefined);

    const request = new Request('http://localhost:3000/api/contact/chat', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 1, message: 'New message' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message.content).toBe('Great question!');
    expect(data.suggestions).toEqual(['More info?']);
    expect(data.isSufficient).toBe(false);
    expect(mockAddMessage).toHaveBeenCalledWith(1, 'New message', 'user');
    expect(mockUpdateSummary).toHaveBeenCalledWith(1, 'Kitchen project details');
  });

  it('does not update summary when AI does not provide one', async () => {
    const mockConversation = {
      id: 1,
      professional_id: 10,
      messages: [],
    };
    const mockProfessional = { id: 10, name: 'John Designer' };
    const mockAIResponse = {
      response: 'Hi!',
      suggestions: [],
      isSufficient: false,
      projectSummary: null,
    };

    mockGetConversation
      .mockReturnValueOnce(mockConversation)
      .mockReturnValueOnce(mockConversation);
    mockGetProfessional.mockReturnValue(mockProfessional);
    mockAddMessage.mockReturnValue({ id: 2, role: 'assistant', content: 'Hi!', created_at: '2024-01-01T10:00:00Z' });
    mockGenerateAI.mockResolvedValue(mockAIResponse);

    const request = new Request('http://localhost:3000/api/contact/chat', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 1, message: 'Hello' }),
    });

    await POST(request);

    expect(mockUpdateSummary).not.toHaveBeenCalled();
  });

  it('returns 500 on internal error', async () => {
    mockGetConversation.mockImplementation(() => {
      throw new Error('Database error');
    });

    const request = new Request('http://localhost:3000/api/contact/chat', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 1, message: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
  });
});

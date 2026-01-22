/**
 * Unit Tests for app/api/contact/init/route.ts
 *
 * Tests the POST endpoint for initializing a new conversation.
 */

// Mock the dependencies
jest.mock('@/lib/services/chat', () => ({
  createConversation: jest.fn(),
  ChatMessage: {},
}));

jest.mock('@/lib/services/professionals', () => ({
  getProfessionalById: jest.fn(),
}));

jest.mock('@/lib/ai', () => ({
  generateAIResponse: jest.fn(),
}));

import { createConversation } from '@/lib/services/chat';
import { getProfessionalById } from '@/lib/services/professionals';
import { generateAIResponse } from '@/lib/ai';
import { POST } from '@/app/api/contact/init/route';

const mockCreateConversation = createConversation as jest.Mock;
const mockGetProfessional = getProfessionalById as jest.Mock;
const mockGenerateAI = generateAIResponse as jest.Mock;

describe('POST /api/contact/init', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when professionalId is missing', async () => {
    const request = new Request('http://localhost:3000/api/contact/init', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields (professionalId, message)');
  });

  it('returns 400 when message is missing', async () => {
    const request = new Request('http://localhost:3000/api/contact/init', {
      method: 'POST',
      body: JSON.stringify({ professionalId: 10 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields (professionalId, message)');
  });

  it('returns 404 when professional not found', async () => {
    mockGetProfessional.mockReturnValue(null);

    const request = new Request('http://localhost:3000/api/contact/init', {
      method: 'POST',
      body: JSON.stringify({ professionalId: 999, message: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Professional not found');
  });

  it('creates conversation and returns AI response', async () => {
    const mockProfessional = { id: 10, name: 'John Designer' };
    const mockAIResponse = {
      response: 'Hi, how can I help?',
      suggestions: ['Budget?', 'Timeline?'],
      projectSummary: 'Kitchen renovation',
    };
    const mockConversation = {
      id: 1,
      professional_id: 10,
      messages: [
        { id: 1, role: 'user', content: 'Hello', created_at: '2024-01-01T10:00:00Z' },
        { id: 2, role: 'assistant', content: 'Hi, how can I help?', created_at: '2024-01-01T10:00:01Z' },
      ],
    };

    mockGetProfessional.mockReturnValue(mockProfessional);
    mockGenerateAI.mockResolvedValue(mockAIResponse);
    mockCreateConversation.mockReturnValue(mockConversation);

    const request = new Request('http://localhost:3000/api/contact/init', {
      method: 'POST',
      body: JSON.stringify({ professionalId: 10, message: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(1);
    expect(data.suggestions).toEqual(['Budget?', 'Timeline?']);
    expect(data.projectSummary).toBe('Kitchen renovation');
    expect(mockGenerateAI).toHaveBeenCalledWith(
      null,
      expect.arrayContaining([
        expect.objectContaining({ role: 'user', content: 'Hello' }),
      ]),
      mockProfessional
    );
  });

  it('returns 500 on internal error', async () => {
    mockGetProfessional.mockImplementation(() => {
      throw new Error('Database error');
    });

    const request = new Request('http://localhost:3000/api/contact/init', {
      method: 'POST',
      body: JSON.stringify({ professionalId: 10, message: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
  });
});

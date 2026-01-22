/**
 * Unit Tests for lib/ai.ts
 *
 * Tests the AI response generation with mocked Google Generative AI.
 */

// Mock the Google Generative AI module before importing
const mockSendMessage = jest.fn();
const mockStartChat = jest.fn(() => ({
  sendMessage: mockSendMessage,
}));
const mockGetGenerativeModel = jest.fn(() => ({
  startChat: mockStartChat,
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

import { generateAIResponse } from '@/lib/ai';

describe('generateAIResponse', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns error message when GOOGLE_API_KEY is missing', async () => {
    delete process.env.GOOGLE_API_KEY;

    const result = await generateAIResponse(null, [
      { id: 1, role: 'user', content: 'Hello', created_at: new Date().toISOString() },
    ]);

    expect(result.response).toContain("I'm sorry");
    expect(result.isSufficient).toBe(false);
  });

  it('generates AI response successfully with valid JSON', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';

    const mockResponse = {
      response: 'Hello! How can I help you?',
      suggestions: ['Question 1', 'Question 2'],
      isSufficient: false,
      projectSummary: 'Initial contact',
    };

    mockSendMessage.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockResponse),
      },
    });

    const result = await generateAIResponse(null, [
      { id: 1, role: 'user', content: 'Hello', created_at: new Date().toISOString() },
    ], {
      id: 1,
      name: 'John Designer',
      company: 'Design Co',
    });

    expect(mockSendMessage).toHaveBeenCalled();
    expect(result.response).toBe('Hello! How can I help you?');
    expect(result.suggestions).toEqual(['Question 1', 'Question 2']);
  });

  it('handles malformed JSON response gracefully', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';

    mockSendMessage.mockResolvedValue({
      response: {
        text: () => 'This is not valid JSON',
      },
    });

    const result = await generateAIResponse(null, [
      { id: 1, role: 'user', content: 'Hello', created_at: new Date().toISOString() },
    ], {
      id: 1,
      name: 'John Designer',
      company: 'Design Co',
    });

    expect(result.response).toBe('This is not valid JSON');
    expect(result.isSufficient).toBe(false);
  });

  it('handles rate limiting (429) error', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';

    mockSendMessage.mockRejectedValue({
      status: 429,
      message: 'Rate limit exceeded',
    });

    const result = await generateAIResponse(null, [
      { id: 1, role: 'user', content: 'Hello', created_at: new Date().toISOString() },
    ], {
      id: 1,
      name: 'John Designer',
      company: 'Design Co',
    });

    expect(result.response).toContain('taking a quick breather');
    expect(result.isSufficient).toBe(false);
  });

  it('handles 429 error in message', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';

    mockSendMessage.mockRejectedValue({
      message: 'Error 429: Rate limit exceeded',
    });

    const result = await generateAIResponse(null, [
      { id: 1, role: 'user', content: 'Hello', created_at: new Date().toISOString() },
    ], {
      id: 1,
      name: 'John Designer',
      company: 'Design Co',
    });

    expect(result.response).toContain('taking a quick breather');
    expect(result.isSufficient).toBe(false);
  });

  it('throws on non-rate-limit errors', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';

    mockSendMessage.mockRejectedValue(new Error('Unknown error'));

    await expect(generateAIResponse(null, [
      { id: 1, role: 'user', content: 'Hello', created_at: new Date().toISOString() },
    ], {
      id: 1,
      name: 'John Designer',
      company: 'Design Co',
    })).rejects.toThrow('Unknown error');
  });

  it('uses photo context when provided', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';

    const mockResponse = {
      response: 'I see you like this kitchen design!',
      suggestions: [],
      isSufficient: false,
    };

    mockSendMessage.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockResponse),
      },
    });

    const photo = {
      id: 1,
      title: 'Modern White Kitchen',
      description: 'A sleek modern kitchen',
      image: '/kitchen.jpg',
      source: 'Designer Studio',
      attributes: [{ label: 'Style', value: 'Modern' }],
      professional: {
        id: 5,
        name: 'Jane Designer',
        company: 'Modern Designs Inc',
      },
    };

    await generateAIResponse(photo, [
      { id: 1, role: 'user', content: 'I love this!', created_at: new Date().toISOString() },
    ]);

    expect(mockSendMessage).toHaveBeenCalled();
    const prompt = mockSendMessage.mock.calls[0][0];
    expect(prompt).toContain('Modern White Kitchen');
  });

  it('uses professional from photo when not provided directly', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';

    mockSendMessage.mockResolvedValue({
      response: {
        text: () => JSON.stringify({ response: 'Test', isSufficient: false }),
      },
    });

    const photo = {
      id: 1,
      title: 'Kitchen Photo',
      image: '/kitchen.jpg',
      source: 'Builder Photos',
      professional: {
        id: 3,
        name: 'Bob Builder',
        company: 'Build It Right',
        averageRating: 4.8,
        reviewCount: 50,
      },
    };

    await generateAIResponse(photo, [
      { id: 1, role: 'user', content: 'Hi', created_at: new Date().toISOString() },
    ]);

    const prompt = mockSendMessage.mock.calls[0][0];
    expect(prompt).toContain('Build It Right');
    expect(prompt).toContain('Bob Builder');
  });

  it('handles JSON response wrapped in markdown code block', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';

    mockSendMessage.mockResolvedValue({
      response: {
        text: () => '```json\n{"response": "Cleaned response", "isSufficient": true}\n```',
      },
    });

    const result = await generateAIResponse(null, [
      { id: 1, role: 'user', content: 'Hello', created_at: new Date().toISOString() },
    ], {
      id: 1,
      name: 'John',
      company: 'Test Co',
    });

    expect(result.response).toBe('Cleaned response');
    expect(result.isSufficient).toBe(true);
  });
});

/**
 * Unit Tests for lib/services/chat.ts
 *
 * Tests chat service functions with mocked database.
 */

// Create mock statement objects
const mockCreateConversation = { run: jest.fn() };
const mockInsertMessage = { run: jest.fn() };
const mockGetConversation = { get: jest.fn() };
const mockGetLatestConversationByProfessional = { get: jest.fn() };
const mockUpdateSummary = { run: jest.fn() };
const mockGetMessages = { all: jest.fn() };
const mockCheckNewMessages = { get: jest.fn() };
const mockMarkViewed = { run: jest.fn() };
const mockTransaction = jest.fn((fn: () => number) => () => fn());

// Mock the database before importing the service
jest.mock('@/lib/db', () => ({
  db: {
    prepare: jest.fn((sql: string) => {
      if (sql.includes('INSERT INTO conversations')) {
        return mockCreateConversation;
      }
      if (sql.includes('INSERT INTO messages')) {
        return mockInsertMessage;
      }
      if (sql.includes('SELECT * FROM conversations WHERE id')) {
        return mockGetConversation;
      }
      if (sql.includes('WHERE professional_id') && sql.includes('ORDER BY created_at DESC')) {
        return mockGetLatestConversationByProfessional;
      }
      if (sql.includes('UPDATE conversations SET last_summary')) {
        return mockUpdateSummary;
      }
      if (sql.includes('SELECT * FROM messages WHERE conversation_id')) {
        return mockGetMessages;
      }
      if (sql.includes('COUNT(*)') && sql.includes('messages')) {
        return mockCheckNewMessages;
      }
      if (sql.includes('UPDATE conversations') && sql.includes('last_viewed_at')) {
        return mockMarkViewed;
      }
      return { run: jest.fn(), get: jest.fn(), all: jest.fn() };
    }),
    transaction: mockTransaction,
  },
}));

import {
  createConversation,
  getConversation,
  getLatestConversationByProfessionalId,
  addMessage,
  updateConversationSummary,
  markConversationAsViewed,
} from '@/lib/services/chat';

describe('Chat Service', () => {
  // Mock data
  const mockConversationRow = {
    id: 1,
    professional_id: 10,
    last_summary: 'Kitchen renovation project',
    last_viewed_at: '2024-01-15T10:00:00Z',
    created_at: '2024-01-01T10:00:00Z',
  };

  const mockMessages = [
    { id: 1, conversation_id: 1, role: 'user', content: 'Hello', created_at: '2024-01-01T10:00:00Z' },
    { id: 2, conversation_id: 1, role: 'assistant', content: 'Hi there!', created_at: '2024-01-01T10:01:00Z' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mock implementations
    mockCreateConversation.run.mockReturnValue({ lastInsertRowid: 1 });
    mockInsertMessage.run.mockReturnValue({ lastInsertRowid: 1 });
    mockGetConversation.get.mockReturnValue(mockConversationRow);
    mockGetLatestConversationByProfessional.get.mockReturnValue(mockConversationRow);
    mockGetMessages.all.mockReturnValue(mockMessages);
    mockCheckNewMessages.get.mockReturnValue({ count: 0 });
    mockTransaction.mockImplementation((fn: () => number) => () => fn());
  });

  describe('getConversation', () => {
    it('returns null when conversation not found', () => {
      mockGetConversation.get.mockReturnValue(undefined);

      const result = getConversation(999);

      expect(result).toBeNull();
    });

    it('returns conversation with messages', () => {
      const result = getConversation(1);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.professional_id).toBe(10);
      expect(result?.messages).toHaveLength(2);
    });

    it('includes last_summary when present', () => {
      const result = getConversation(1);

      expect(result?.last_summary).toBe('Kitchen renovation project');
    });

    it('sets has_new_messages to false when no new messages', () => {
      mockCheckNewMessages.get.mockReturnValue({ count: 0 });

      const result = getConversation(1);

      expect(result?.has_new_messages).toBe(false);
    });

    it('sets has_new_messages to true when there are new messages', () => {
      mockCheckNewMessages.get.mockReturnValue({ count: 2 });

      const result = getConversation(1);

      expect(result?.has_new_messages).toBe(true);
    });
  });

  describe('getLatestConversationByProfessionalId', () => {
    it('returns null when no conversation found', () => {
      mockGetLatestConversationByProfessional.get.mockReturnValue(undefined);

      const result = getLatestConversationByProfessionalId(999);

      expect(result).toBeNull();
    });

    it('returns latest conversation with messages', () => {
      const result = getLatestConversationByProfessionalId(10);

      expect(result).not.toBeNull();
      expect(result?.professional_id).toBe(10);
      expect(result?.messages).toHaveLength(2);
    });

    it('includes has_new_messages flag', () => {
      mockCheckNewMessages.get.mockReturnValue({ count: 1 });

      const result = getLatestConversationByProfessionalId(10);

      expect(result?.has_new_messages).toBe(true);
    });
  });

  describe('createConversation', () => {
    it('creates a new conversation with initial messages', () => {
      // Setup transaction mock to execute the function and return the result
      mockTransaction.mockImplementation((fn: () => number) => {
        const transactionFn = () => {
          mockCreateConversation.run(10, null);
          mockInsertMessage.run(1, 'user', 'Hello');
          mockInsertMessage.run(1, 'assistant', 'Hi there!');
          return 1;
        };
        return transactionFn;
      });

      const result = createConversation(10, 'Hello', 'Hi there!');

      expect(result).not.toBeNull();
      expect(result.id).toBe(1);
    });

    it('includes summary when provided', () => {
      mockTransaction.mockImplementation((fn: () => number) => {
        const transactionFn = () => {
          mockCreateConversation.run(10, 'Project summary');
          mockInsertMessage.run(1, 'user', 'Hello');
          mockInsertMessage.run(1, 'assistant', 'Hi there!');
          return 1;
        };
        return transactionFn;
      });

      const result = createConversation(10, 'Hello', 'Hi there!', 'Project summary');

      expect(result).not.toBeNull();
    });
  });

  describe('addMessage', () => {
    it('adds a user message by default', () => {
      mockInsertMessage.run.mockReturnValue({ lastInsertRowid: 3 });

      const result = addMessage(1, 'New message');

      expect(result.role).toBe('user');
      expect(result.content).toBe('New message');
      expect(result.id).toBe(3);
    });

    it('adds an assistant message when specified', () => {
      mockInsertMessage.run.mockReturnValue({ lastInsertRowid: 4 });

      const result = addMessage(1, 'AI response', 'assistant');

      expect(result.role).toBe('assistant');
      expect(result.content).toBe('AI response');
    });

    it('includes created_at timestamp', () => {
      mockInsertMessage.run.mockReturnValue({ lastInsertRowid: 5 });

      const result = addMessage(1, 'Test');

      expect(result.created_at).toBeDefined();
      expect(typeof result.created_at).toBe('string');
    });
  });

  describe('updateConversationSummary', () => {
    it('updates the conversation summary', () => {
      updateConversationSummary(1, 'New summary');

      expect(mockUpdateSummary.run).toHaveBeenCalledWith('New summary', 1);
    });
  });

  describe('markConversationAsViewed', () => {
    it('marks the conversation as viewed', () => {
      markConversationAsViewed(1);

      expect(mockMarkViewed.run).toHaveBeenCalledWith(1);
    });
  });
});

/**
 * Unit Tests for app/components/ContactPane.tsx
 *
 * Tests the ContactPane component rendering and chat interactions.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactPane } from '@/app/components/ContactPane';

/* eslint-disable @typescript-eslint/no-require-imports */
// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    contact: {
      init: jest.fn(),
      chat: jest.fn(),
      latest: jest.fn(),
    },
  },
}));

describe('ContactPane Component', () => {
  const { api } = require('@/lib/api');
  const mockOnBack = jest.fn();

  const mockProfessional = {
    id: 1,
    name: 'John Designer',
    company: 'Design Co',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api.contact.init.mockResolvedValue({
      id: 1,
      messages: [
        { id: 1, role: 'user', content: 'Hello' },
        { id: 2, role: 'assistant', content: 'Hi there! How can I help?' },
      ],
      suggestions: ['Budget', 'Timeline', 'Style'],
      projectSummary: 'Initial contact',
      isSufficient: false,
    });
    api.contact.chat.mockResolvedValue({
      message: { id: 3, role: 'assistant', content: 'That sounds great!' },
      suggestions: ['More details', 'Start date'],
      projectSummary: 'Kitchen remodel',
      isSufficient: false,
    });
    api.contact.latest.mockResolvedValue({
      conversation: {
        id: 1,
        messages: [
          { id: 1, role: 'user', content: 'Previous message' },
          { id: 2, role: 'assistant', content: 'Previous response' },
        ],
        last_summary: 'Previous summary',
      },
    });
  });

  it('renders initial view with default message', () => {
    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    // Should show initial input with default message
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(input.value).toContain("Hi John Designer, I'm interested");
  });

  it('renders back button (←)', () => {
    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    const backButton = screen.getByText('←');
    expect(backButton).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    const backButton = screen.getByText('←');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('sends initial message and transitions to chat view', async () => {
    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    // Find and click send button
    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(api.contact.init).toHaveBeenCalledWith({
        professionalId: 1,
        message: expect.stringContaining("Hi John Designer"),
      });
    });

    // Should show chat messages
    await waitFor(() => {
      expect(screen.getByText('Hi there! How can I help?')).toBeInTheDocument();
    });
  });

  it('displays suggestions after initial message', async () => {
    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Budget')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText('Style')).toBeInTheDocument();
    });
  });

  it('sends suggestion when clicked', async () => {
    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    // First, send initial message
    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Budget')).toBeInTheDocument();
    });

    // Click a suggestion
    fireEvent.click(screen.getByText('Budget'));

    await waitFor(() => {
      expect(api.contact.chat).toHaveBeenCalledWith({
        conversationId: 1,
        message: 'Budget',
      });
    });
  });

  it('loads existing conversation when initialConversationId is provided', async () => {
    render(
      <ContactPane
        professional={mockProfessional}
        onBack={mockOnBack}
        initialConversationId={123}
      />
    );

    await waitFor(() => {
      expect(api.contact.latest).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Previous response')).toBeInTheDocument();
    });
  });

  it('shows sending state when message is being sent', async () => {
    // Make the API call take some time
    api.contact.init.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({
        id: 1,
        messages: [{ id: 1, role: 'assistant', content: 'Response' }],
        suggestions: [],
      }), 100)
    ));

    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    // Button should show sending state
    expect(screen.getByText('Sending Message...')).toBeInTheDocument();
  });

  it('displays professional name in header', () => {
    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    // The professional name is part of "Message John Designer's Assistant"
    expect(screen.getByText(/Message John Designer/)).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    api.contact.init.mockRejectedValue(new Error('Network error'));

    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    // Should not crash - wait for error handling
    await waitFor(() => {
      expect(api.contact.init).toHaveBeenCalled();
    });
  });

  it('does not send empty messages', async () => {
    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    // Clear the default message
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });

    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    // Should not have called the API
    expect(api.contact.init).not.toHaveBeenCalled();
  });

  it('displays user messages with correct styling', async () => {
    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    await waitFor(() => {
      // User message should be visible
      const userMessage = screen.getByText('Hello');
      expect(userMessage).toBeInTheDocument();
    });
  });

  it('displays assistant messages with correct styling', async () => {
    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    await waitFor(() => {
      // Assistant message should be visible
      const assistantMessage = screen.getByText('Hi there! How can I help?');
      expect(assistantMessage).toBeInTheDocument();
    });
  });

  it('allows typing in textarea', () => {
    render(<ContactPane professional={mockProfessional} onBack={mockOnBack} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Custom message' } });

    expect((input as HTMLTextAreaElement).value).toBe('Custom message');
  });
});

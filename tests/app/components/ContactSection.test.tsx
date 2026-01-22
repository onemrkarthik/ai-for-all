/**
 * Unit Tests for app/professionals/[id]/ContactSection.tsx
 *
 * Tests the ContactSection component rendering and interactions.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactSection } from '@/app/professionals/[id]/ContactSection';
import { api } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    contact: {
      markViewed: jest.fn().mockResolvedValue({}),
    },
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

// Mock ContactPane
jest.mock('@/app/components/ContactPane', () => ({
  ContactPane: ({ professional, onBack }: { professional: { name: string }; onBack: () => void }) => (
    <div data-testid="contact-pane">
      <span>Contact {professional.name}</span>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

// Mock marked
jest.mock('marked', () => ({
  marked: {
    parse: (text: string) => `<p>${text}</p>`,
  },
}));

describe('ContactSection Component', () => {
  const mockProfessional = {
    id: 1,
    name: 'John Designer',
    company: 'Design Co',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Get in Touch" when no existing conversation', () => {
    render(<ContactSection professional={mockProfessional} />);

    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByText(/Interested in working with John Designer/)).toBeInTheDocument();
    expect(screen.getByText('Contact Professional')).toBeInTheDocument();
  });

  it('shows ContactPane when "Contact Professional" is clicked', () => {
    render(<ContactSection professional={mockProfessional} />);

    fireEvent.click(screen.getByText('Contact Professional'));

    expect(screen.getByTestId('contact-pane')).toBeInTheDocument();
    expect(screen.getByText('Contact John Designer')).toBeInTheDocument();
  });

  it('renders conversation summary when one exists', () => {
    render(
      <ContactSection
        professional={mockProfessional}
        existingConversationId={123}
        conversationSummary="Kitchen renovation project"
      />
    );

    expect(screen.getByText('Your conversation with the pro')).toBeInTheDocument();
    expect(screen.getByText('Resume Conversation')).toBeInTheDocument();
    expect(screen.getByText('Start New Conversation')).toBeInTheDocument();
  });

  it('shows new message indicator when hasNewMessages is true', () => {
    render(
      <ContactSection
        professional={mockProfessional}
        existingConversationId={123}
        conversationSummary="Kitchen project"
        hasNewMessages={true}
      />
    );

    // New message badge should be present on Resume Conversation button
    const resumeButton = screen.getByText('Resume Conversation');
    expect(resumeButton.parentElement?.querySelector('span')).toBeInTheDocument();
  });

  it('does not show new message indicator when hasNewMessages is false', () => {
    render(
      <ContactSection
        professional={mockProfessional}
        existingConversationId={123}
        conversationSummary="Kitchen project"
        hasNewMessages={false}
      />
    );

    // Should not have the notification badge with "!"
    expect(screen.queryByText('!')).not.toBeInTheDocument();
  });

  it('opens ContactPane when "Resume Conversation" is clicked', async () => {
    render(
      <ContactSection
        professional={mockProfessional}
        existingConversationId={123}
        conversationSummary="Kitchen project"
        hasNewMessages={true}
      />
    );

    fireEvent.click(screen.getByText('Resume Conversation'));

    expect(screen.getByTestId('contact-pane')).toBeInTheDocument();

    // Should call markViewed API
    await waitFor(() => {
      expect(mockApi.contact.markViewed).toHaveBeenCalledWith({ conversationId: 123 });
    });
  });

  it('opens ContactPane when "Start New Conversation" is clicked', () => {
    render(
      <ContactSection
        professional={mockProfessional}
        existingConversationId={123}
        conversationSummary="Kitchen project"
      />
    );

    fireEvent.click(screen.getByText('Start New Conversation'));

    expect(screen.getByTestId('contact-pane')).toBeInTheDocument();
  });

  it('returns to main view when Back is clicked in ContactPane', () => {
    render(<ContactSection professional={mockProfessional} />);

    // Open ContactPane
    fireEvent.click(screen.getByText('Contact Professional'));
    expect(screen.getByTestId('contact-pane')).toBeInTheDocument();

    // Click back
    fireEvent.click(screen.getByText('Back'));

    // Should be back to main view
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
  });
});

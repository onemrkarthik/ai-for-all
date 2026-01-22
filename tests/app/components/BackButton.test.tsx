/**
 * Unit Tests for app/professionals/[id]/BackButton.tsx
 *
 * Tests the BackButton component rendering and behavior.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackButton } from '@/app/professionals/[id]/BackButton';

// Mock useRouter
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe('BackButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the back arrow', () => {
    render(<BackButton />);

    expect(screen.getByText('←')).toBeInTheDocument();
  });

  it('calls router.back on click', () => {
    render(<BackButton />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('changes color on hover', () => {
    render(<BackButton />);

    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);
    expect(button.style.color).toBe('var(--foreground-dark)');

    fireEvent.mouseLeave(button);
    expect(button.style.color).toBe('var(--text-muted)');
  });
});

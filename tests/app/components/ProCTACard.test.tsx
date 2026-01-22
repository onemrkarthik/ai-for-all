/**
 * Unit Tests for app/components/ProCTACard.tsx
 *
 * Tests the professional CTA card component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProCTACard } from '@/app/components/ProCTACard';

describe('ProCTACard Component', () => {
  it('renders the card', () => {
    render(<ProCTACard />);

    expect(screen.getByText('Find the right local pro for your project')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<ProCTACard />);

    expect(screen.getByText(/Find top design and renovation professionals/)).toBeInTheDocument();
  });

  it('renders zip code input', () => {
    render(<ProCTACard />);

    const input = screen.getByPlaceholderText('ZIP');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders Get Started link', () => {
    render(<ProCTACard />);

    const link = screen.getByText('Get Started');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/professionals');
  });

  it('allows typing in zip code input', () => {
    render(<ProCTACard />);

    const input = screen.getByPlaceholderText('ZIP') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '90210' } });

    expect(input.value).toBe('90210');
  });

  it('has proper styling for the card', () => {
    const { container } = render(<ProCTACard />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveStyle({ background: '#2F3033' });
  });

  it('renders with green Get Started button', () => {
    render(<ProCTACard />);

    const link = screen.getByText('Get Started').closest('a');
    expect(link).toHaveStyle({ background: '#4CAF50' });
  });

  it('renders houzz logo', () => {
    render(<ProCTACard />);

    expect(screen.getByText('houzz')).toBeInTheDocument();
  });
});

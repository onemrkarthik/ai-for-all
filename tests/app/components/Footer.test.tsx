/**
 * Unit Tests for app/components/Footer.tsx
 *
 * Tests the footer component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '@/app/components/Footer';

describe('Footer Component', () => {
  it('renders the footer element', () => {
    render(<Footer />);

    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('displays current year in copyright', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it('renders Kitchen Photos link', () => {
    render(<Footer />);

    const link = screen.getByText('Kitchen Photos');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/photos/kitchen-ideas-and-designs-phbr0-bp~t_709');
  });

  it('renders Design Styles link with nav helper', () => {
    render(<Footer />);

    const link = screen.getByText('Design Styles');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/styles');
  });

  it('renders Find Professionals link with nav helper', () => {
    render(<Footer />);

    const link = screen.getByText('Find Professionals');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/professionals');
  });

  it('renders Explore section', () => {
    render(<Footer />);

    expect(screen.getByText('Explore')).toBeInTheDocument();
  });

  it('renders with dark background', () => {
    render(<Footer />);

    const footer = document.querySelector('footer');
    expect(footer).toHaveStyle({ background: 'var(--foreground-dark)' });
  });
});

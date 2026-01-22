/**
 * Unit Tests for app/components/Skeleton.tsx
 *
 * Tests the loading skeleton component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/app/components/Skeleton';

describe('Skeleton Component', () => {
  it('renders default 4 skeleton cards', () => {
    render(<Skeleton />);

    const cards = document.querySelectorAll('.skeleton-card');
    expect(cards).toHaveLength(4);
  });

  it('renders specified number of skeleton cards', () => {
    render(<Skeleton count={6} />);

    const cards = document.querySelectorAll('.skeleton-card');
    expect(cards).toHaveLength(6);
  });

  it('renders with count of 1', () => {
    render(<Skeleton count={1} />);

    const cards = document.querySelectorAll('.skeleton-card');
    expect(cards).toHaveLength(1);
  });

  it('renders skeleton cards with shimmer animation', () => {
    render(<Skeleton count={2} />);

    const cards = document.querySelectorAll('.skeleton-card');
    cards.forEach((card) => {
      // Each card should have the shimmer overlay div
      const shimmer = card.querySelector('div[style*="animation"]');
      expect(shimmer).toBeInTheDocument();
    });
  });

  it('renders image placeholder', () => {
    render(<Skeleton count={1} />);

    const imagePlaceholder = document.querySelector('.card-image-container');
    expect(imagePlaceholder).toBeInTheDocument();
  });

  it('renders text placeholders', () => {
    const { container } = render(<Skeleton count={1} />);

    // Should have title and source placeholders
    const placeholders = container.querySelectorAll('div[style*="background: rgb(239, 239, 239)"], div[style*="background: rgb(245, 245, 245)"]');
    expect(placeholders.length).toBeGreaterThan(0);
  });
});

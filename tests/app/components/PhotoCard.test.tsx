/**
 * Unit Tests for app/components/PhotoCard.tsx
 *
 * Tests the photo card component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoCard } from '@/app/components/PhotoCard';
import type { Item } from '@/lib/data';

describe('PhotoCard Component', () => {
  const mockItem: Item = {
    id: 1,
    title: 'Modern Kitchen Design',
    source: 'Designer Studio',
    image: '/images/kitchen1.jpg',
  };

  it('renders photo with title', () => {
    render(<PhotoCard item={mockItem} index={0} />);

    expect(screen.getByText('Modern Kitchen Design')).toBeInTheDocument();
  });

  it('renders photo with source', () => {
    render(<PhotoCard item={mockItem} index={0} />);

    expect(screen.getByText('Designer Studio')).toBeInTheDocument();
  });

  it('renders image with correct alt text', () => {
    render(<PhotoCard item={mockItem} index={0} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', 'Modern Kitchen Design');
  });

  it('renders image with correct src', () => {
    render(<PhotoCard item={mockItem} index={0} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/images/kitchen1.jpg');
  });

  it('sets data attributes for photo id and index', () => {
    const { container } = render(<PhotoCard item={mockItem} index={5} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('data-photo-id', '1');
    expect(card).toHaveAttribute('data-local-index', '5');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<PhotoCard item={mockItem} index={0} onClick={handleClick} />);

    const card = screen.getByText('Modern Kitchen Design').closest('div[data-photo-id]');
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledWith(mockItem);
  });

  it('does not error when onClick is not provided', () => {
    const { container } = render(<PhotoCard item={mockItem} index={0} />);

    const card = container.firstChild as HTMLElement;
    expect(() => fireEvent.click(card)).not.toThrow();
  });

  it('sets priority on image when specified', () => {
    render(<PhotoCard item={mockItem} index={0} priority={true} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('data-priority', 'true');
  });

  it('renders colored dot based on source', () => {
    const { container } = render(<PhotoCard item={mockItem} index={0} />);

    // Check for the dot span with border-radius
    const dot = container.querySelector('span[style*="border-radius: 50%"]');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveStyle({ width: '8px', height: '8px' });
  });

  it('generates consistent color for same source', () => {
    const { container: container1 } = render(<PhotoCard item={mockItem} index={0} />);
    const { container: container2 } = render(<PhotoCard item={mockItem} index={1} />);

    const dot1 = container1.querySelector('span[style*="border-radius: 50%"]');
    const dot2 = container2.querySelector('span[style*="border-radius: 50%"]');

    // Same source should produce same color
    expect(dot1?.getAttribute('style')).toContain(dot2?.getAttribute('style')?.match(/background: [^;]+/)?.[0] || '');
  });

  it('renders with animation delay based on index', () => {
    const { container } = render(<PhotoCard item={mockItem} index={3} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveStyle({ animationDelay: '0.09s' }); // 3 * 0.03
  });
});

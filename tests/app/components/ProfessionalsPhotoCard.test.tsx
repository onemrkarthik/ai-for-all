/**
 * Unit Tests for app/professionals/[id]/PhotoCard.tsx
 *
 * Tests the PhotoCard component in the professional detail page.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoCard } from '@/app/professionals/[id]/PhotoCard';
import type { Item } from '@/lib/data';

// Mock the PhotoGallery context
const mockOpenPhoto = jest.fn();
jest.mock('@/app/components/PhotoGallery', () => ({
  usePhotoGallery: () => ({
    openPhoto: mockOpenPhoto,
  }),
}));

describe('PhotoCard Component (Professional Detail)', () => {
  const mockPhoto: Item = {
    id: 1,
    title: 'Modern Kitchen Design',
    source: 'Designer A',
    image: 'https://example.com/kitchen.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the photo title', () => {
    render(<PhotoCard photo={mockPhoto} index={0} />);

    expect(screen.getByText('Modern Kitchen Design')).toBeInTheDocument();
  });

  it('renders the image', () => {
    render(<PhotoCard photo={mockPhoto} index={0} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Modern Kitchen Design');
  });

  it('calls openPhoto when clicked', () => {
    render(<PhotoCard photo={mockPhoto} index={2} />);

    fireEvent.click(screen.getByText('Modern Kitchen Design').closest('div')!.parentElement!);

    expect(mockOpenPhoto).toHaveBeenCalledWith(mockPhoto, 2);
  });

  it('has cursor pointer style', () => {
    const { container } = render(<PhotoCard photo={mockPhoto} index={0} />);

    const card = container.querySelector('.glass');
    expect(card).toHaveStyle({ cursor: 'pointer' });
  });
});

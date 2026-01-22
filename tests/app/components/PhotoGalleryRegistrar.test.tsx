/**
 * Unit Tests for app/professionals/[id]/PhotoGalleryRegistrar.tsx
 *
 * Tests the PhotoGalleryRegistrar component.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { PhotoGalleryRegistrar } from '@/app/professionals/[id]/PhotoGalleryRegistrar';
import type { Item } from '@/lib/data';

// Mock PhotoGallery context
const mockRegisterPhotos = jest.fn();
jest.mock('@/app/components/PhotoGallery', () => ({
  usePhotoGallery: () => ({
    registerPhotos: mockRegisterPhotos,
  }),
}));

describe('PhotoGalleryRegistrar Component', () => {
  const mockPhotos: Item[] = [
    { id: 1, title: 'Photo 1', image: '/1.jpg', source: 'Test' },
    { id: 2, title: 'Photo 2', image: '/2.jpg', source: 'Test' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing (returns null)', () => {
    const { container } = render(<PhotoGalleryRegistrar photos={mockPhotos} />);

    expect(container.firstChild).toBeNull();
  });

  it('registers photos with gallery on mount', () => {
    render(<PhotoGalleryRegistrar photos={mockPhotos} />);

    expect(mockRegisterPhotos).toHaveBeenCalledWith(mockPhotos, 0);
  });

  it('does not register when photos array is empty', () => {
    render(<PhotoGalleryRegistrar photos={[]} />);

    expect(mockRegisterPhotos).not.toHaveBeenCalled();
  });

  it('re-registers when photos change', () => {
    const { rerender } = render(<PhotoGalleryRegistrar photos={mockPhotos} />);

    expect(mockRegisterPhotos).toHaveBeenCalledTimes(1);

    const newPhotos: Item[] = [
      { id: 3, title: 'Photo 3', image: '/3.jpg', source: 'Test' },
    ];

    rerender(<PhotoGalleryRegistrar photos={newPhotos} />);

    expect(mockRegisterPhotos).toHaveBeenCalledTimes(2);
    expect(mockRegisterPhotos).toHaveBeenLastCalledWith(newPhotos, 0);
  });
});

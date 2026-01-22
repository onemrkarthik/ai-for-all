/**
 * Unit Tests for app/components/PhotoBatchClient.tsx
 *
 * Tests the PhotoBatchClient component rendering.
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { PhotoBatchClient } from '@/app/components/PhotoBatchClient';
import type { Item } from '@/lib/data';

/* eslint-disable @typescript-eslint/no-require-imports */
// Mock PhotoGallery context
const mockRegisterPhotos = jest.fn();
const mockOpenPhoto = jest.fn();
jest.mock('@/app/components/PhotoGallery', () => ({
  usePhotoGalleryActions: () => ({
    registerPhotos: mockRegisterPhotos,
    openPhoto: mockOpenPhoto,
  }),
}));

// Mock PhotoCard
jest.mock('@/app/components/PhotoCard', () => ({
  PhotoCard: ({ item, onClick }: { item: Item; onClick: (item: Item) => void }) => (
    <div data-testid="photo-card" onClick={() => onClick(item)}>
      {item.title}
    </div>
  ),
}));

// Mock ProCTACard
jest.mock('@/app/components/ProCTACard', () => ({
  ProCTACard: () => <div data-testid="pro-cta-card">CTA</div>,
}));

describe('PhotoBatchClient Component', () => {
  const mockData: Item[] = [
    { id: 1, title: 'Photo 1', image: '/1.jpg', source: 'Test' },
    { id: 2, title: 'Photo 2', image: '/2.jpg', source: 'Test' },
    { id: 3, title: 'Photo 3', image: '/3.jpg', source: 'Test' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders photo cards', () => {
    render(<PhotoBatchClient data={mockData} offset={0} limit={20} delay={0} />);

    expect(screen.getAllByTestId('photo-card')).toHaveLength(3);
  });

  it('renders photo titles', () => {
    render(<PhotoBatchClient data={mockData} offset={0} limit={20} delay={0} />);

    expect(screen.getByText('Photo 1')).toBeInTheDocument();
    expect(screen.getByText('Photo 2')).toBeInTheDocument();
    expect(screen.getByText('Photo 3')).toBeInTheDocument();
  });

  it('registers photos on mount after timeout', () => {
    render(<PhotoBatchClient data={mockData} offset={0} limit={20} delay={0} />);

    // Run the setTimeout
    act(() => {
      jest.runAllTimers();
    });

    expect(mockRegisterPhotos).toHaveBeenCalledWith(mockData, 0);
  });

  it('registers photos at correct offset', () => {
    render(<PhotoBatchClient data={mockData} offset={20} limit={20} delay={0} />);

    act(() => {
      jest.runAllTimers();
    });

    expect(mockRegisterPhotos).toHaveBeenCalledWith(mockData, 20);
  });

  it('calls openPhoto when photo card is clicked', () => {
    render(<PhotoBatchClient data={mockData} offset={0} limit={20} delay={0} />);

    const { fireEvent } = require('@testing-library/react');
    const firstPhoto = screen.getAllByTestId('photo-card')[0];
    fireEvent.click(firstPhoto);

    expect(mockOpenPhoto).toHaveBeenCalledWith(mockData[0], 0);
  });

  it('calculates correct global index when offset is non-zero', () => {
    render(<PhotoBatchClient data={mockData} offset={20} limit={20} delay={0} />);

    const { fireEvent } = require('@testing-library/react');
    const secondPhoto = screen.getAllByTestId('photo-card')[1];
    fireEvent.click(secondPhoto);

    // Global index = offset (20) + local index (1) = 21
    expect(mockOpenPhoto).toHaveBeenCalledWith(mockData[1], 21);
  });

  it('shows ProCTACard when showCTACard is true', () => {
    const manyPhotos = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Photo ${i + 1}`,
      image: `/${i + 1}.jpg`,
      source: 'Test',
    }));

    render(<PhotoBatchClient data={manyPhotos} offset={0} limit={20} delay={0} showCTACard={true} />);

    expect(screen.getByTestId('pro-cta-card')).toBeInTheDocument();
  });

  it('does not show ProCTACard when showCTACard is false', () => {
    render(<PhotoBatchClient data={mockData} offset={0} limit={20} delay={0} showCTACard={false} />);

    expect(screen.queryByTestId('pro-cta-card')).not.toBeInTheDocument();
  });
});

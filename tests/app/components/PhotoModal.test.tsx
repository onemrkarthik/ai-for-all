/**
 * Unit Tests for app/components/PhotoModal.tsx
 *
 * Tests the PhotoModal component rendering and interactions.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoModal } from '@/app/components/PhotoModal';
import type { Item } from '@/lib/data';

/* eslint-disable @typescript-eslint/no-require-imports */
// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    photos: {
      get: jest.fn(),
    },
    contact: {
      latest: jest.fn(),
    },
  },
}));

// Mock marked
jest.mock('marked', () => ({
  marked: {
    parse: (text: string) => `<p>${text}</p>`,
  },
}));

describe('PhotoModal Component', () => {
  const { api } = require('@/lib/api');
  const mockOnClose = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnPrevious = jest.fn();

  const mockPhoto: Item = {
    id: 1,
    title: 'Modern Kitchen Design',
    image: 'https://example.com/kitchen.jpg',
    source: 'Designer A',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api.photos.get.mockResolvedValue({
      id: 1,
      title: 'Modern Kitchen Design',
      image: 'https://example.com/kitchen.jpg',
      source: 'Designer A',
      description: 'A beautiful modern kitchen',
      professional: {
        id: 5,
        name: 'John Designer',
        company: 'Design Co',
        averageRating: 4.5,
        reviewCount: 20,
      },
      attributes: [
        { label: 'Style', value: 'Modern' },
        { label: 'Color', value: 'White' },
      ],
    });
    api.contact.latest.mockResolvedValue({ conversation: null });
  });

  it('renders nothing when photo is null', () => {
    const { container } = render(
      <PhotoModal
        photo={null}
        currentIndex={null}
        totalPhotos={0}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders modal when photo is provided', async () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={0}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    // Modal should be visible - find the image
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('displays photo title after loading', async () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={0}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Modern Kitchen Design')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={0}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    // Close button has aria-label="Close modal"
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when next button is clicked', async () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={0}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    // Next button has aria-label="Next photo"
    const nextButton = screen.getByRole('button', { name: /next photo/i });
    fireEvent.click(nextButton);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevious when previous button is clicked', async () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={5}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    // Previous button has aria-label="Previous photo"
    const prevButton = screen.getByRole('button', { name: /previous photo/i });
    fireEvent.click(prevButton);

    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation - Escape to close', async () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={0}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation - ArrowRight for next', async () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={0}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation - ArrowLeft for previous', async () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={5}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it('fetches full photo details on mount', async () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={0}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    await waitFor(() => {
      expect(api.photos.get).toHaveBeenCalledWith(1);
    });
  });

  it('displays professional info after fetching details', async () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={0}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Designer')).toBeInTheDocument();
      expect(screen.getByText('Design Co')).toBeInTheDocument();
    });
  });

  it('displays photo attributes after fetching details', async () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={0}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Style')).toBeInTheDocument();
      expect(screen.getByText('Modern')).toBeInTheDocument();
    });
  });

  it('shows loading more indicator when isLoadingMore is true at last photo', () => {
    render(
      <PhotoModal
        photo={mockPhoto}
        currentIndex={9}
        totalPhotos={10}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        isLoadingMore={true}
      />
    );

    expect(screen.getByText('Loading more photos...')).toBeInTheDocument();
  });
});

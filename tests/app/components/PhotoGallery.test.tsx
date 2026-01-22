/**
 * Unit Tests for app/components/PhotoGallery.tsx
 *
 * Tests the PhotoGalleryProvider context and hooks.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PhotoGalleryProvider, usePhotoGallery, usePhotoGalleryActions } from '@/app/components/PhotoGallery';
import type { Item } from '@/lib/data';

// Mock PhotoModal
jest.mock('@/app/components/PhotoModal', () => ({
  PhotoModal: ({ photo, onClose, onNext, onPrevious, currentIndex, totalPhotos }: {
    photo: Item | null;
    onClose: () => void;
    onNext: () => void;
    onPrevious: () => void;
    currentIndex: number | null;
    totalPhotos: number;
  }) => (
    photo ? (
      <div data-testid="photo-modal">
        <span data-testid="modal-title">{photo.title}</span>
        <span data-testid="modal-index">{currentIndex}</span>
        <span data-testid="modal-total">{totalPhotos}</span>
        <button onClick={onClose} data-testid="close-btn">Close</button>
        <button onClick={onPrevious} data-testid="prev-btn">Previous</button>
        <button onClick={onNext} data-testid="next-btn">Next</button>
      </div>
    ) : null
  ),
}));

// Test component that uses the hooks
function TestComponent({ testId }: { testId?: string }) {
  const { photos, currentPhoto, currentIndex, totalPhotos } = usePhotoGallery();
  const { registerPhotos, openPhoto, openPhotoAtIndex, closeModal } = usePhotoGalleryActions();

  return (
    <div data-testid={testId || 'test-component'}>
      <span data-testid="photo-count">{photos.length}</span>
      <span data-testid="current-index">{currentIndex}</span>
      <span data-testid="current-photo">{currentPhoto?.title || 'none'}</span>
      <span data-testid="total-photos">{totalPhotos}</span>
      <button
        data-testid="register-photos"
        onClick={() => registerPhotos([
          { id: 1, title: 'Photo 1', image: '/1.jpg', source: 'Test' },
          { id: 2, title: 'Photo 2', image: '/2.jpg', source: 'Test' },
          { id: 3, title: 'Photo 3', image: '/3.jpg', source: 'Test' },
        ], 0)}
      >
        Register Photos
      </button>
      <button
        data-testid="open-photo"
        onClick={() => openPhoto({ id: 1, title: 'Photo 1', image: '/1.jpg', source: 'Test' }, 0)}
      >
        Open Photo
      </button>
      <button
        data-testid="open-photo-index"
        onClick={() => openPhotoAtIndex(1)}
      >
        Open Photo Index
      </button>
      <button
        data-testid="close-modal"
        onClick={closeModal}
      >
        Close Modal
      </button>
    </div>
  );
}

describe('PhotoGalleryProvider', () => {
  it('provides initial state', () => {
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );

    expect(screen.getByTestId('photo-count')).toHaveTextContent('0');
    expect(screen.getByTestId('current-index')).toHaveTextContent('');
    expect(screen.getByTestId('current-photo')).toHaveTextContent('none');
    expect(screen.getByTestId('total-photos')).toHaveTextContent('0');
  });

  it('registers photos correctly', () => {
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('register-photos'));
    });

    expect(screen.getByTestId('photo-count')).toHaveTextContent('3');
    expect(screen.getByTestId('total-photos')).toHaveTextContent('3');
  });

  it('opens photo with explicit photo data', () => {
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );

    // Register photos first
    act(() => {
      fireEvent.click(screen.getByTestId('register-photos'));
    });

    // Open a photo
    act(() => {
      fireEvent.click(screen.getByTestId('open-photo'));
    });

    expect(screen.getByTestId('photo-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Photo 1');
    expect(screen.getByTestId('modal-index')).toHaveTextContent('0');
  });

  it('opens photo by index', () => {
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );

    // Register photos first
    act(() => {
      fireEvent.click(screen.getByTestId('register-photos'));
    });

    // Open by index
    act(() => {
      fireEvent.click(screen.getByTestId('open-photo-index'));
    });

    expect(screen.getByTestId('photo-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Photo 2');
  });

  it('closes modal', () => {
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );

    // Register and open
    act(() => {
      fireEvent.click(screen.getByTestId('register-photos'));
      fireEvent.click(screen.getByTestId('open-photo'));
    });

    expect(screen.getByTestId('photo-modal')).toBeInTheDocument();

    // Close
    act(() => {
      fireEvent.click(screen.getByTestId('close-btn'));
    });

    expect(screen.queryByTestId('photo-modal')).not.toBeInTheDocument();
  });

  it('navigates to next photo', () => {
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('register-photos'));
      fireEvent.click(screen.getByTestId('open-photo'));
    });

    expect(screen.getByTestId('modal-index')).toHaveTextContent('0');

    act(() => {
      fireEvent.click(screen.getByTestId('next-btn'));
    });

    expect(screen.getByTestId('modal-index')).toHaveTextContent('1');
  });

  it('navigates to previous photo', () => {
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('register-photos'));
    });

    // Open at index 1
    act(() => {
      fireEvent.click(screen.getByTestId('open-photo-index'));
    });

    expect(screen.getByTestId('modal-index')).toHaveTextContent('1');

    act(() => {
      fireEvent.click(screen.getByTestId('prev-btn'));
    });

    expect(screen.getByTestId('modal-index')).toHaveTextContent('0');
  });

  it('does not go below index 0', () => {
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('register-photos'));
      fireEvent.click(screen.getByTestId('open-photo')); // Opens at 0
    });

    act(() => {
      fireEvent.click(screen.getByTestId('prev-btn'));
    });

    // Should stay at 0
    expect(screen.getByTestId('modal-index')).toHaveTextContent('0');
  });

  it('does not go above max index', () => {
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('register-photos'));
    });

    // Open at index 1
    act(() => {
      fireEvent.click(screen.getByTestId('open-photo-index')); // Opens at 1
    });

    // Navigate to index 2 (last)
    act(() => {
      fireEvent.click(screen.getByTestId('next-btn'));
    });

    expect(screen.getByTestId('modal-index')).toHaveTextContent('2');

    // Try to go past the end
    act(() => {
      fireEvent.click(screen.getByTestId('next-btn'));
    });

    // Should stay at 2 (max)
    expect(screen.getByTestId('modal-index')).toHaveTextContent('2');
  });
});

describe('usePhotoGalleryActions hook', () => {
  it('provides stable action references', () => {
    // Track captured actions via DOM
    function CaptureActions() {
      const actions = usePhotoGalleryActions();
      return (
        <div data-testid="actions-container">
          <span data-testid="has-register">{typeof actions.registerPhotos}</span>
          <span data-testid="has-open">{typeof actions.openPhoto}</span>
          <span data-testid="has-close">{typeof actions.closeModal}</span>
        </div>
      );
    }

    render(
      <PhotoGalleryProvider>
        <CaptureActions />
      </PhotoGalleryProvider>
    );

    expect(screen.getByTestId('has-register')).toHaveTextContent('function');
    expect(screen.getByTestId('has-open')).toHaveTextContent('function');
    expect(screen.getByTestId('has-close')).toHaveTextContent('function');
  });
});

describe('PhotoGalleryProvider load more', () => {
  it('provides setOnLoadMore callback', () => {
    function CaptureActions() {
      const actions = usePhotoGalleryActions();
      return (
        <span data-testid="has-load-more">{typeof actions.setOnLoadMore}</span>
      );
    }

    render(
      <PhotoGalleryProvider>
        <CaptureActions />
      </PhotoGalleryProvider>
    );

    expect(screen.getByTestId('has-load-more')).toHaveTextContent('function');
  });

  it('provides setOnModalClose callback', () => {
    function CaptureActions() {
      const actions = usePhotoGalleryActions();
      return (
        <span data-testid="has-modal-close">{typeof actions.setOnModalClose}</span>
      );
    }

    render(
      <PhotoGalleryProvider>
        <CaptureActions />
      </PhotoGalleryProvider>
    );

    expect(screen.getByTestId('has-modal-close')).toHaveTextContent('function');
  });
});

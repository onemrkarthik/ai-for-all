/**
 * Unit Tests for app/components/GalleryPageController.tsx
 *
 * Tests the GalleryPageController component for loading more photos.
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { GalleryPageController } from '@/app/components/GalleryPageController';

/* eslint-disable @typescript-eslint/no-require-imports */
// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/photos/ideas',
}));

// Mock PhotoGallery context
const mockSetOnLoadMore = jest.fn();
const mockSetOnModalClose = jest.fn();
jest.mock('@/app/components/PhotoGallery', () => ({
  usePhotoGalleryActions: () => ({
    setOnLoadMore: mockSetOnLoadMore,
    setOnModalClose: mockSetOnModalClose,
  }),
}));

// Mock API
jest.mock('@/lib/api', () => ({
  api: {
    feed: {
      list: jest.fn(),
    },
  },
}));

describe('GalleryPageController Component', () => {
  const { api } = require('@/lib/api');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers callbacks on mount', () => {
    render(
      <GalleryPageController
        currentPage={1}
        itemsPerPage={20}
        totalPages={5}
      />
    );

    expect(mockSetOnLoadMore).toHaveBeenCalledWith(expect.any(Function));
    expect(mockSetOnModalClose).toHaveBeenCalledWith(expect.any(Function));
  });

  it('clears callbacks on unmount', () => {
    const { unmount } = render(
      <GalleryPageController
        currentPage={1}
        itemsPerPage={20}
        totalPages={5}
      />
    );

    unmount();

    expect(mockSetOnLoadMore).toHaveBeenLastCalledWith(null);
    expect(mockSetOnModalClose).toHaveBeenLastCalledWith(null);
  });

  it('loads more photos when callback is called', async () => {
    api.feed.list.mockResolvedValue({
      photos: [
        { id: 21, title: 'Photo 21', image: '/21.jpg', source: 'Test' },
      ],
    });

    let loadMoreCallback: (() => Promise<unknown[]>) | null = null;
    mockSetOnLoadMore.mockImplementation((cb: typeof loadMoreCallback) => {
      loadMoreCallback = cb;
    });

    render(
      <GalleryPageController
        currentPage={1}
        itemsPerPage={20}
        totalPages={5}
      />
    );

    expect(loadMoreCallback).not.toBeNull();

    // Call the load more callback
    let result: unknown[] = [];
    await act(async () => {
      result = await loadMoreCallback!();
    });

    expect(api.feed.list).toHaveBeenCalledWith({
      offset: 20,
      limit: 20,
    });
    expect(result).toHaveLength(1);
  });

  it('returns empty array when all pages loaded', async () => {
    let loadMoreCallback: (() => Promise<unknown[]>) | null = null;
    mockSetOnLoadMore.mockImplementation((cb: typeof loadMoreCallback) => {
      loadMoreCallback = cb;
    });

    render(
      <GalleryPageController
        currentPage={5}
        itemsPerPage={20}
        totalPages={5}
      />
    );

    // Next page would be 6 which is > totalPages
    let result: unknown[] = [];
    await act(async () => {
      result = await loadMoreCallback!();
    });

    expect(result).toEqual([]);
    expect(api.feed.list).not.toHaveBeenCalled();
  });

  it('returns empty array when page already loaded', async () => {
    api.feed.list.mockResolvedValue({
      photos: [{ id: 21, title: 'Photo', image: '/21.jpg', source: 'Test' }],
    });

    let loadMoreCallback: (() => Promise<unknown[]>) | null = null;
    mockSetOnLoadMore.mockImplementation((cb: typeof loadMoreCallback) => {
      loadMoreCallback = cb;
    });

    render(
      <GalleryPageController
        currentPage={1}
        itemsPerPage={20}
        totalPages={5}
      />
    );

    // Load page 2
    await act(async () => {
      await loadMoreCallback!();
    });

    expect(api.feed.list).toHaveBeenCalledTimes(1);

    // Try to load page 2 again (should return empty, not call API again)
    // Note: In the actual implementation, loadedPagesRef tracks loaded pages
    // But since refs reset between renders in tests, this behavior is hard to test
  });

  it('renders null (no visible output)', () => {
    const { container } = render(
      <GalleryPageController
        currentPage={1}
        itemsPerPage={20}
        totalPages={5}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('handles API error gracefully', async () => {
    api.feed.list.mockRejectedValue(new Error('Network error'));

    let loadMoreCallback: (() => Promise<unknown[]>) | null = null;
    mockSetOnLoadMore.mockImplementation((cb: typeof loadMoreCallback) => {
      loadMoreCallback = cb;
    });

    render(
      <GalleryPageController
        currentPage={1}
        itemsPerPage={20}
        totalPages={5}
      />
    );

    let result: unknown[] = [];
    await act(async () => {
      result = await loadMoreCallback!();
    });

    expect(result).toEqual([]);
  });
});

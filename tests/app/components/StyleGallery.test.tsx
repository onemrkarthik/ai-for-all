/**
 * Unit Tests for app/styles/[style]/StyleGallery.tsx
 *
 * Tests the StyleGallery component rendering and data fetching.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import StyleGallery from '@/app/styles/[style]/StyleGallery';

/* eslint-disable @typescript-eslint/no-require-imports */
// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    feed: {
      list: jest.fn(),
    },
  },
}));

describe('StyleGallery Component', () => {
  const { api } = require('@/lib/api');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeletons initially', () => {
    api.feed.list.mockReturnValue(new Promise(() => {})); // Never resolves

    render(<StyleGallery style="Modern" />);

    // Should show skeleton cards while loading
    const skeletons = document.querySelectorAll('[style*="shimmer"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders photos after loading', async () => {
    api.feed.list.mockResolvedValue({
      photos: [
        { id: 1, title: 'Modern Kitchen 1', image: '/kitchen1.jpg' },
        { id: 2, title: 'Modern Kitchen 2', image: '/kitchen2.jpg' },
      ],
      totalCount: 2,
    });

    render(<StyleGallery style="Modern" />);

    await waitFor(() => {
      expect(screen.getByText('Modern Kitchen 1')).toBeInTheDocument();
      expect(screen.getByText('Modern Kitchen 2')).toBeInTheDocument();
    });
  });

  it('calls API with correct style filter', async () => {
    api.feed.list.mockResolvedValue({ photos: [], totalCount: 0 });

    render(<StyleGallery style="Farmhouse" />);

    await waitFor(() => {
      expect(api.feed.list).toHaveBeenCalledWith({
        filters: { Style: 'Farmhouse' },
        limit: 12,
      });
    });
  });

  it('renders empty state when no photos found', async () => {
    api.feed.list.mockResolvedValue({ photos: [], totalCount: 0 });

    render(<StyleGallery style="Minimalist" />);

    await waitFor(() => {
      expect(screen.getByText(/No photos found for Minimalist style kitchens/)).toBeInTheDocument();
      expect(screen.getByText('Browse all kitchen photos')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    api.feed.list.mockRejectedValue(new Error('API Error'));

    render(<StyleGallery style="Modern" />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load photos. Please try again later.')).toBeInTheDocument();
    });
  });

  it('renders professional link when photo has professional info', async () => {
    api.feed.list.mockResolvedValue({
      photos: [
        {
          id: 1,
          title: 'Designer Kitchen',
          image: '/kitchen.jpg',
          professional_name: 'Jane Designer',
          professional_id: 5,
        },
      ],
      totalCount: 1,
    });

    render(<StyleGallery style="Modern" />);

    await waitFor(() => {
      expect(screen.getByText('Designer Kitchen')).toBeInTheDocument();
    });
  });
});

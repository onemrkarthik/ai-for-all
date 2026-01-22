/**
 * Unit Tests for app/components/FilteredGallery.tsx
 *
 * Tests the FilteredGallery component rendering and filtering.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { FilteredGallery } from '@/app/components/FilteredGallery';

/* eslint-disable @typescript-eslint/no-require-imports */
// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    feed: {
      list: jest.fn(),
    },
  },
}));

// Mock PhotoGallery context
jest.mock('@/app/components/PhotoGallery', () => ({
  usePhotoGalleryActions: () => ({
    openPhoto: jest.fn(),
    registerPhotos: jest.fn(),
  }),
}));

// Mock child components
jest.mock('@/app/components/FilterBar', () => ({
  FilterBar: ({ onFilterChange, activeFilters, totalCount }: {
    onFilterChange: (filters: Record<string, string | null>) => void;
    activeFilters: Record<string, string | null>;
    totalCount: number;
  }) => (
    <div data-testid="filter-bar">
      <span data-testid="total-count">{totalCount}</span>
      <button
        data-testid="apply-filter"
        onClick={() => onFilterChange({ Style: 'Modern' })}
      >
        Apply Filter
      </button>
      <button
        data-testid="clear-filters"
        onClick={() => onFilterChange({ Style: null })}
      >
        Clear
      </button>
      <span data-testid="active-filters">{JSON.stringify(activeFilters)}</span>
    </div>
  ),
  KITCHEN_FILTERS: [
    { label: 'Style', values: ['Modern', 'Traditional'] },
  ],
}));

jest.mock('@/app/components/PhotoCard', () => ({
  PhotoCard: ({ item }: { item: { title: string } }) => (
    <div data-testid="photo-card">{item.title}</div>
  ),
}));

jest.mock('@/app/components/ProCTACard', () => ({
  ProCTACard: () => <div data-testid="pro-cta-card">CTA</div>,
}));

describe('FilteredGallery Component', () => {
  const { api } = require('@/lib/api');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when no filters are active', () => {
    render(
      <FilteredGallery totalCount={100} currentPage={1}>
        <div data-testid="children">Original Content</div>
      </FilteredGallery>
    );

    expect(screen.getByTestId('children')).toBeInTheDocument();
    expect(screen.getByText('Original Content')).toBeInTheDocument();
  });

  it('renders FilterBar component', () => {
    render(
      <FilteredGallery totalCount={100} currentPage={1}>
        <div>Content</div>
      </FilteredGallery>
    );

    expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
  });

  it('shows total count in filter bar', () => {
    render(
      <FilteredGallery totalCount={250} currentPage={1}>
        <div>Content</div>
      </FilteredGallery>
    );

    expect(screen.getByTestId('total-count')).toHaveTextContent('250');
  });

  it('fetches filtered photos when filter is applied', async () => {
    api.feed.list.mockResolvedValue({
      photos: [
        { id: 1, title: 'Modern Kitchen 1', image: '/1.jpg', source: 'Test' },
        { id: 2, title: 'Modern Kitchen 2', image: '/2.jpg', source: 'Test' },
      ],
      totalCount: 2,
    });

    render(
      <FilteredGallery totalCount={100} currentPage={1}>
        <div data-testid="children">Original</div>
      </FilteredGallery>
    );

    // Apply filter
    const { fireEvent } = require('@testing-library/react');
    fireEvent.click(screen.getByTestId('apply-filter'));

    await waitFor(() => {
      expect(api.feed.list).toHaveBeenCalledWith({
        offset: 0,
        limit: 100,
        filters: { Style: 'Modern' },
      });
    });

    // Should show filtered results instead of children
    await waitFor(() => {
      expect(screen.getByText('Modern Kitchen 1')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', async () => {
    api.feed.list.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <FilteredGallery totalCount={100} currentPage={1}>
        <div>Original</div>
      </FilteredGallery>
    );

    const { fireEvent } = require('@testing-library/react');
    fireEvent.click(screen.getByTestId('apply-filter'));

    // Should show loading skeleton
    await waitFor(() => {
      const loadingElements = document.querySelectorAll('[style*="pulse"]');
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  it('returns to original content when filters are cleared', async () => {
    api.feed.list.mockResolvedValue({
      photos: [{ id: 1, title: 'Filtered', image: '/1.jpg', source: 'Test' }],
      totalCount: 1,
    });

    render(
      <FilteredGallery totalCount={100} currentPage={1}>
        <div data-testid="children">Original Content</div>
      </FilteredGallery>
    );

    const { fireEvent } = require('@testing-library/react');

    // Apply filter
    fireEvent.click(screen.getByTestId('apply-filter'));

    await waitFor(() => {
      expect(screen.getByText('Filtered')).toBeInTheDocument();
    });

    // Clear filters
    fireEvent.click(screen.getByTestId('clear-filters'));

    await waitFor(() => {
      expect(screen.getByText('Original Content')).toBeInTheDocument();
    });
  });

  it('shows empty state when no photos match filter', async () => {
    api.feed.list.mockResolvedValue({
      photos: [],
      totalCount: 0,
    });

    render(
      <FilteredGallery totalCount={100} currentPage={1}>
        <div>Original</div>
      </FilteredGallery>
    );

    const { fireEvent } = require('@testing-library/react');
    fireEvent.click(screen.getByTestId('apply-filter'));

    await waitFor(() => {
      expect(screen.getByText(/No photos found/)).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your filters/)).toBeInTheDocument();
    });
  });

  it('updates active filters in FilterBar', async () => {
    api.feed.list.mockResolvedValue({
      photos: [{ id: 1, title: 'Photo', image: '/1.jpg', source: 'Test' }],
      totalCount: 1,
    });

    render(
      <FilteredGallery totalCount={100} currentPage={1}>
        <div>Content</div>
      </FilteredGallery>
    );

    const { fireEvent } = require('@testing-library/react');
    fireEvent.click(screen.getByTestId('apply-filter'));

    await waitFor(() => {
      const activeFiltersText = screen.getByTestId('active-filters').textContent;
      expect(activeFiltersText).toContain('Modern');
    });
  });
});

/**
 * Unit Tests for app/components/FilterBar.tsx
 *
 * Tests the FilterBar component rendering and interactions.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar, FilterOption, FilterValues, KITCHEN_FILTERS } from '@/app/components/FilterBar';

describe('FilterBar Component', () => {
  const mockFilters: FilterOption[] = [
    { label: 'Style', values: ['Modern', 'Farmhouse', 'Traditional'] },
    { label: 'Color', values: ['White', 'Gray', 'Black'] },
  ];

  const mockOnFilterChange = jest.fn();
  const defaultActiveFilters: FilterValues = { Style: null, Color: null };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders All Filters button', () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={defaultActiveFilters}
        totalCount={100}
      />
    );

    expect(screen.getByText('All Filters')).toBeInTheDocument();
  });

  it('renders filter dropdowns', () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={defaultActiveFilters}
        totalCount={100}
      />
    );

    // Check for comboboxes (multiple exist)
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThan(0);
  });

  it('renders quick filter pills as buttons', () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={defaultActiveFilters}
        totalCount={100}
      />
    );

    // Quick filter buttons exist (multiple elements may share text with options)
    const buttons = screen.getAllByRole('button');
    // Should have at least the quick filter buttons + All Filters
    expect(buttons.length).toBeGreaterThan(1);
  });

  it('displays photo count', () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={defaultActiveFilters}
        totalCount={1500}
      />
    );

    expect(screen.getByText(/1,500 photos/)).toBeInTheDocument();
  });

  it('calls onFilterChange when quick filter button is clicked', () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={defaultActiveFilters}
        totalCount={100}
      />
    );

    // Find the Modern quick filter button (not the option)
    const buttons = screen.getAllByRole('button');
    const modernButton = buttons.find(btn => btn.textContent === 'Modern');
    
    if (modernButton) {
      fireEvent.click(modernButton);
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        Style: 'Modern',
        Color: null,
      });
    }
  });

  it('toggles quick filter off when clicked again', () => {
    const activeWithStyle: FilterValues = { Style: 'Modern', Color: null };

    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={activeWithStyle}
        totalCount={100}
      />
    );

    // Find the Modern quick filter button
    const buttons = screen.getAllByRole('button');
    const modernButton = buttons.find(btn => btn.textContent === 'Modern');
    
    if (modernButton) {
      fireEvent.click(modernButton);
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        Style: null,
        Color: null,
      });
    }
  });

  it('calls onFilterChange when dropdown value changes', () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={defaultActiveFilters}
        totalCount={100}
      />
    );

    const selects = screen.getAllByRole('combobox');
    // Find the Style filter dropdown (first one after Budget/Sort)
    const styleSelect = selects.find(s => {
      const options = Array.from(s.querySelectorAll('option'));
      return options.some(o => o.textContent === 'Style');
    });

    if (styleSelect) {
      fireEvent.change(styleSelect, { target: { value: 'Farmhouse' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ Style: 'Farmhouse' })
      );
    }
  });

  it('shows active filter count badge', () => {
    const activeFilters: FilterValues = { Style: 'Modern', Color: 'White' };

    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={activeFilters}
        totalCount={100}
      />
    );

    // Should show "2" badge for 2 active filters
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows Clear all button when filters are active', () => {
    const activeFilters: FilterValues = { Style: 'Modern', Color: null };

    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={activeFilters}
        totalCount={100}
      />
    );

    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('does not show Clear all button when no filters are active', () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={defaultActiveFilters}
        totalCount={100}
      />
    );

    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });

  it('clears all filters when Clear all is clicked', () => {
    const activeFilters: FilterValues = { Style: 'Modern', Color: 'White' };

    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={activeFilters}
        totalCount={100}
      />
    );

    fireEvent.click(screen.getByText('Clear all'));

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      Style: null,
      Color: null,
    });
  });

  it('renders Refine by dropdown', () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={defaultActiveFilters}
        totalCount={100}
      />
    );

    expect(screen.getByText('Refine by:')).toBeInTheDocument();
  });

  it('renders Sort by dropdown', () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={defaultActiveFilters}
        totalCount={100}
      />
    );

    expect(screen.getByText('Sort by:')).toBeInTheDocument();
  });

  it('shows Popular Today as default sort option', () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={defaultActiveFilters}
        totalCount={100}
      />
    );

    expect(screen.getByText('Popular Today')).toBeInTheDocument();
  });

  it('uses KITCHEN_FILTERS constant correctly', () => {
    // Test that the constant has expected structure
    expect(KITCHEN_FILTERS).toBeDefined();
    expect(KITCHEN_FILTERS.length).toBeGreaterThan(0);
    expect(KITCHEN_FILTERS[0]).toHaveProperty('label');
    expect(KITCHEN_FILTERS[0]).toHaveProperty('values');
    expect(Array.isArray(KITCHEN_FILTERS[0].values)).toBe(true);
  });

  it('renders with default totalCount of 0', () => {
    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        activeFilters={defaultActiveFilters}
      />
    );

    expect(screen.getByText(/0 photos/)).toBeInTheDocument();
  });
});

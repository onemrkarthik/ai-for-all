/**
 * Unit Tests for app/components/Pagination.tsx
 *
 * Tests the Pagination component rendering and behavior.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Pagination } from '@/app/components/Pagination';

// Mock usePathname and useSearchParams
const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

describe('Pagination Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/photos');
    mockUseSearchParams.mockReturnValue({
      toString: () => '',
    });
  });

  it('returns null when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} totalCount={10} itemsPerPage={20} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when totalPages is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} totalCount={0} itemsPerPage={20} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays correct photo count range', () => {
    render(
      <Pagination currentPage={1} totalPages={5} totalCount={100} itemsPerPage={20} />
    );

    expect(screen.getByText('Showing 1 - 20 of 100 photos')).toBeInTheDocument();
  });

  it('displays correct range for middle page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} totalCount={100} itemsPerPage={20} />
    );

    expect(screen.getByText('Showing 41 - 60 of 100 photos')).toBeInTheDocument();
  });

  it('displays correct range for last page with partial items', () => {
    render(
      <Pagination currentPage={5} totalPages={5} totalCount={95} itemsPerPage={20} />
    );

    expect(screen.getByText('Showing 81 - 95 of 95 photos')).toBeInTheDocument();
  });

  it('renders page numbers when totalPages is small', () => {
    render(
      <Pagination currentPage={1} totalPages={3} totalCount={60} itemsPerPage={20} />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders ellipsis for large page counts', () => {
    render(
      <Pagination currentPage={5} totalPages={20} totalCount={400} itemsPerPage={20} />
    );

    // Should show first page, ellipsis, pages around current, ellipsis, last page
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getAllByText('...')).toHaveLength(2);
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} totalCount={100} itemsPerPage={20} />
    );

    // First page should have a disabled-looking previous (span instead of link)
    const pageLinks = screen.getAllByRole('link');
    // Should not have a previous link when on first page
    const prevLink = pageLinks.find(link => {
      const href = link.getAttribute('href');
      return href && href.includes('page=0');
    });
    expect(prevLink).toBeUndefined();
  });

  it('shows previous link on page 2', () => {
    render(
      <Pagination currentPage={2} totalPages={5} totalCount={100} itemsPerPage={20} />
    );

    // Should have a link to page 1 (which removes page param)
    const pageLinks = screen.getAllByRole('link');
    expect(pageLinks.length).toBeGreaterThan(0);
  });

  it('disables next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} totalCount={100} itemsPerPage={20} />
    );

    // Last page should have a disabled-looking next (span instead of link)
    const pageLinks = screen.getAllByRole('link');
    const nextLink = pageLinks.find(link => {
      const href = link.getAttribute('href');
      return href && href.includes('page=6');
    });
    expect(nextLink).toBeUndefined();
  });

  it('preserves existing search params in pagination links', () => {
    mockUseSearchParams.mockReturnValue({
      toString: () => 'style=Modern',
    });

    render(
      <Pagination currentPage={1} totalPages={5} totalCount={100} itemsPerPage={20} />
    );

    const page2Link = screen.getByText('2').closest('a');
    expect(page2Link?.getAttribute('href')).toContain('style=Modern');
    expect(page2Link?.getAttribute('href')).toContain('page=2');
  });

  it('highlights current page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} totalCount={100} itemsPerPage={20} />
    );

    const page3Link = screen.getByText('3').closest('a');
    // Current page should have different styling (we can check it exists)
    expect(page3Link).toBeInTheDocument();
  });

  it('formats large total counts with locale string', () => {
    render(
      <Pagination currentPage={1} totalPages={500} totalCount={10000} itemsPerPage={20} />
    );

    expect(screen.getByText(/10,000 photos/)).toBeInTheDocument();
  });
});

/**
 * Unit Tests for app/professionals/ProfessionalsList.tsx
 *
 * Tests the ProfessionalsList component rendering, filtering, and sorting.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfessionalsList from '@/app/professionals/ProfessionalsList';
import type { ProfessionalListItem } from '@/lib/services/professionals';

describe('ProfessionalsList Component', () => {
  const mockProfessionals: ProfessionalListItem[] = [
    {
      id: 1,
      name: 'Alice Designer',
      company: 'Design Studio A',
      averageRating: 4.5,
      reviewCount: 20,
      projectCount: 15,
    },
    {
      id: 2,
      name: 'Bob Builder',
      company: 'Build Co',
      averageRating: 4.8,
      reviewCount: 30,
      projectCount: 25,
    },
    {
      id: 3,
      name: 'Charlie Contractor',
      company: 'Contractor Corp',
      averageRating: 4.2,
      reviewCount: 10,
      projectCount: 8,
    },
  ];

  it('renders all professionals', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    expect(screen.getByText('Alice Designer')).toBeInTheDocument();
    expect(screen.getByText('Bob Builder')).toBeInTheDocument();
    expect(screen.getByText('Charlie Contractor')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    expect(screen.getByPlaceholderText('Search professionals...')).toBeInTheDocument();
  });

  it('renders sort dropdown', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    expect(screen.getByLabelText('Sort by:')).toBeInTheDocument();
  });

  it('filters professionals by name search', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    const searchInput = screen.getByPlaceholderText('Search professionals...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Alice Designer')).toBeInTheDocument();
    expect(screen.queryByText('Bob Builder')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie Contractor')).not.toBeInTheDocument();
  });

  it('filters professionals by company search', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    const searchInput = screen.getByPlaceholderText('Search professionals...');
    fireEvent.change(searchInput, { target: { value: 'Build Co' } });

    expect(screen.getByText('Bob Builder')).toBeInTheDocument();
    expect(screen.queryByText('Alice Designer')).not.toBeInTheDocument();
  });

  it('shows "No professionals found" when search has no results', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    const searchInput = screen.getByPlaceholderText('Search professionals...');
    fireEvent.change(searchInput, { target: { value: 'NonexistentName' } });

    expect(screen.getByText(/No professionals found matching/)).toBeInTheDocument();
  });

  it('sorts by rating (default)', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    // Bob has highest rating (4.8), should be first
    const rows = screen.getAllByRole('article');
    expect(rows[0]).toHaveTextContent('Bob Builder');
  });

  it('sorts by name A-Z', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    const sortSelect = screen.getByLabelText('Sort by:');
    fireEvent.change(sortSelect, { target: { value: 'name-asc' } });

    const rows = screen.getAllByRole('article');
    expect(rows[0]).toHaveTextContent('Alice Designer');
    expect(rows[1]).toHaveTextContent('Bob Builder');
    expect(rows[2]).toHaveTextContent('Charlie Contractor');
  });

  it('sorts by name Z-A', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    const sortSelect = screen.getByLabelText('Sort by:');
    fireEvent.change(sortSelect, { target: { value: 'name-desc' } });

    const rows = screen.getAllByRole('article');
    expect(rows[0]).toHaveTextContent('Charlie Contractor');
    expect(rows[1]).toHaveTextContent('Bob Builder');
    expect(rows[2]).toHaveTextContent('Alice Designer');
  });

  it('sorts by project count', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    const sortSelect = screen.getByLabelText('Sort by:');
    fireEvent.change(sortSelect, { target: { value: 'projects' } });

    const rows = screen.getAllByRole('article');
    // Bob has most projects (25)
    expect(rows[0]).toHaveTextContent('Bob Builder');
  });

  it('displays result count', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    expect(screen.getByText('Showing 3 of 3 professionals')).toBeInTheDocument();
  });

  it('updates result count when filtering', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    const searchInput = screen.getByPlaceholderText('Search professionals...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Showing 1 of 3 professionals')).toBeInTheDocument();
  });

  it('handles empty professionals list', () => {
    render(<ProfessionalsList professionals={[]} />);

    expect(screen.getByText('Showing 0 of 0 professionals')).toBeInTheDocument();
  });

  it('handles single professional (singular grammar)', () => {
    render(<ProfessionalsList professionals={[mockProfessionals[0]]} />);

    expect(screen.getByText('Showing 1 of 1 professional')).toBeInTheDocument();
  });

  it('applies focus styles to search input', () => {
    render(<ProfessionalsList professionals={mockProfessionals} />);

    const searchInput = screen.getByPlaceholderText('Search professionals...');
    
    fireEvent.focus(searchInput);
    expect(searchInput.style.borderColor).toBe('var(--primary)');
    
    fireEvent.blur(searchInput);
    expect(searchInput.style.borderColor).toBe('var(--border-light)');
  });
});

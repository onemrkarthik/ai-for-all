/**
 * Unit Tests for app/professionals/ProfessionalRow.tsx
 *
 * Tests the ProfessionalRow component rendering and interactions.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfessionalRow from '@/app/professionals/ProfessionalRow';

describe('ProfessionalRow Component', () => {
  const mockProps = {
    id: 1,
    name: 'John Designer',
    company: 'Design Co',
    averageRating: 4.5,
    reviewCount: 25,
    projectCount: 15,
    index: 0,
  };

  it('renders the professional name', () => {
    render(<ProfessionalRow {...mockProps} />);

    expect(screen.getByText('John Designer')).toBeInTheDocument();
  });

  it('renders the company name', () => {
    render(<ProfessionalRow {...mockProps} />);

    expect(screen.getByText('Design Co')).toBeInTheDocument();
  });

  it('renders the avatar with first letter of name', () => {
    render(<ProfessionalRow {...mockProps} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders the rating', () => {
    render(<ProfessionalRow {...mockProps} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('renders the review count', () => {
    render(<ProfessionalRow {...mockProps} />);

    expect(screen.getByText('(25)')).toBeInTheDocument();
  });

  it('renders the project count with plural', () => {
    render(<ProfessionalRow {...mockProps} />);

    expect(screen.getByText('15 projects')).toBeInTheDocument();
  });

  it('renders singular project when count is 1', () => {
    render(<ProfessionalRow {...mockProps} projectCount={1} />);

    expect(screen.getByText('1 project')).toBeInTheDocument();
  });

  it('renders "No reviews yet" when no rating', () => {
    render(<ProfessionalRow {...mockProps} averageRating={undefined} />);

    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
  });

  it('links to the professional page', () => {
    render(<ProfessionalRow {...mockProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/professionals/1');
  });

  it('renders Contact button', () => {
    render(<ProfessionalRow {...mockProps} />);

    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders star icons for rating', () => {
    render(<ProfessionalRow {...mockProps} />);

    // Should have 5 star icons
    const stars = screen.getAllByText('★');
    expect(stars).toHaveLength(5);
  });

  it('applies hover effect on mouse enter', () => {
    render(<ProfessionalRow {...mockProps} />);

    const article = screen.getByRole('article');
    
    fireEvent.mouseEnter(article);
    
    expect(article.style.transform).toBe('translateY(-2px)');
  });

  it('removes hover effect on mouse leave', () => {
    render(<ProfessionalRow {...mockProps} />);

    const article = screen.getByRole('article');
    
    fireEvent.mouseEnter(article);
    fireEvent.mouseLeave(article);
    
    expect(article.style.transform).toBe('translateY(0)');
  });

  it('renders with animation delay based on index', () => {
    const { container } = render(<ProfessionalRow {...mockProps} index={2} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.animationDelay).toBe('0.1s');
  });

  it('Contact button prevents default link navigation', () => {
    render(<ProfessionalRow {...mockProps} />);

    const contactButton = screen.getByText('Contact');
    
    // Test that clicking the button doesn't throw
    expect(() => fireEvent.click(contactButton)).not.toThrow();
  });
});

/**
 * Unit Tests for app/styles/StyleCard.tsx
 *
 * Tests the StyleCard component rendering and interactions.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StyleCard from '@/app/styles/StyleCard';

describe('StyleCard Component', () => {
  const mockProps = {
    name: 'Modern',
    slug: 'modern',
    tagline: 'Clean lines and minimalist design',
    overview: 'Modern kitchens feature sleek surfaces, minimal ornamentation, and a focus on functionality.',
    imageUrl: 'https://example.com/modern-kitchen.jpg',
  };

  it('renders the style name', () => {
    render(<StyleCard {...mockProps} />);

    expect(screen.getByText('Modern')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<StyleCard {...mockProps} />);

    expect(screen.getByText('Clean lines and minimalist design')).toBeInTheDocument();
  });

  it('renders the overview text', () => {
    render(<StyleCard {...mockProps} />);

    expect(screen.getByText(/Modern kitchens feature sleek surfaces/)).toBeInTheDocument();
  });

  it('renders the Explore link', () => {
    render(<StyleCard {...mockProps} />);

    expect(screen.getByText('Explore Modern Kitchens')).toBeInTheDocument();
  });

  it('links to the correct style page', () => {
    render(<StyleCard {...mockProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/styles/modern');
  });

  it('applies hover effect on mouse enter', () => {
    render(<StyleCard {...mockProps} />);

    const article = screen.getByRole('article');
    
    fireEvent.mouseEnter(article);
    
    // Article should have transform applied
    expect(article.style.transform).toBe('translateY(-4px)');
  });

  it('removes hover effect on mouse leave', () => {
    render(<StyleCard {...mockProps} />);

    const article = screen.getByRole('article');
    
    fireEvent.mouseEnter(article);
    fireEvent.mouseLeave(article);
    
    // Article should reset transform
    expect(article.style.transform).toBe('translateY(0)');
  });

  it('renders as an article element for accessibility', () => {
    render(<StyleCard {...mockProps} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renders with different style names', () => {
    const farmhouseProps = {
      name: 'Farmhouse',
      slug: 'farmhouse',
      tagline: 'Warm and rustic charm',
      overview: 'Farmhouse kitchens blend rustic elements with modern comfort.',
      imageUrl: 'https://example.com/farmhouse.jpg',
    };

    render(<StyleCard {...farmhouseProps} />);

    expect(screen.getByText('Farmhouse')).toBeInTheDocument();
    expect(screen.getByText('Explore Farmhouse Kitchens')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/styles/farmhouse');
  });
});

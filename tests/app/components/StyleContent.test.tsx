/**
 * Unit Tests for app/styles/[style]/StyleContent.tsx
 *
 * Tests the StyleContent component rendering.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import StyleContent from '@/app/styles/[style]/StyleContent';
import type { StyleGuide } from '@/lib/data/style-guides';

describe('StyleContent Component', () => {
  const mockGuide: StyleGuide = {
    slug: 'modern',
    name: 'Modern',
    tagline: 'Clean lines and minimalist design',
    overview: 'Modern kitchens feature sleek surfaces.',
    heroImage: 'https://example.com/modern.jpg',
    facets: {
      layout: {
        title: 'Layout',
        description: 'Modern kitchens favor open layouts.',
        tips: ['Use open floor plans', 'Maximize natural light', 'Create work triangles'],
      },
      cabinetFinish: {
        title: 'Cabinet Finish',
        description: 'Flat panel cabinets are essential.',
        tips: ['Choose handleless designs', 'Use high-gloss finishes', 'Consider two-tone options'],
      },
      countertop: {
        title: 'Countertops',
        description: 'Quartz and composite surfaces work well.',
        tips: ['Select seamless materials', 'Use waterfall edges', 'Choose neutral colors'],
      },
      backsplash: {
        title: 'Backsplash',
        description: 'Large format tiles create clean lines.',
        tips: ['Use oversized tiles', 'Match countertop colors', 'Consider glass panels'],
      },
      flooring: {
        title: 'Flooring',
        description: 'Wide plank flooring adds warmth.',
        tips: ['Use wide planks', 'Choose matte finishes', 'Consider polished concrete'],
      },
      appliances: {
        title: 'Appliances',
        description: 'Integrated appliances maintain clean lines.',
        tips: ['Choose panel-ready appliances', 'Hide small appliances', 'Use induction cooktops'],
      },
      colorPalette: {
        title: 'Color Palette',
        description: 'Neutral tones with bold accents.',
        tips: ['Use white or gray base', 'Add black accents', 'Include natural wood tones'],
      },
      lighting: {
        title: 'Lighting',
        description: 'Statement pendant lights are key.',
        tips: ['Install linear pendants', 'Use recessed lighting', 'Add under-cabinet LEDs'],
      },
    },
  };

  it('renders the guide name in section header', () => {
    render(<StyleContent guide={mockGuide} />);

    expect(screen.getByText('Planning Your Modern Kitchen')).toBeInTheDocument();
  });

  it('renders the guide description', () => {
    render(<StyleContent guide={mockGuide} />);

    expect(screen.getByText(/comprehensive guide to every element of modern kitchen design/)).toBeInTheDocument();
  });

  it('renders all facet sections', () => {
    render(<StyleContent guide={mockGuide} />);

    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByText('Cabinet Finish')).toBeInTheDocument();
    expect(screen.getByText('Countertops')).toBeInTheDocument();
    expect(screen.getByText('Backsplash')).toBeInTheDocument();
    expect(screen.getByText('Flooring')).toBeInTheDocument();
    expect(screen.getByText('Appliances')).toBeInTheDocument();
    expect(screen.getByText('Color Palette')).toBeInTheDocument();
    expect(screen.getByText('Lighting')).toBeInTheDocument();
  });

  it('renders facet descriptions', () => {
    render(<StyleContent guide={mockGuide} />);

    expect(screen.getByText('Modern kitchens favor open layouts.')).toBeInTheDocument();
    expect(screen.getByText('Flat panel cabinets are essential.')).toBeInTheDocument();
  });

  it('renders Expert Tips headers', () => {
    render(<StyleContent guide={mockGuide} />);

    // Should have 8 "Expert Tips" headers (one for each facet)
    const expertTipsHeaders = screen.getAllByText('Expert Tips');
    expect(expertTipsHeaders).toHaveLength(8);
  });

  it('renders tips for each facet', () => {
    render(<StyleContent guide={mockGuide} />);

    expect(screen.getByText('Use open floor plans')).toBeInTheDocument();
    expect(screen.getByText('Choose handleless designs')).toBeInTheDocument();
    expect(screen.getByText('Install linear pendants')).toBeInTheDocument();
  });

  it('renders numbered tip indicators', () => {
    render(<StyleContent guide={mockGuide} />);

    // Each facet has 3 tips, so there should be multiple "1", "2", "3" indicators
    const ones = screen.getAllByText('1');
    const twos = screen.getAllByText('2');
    const threes = screen.getAllByText('3');

    expect(ones.length).toBe(8); // 8 facets
    expect(twos.length).toBe(8);
    expect(threes.length).toBe(8);
  });

  it('renders as an article element', () => {
    render(<StyleContent guide={mockGuide} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});

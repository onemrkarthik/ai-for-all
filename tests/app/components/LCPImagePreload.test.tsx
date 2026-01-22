/**
 * Unit Tests for app/components/LCPImagePreload.tsx
 *
 * Tests the LCP image preload component for performance optimization.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { LCPImagePreload } from '@/app/components/LCPImagePreload';

describe('LCPImagePreload Component', () => {
  it('renders with correct attributes', () => {
    render(<LCPImagePreload src="https://example.com/image.jpg" />);

    const link = document.querySelector('link[rel="preload"]');
    
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('rel', 'preload');
    expect(link).toHaveAttribute('as', 'image');
    expect(link).toHaveAttribute('href', 'https://example.com/image.jpg');
    expect(link).toHaveAttribute('fetchpriority', 'high');
    expect(link).toHaveAttribute('type', 'image/jpeg');
  });

  it('uses custom type prop', () => {
    render(<LCPImagePreload src="https://example.com/image.webp" type="image/webp" />);

    const link = document.querySelector('link[href="https://example.com/image.webp"]');
    expect(link).toHaveAttribute('type', 'image/webp');
  });

  it('renders with different image URLs', () => {
    const { rerender } = render(<LCPImagePreload src="https://images.unsplash.com/photo-123" />);
    
    let link = document.querySelector('link[href="https://images.unsplash.com/photo-123"]');
    expect(link).not.toBeNull();

    rerender(<LCPImagePreload src="https://loremflickr.com/640/480" />);
    link = document.querySelector('link[href="https://loremflickr.com/640/480"]');
    expect(link).not.toBeNull();
  });
});

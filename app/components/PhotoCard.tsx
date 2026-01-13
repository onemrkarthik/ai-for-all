/**
 * PhotoCard - Individual Photo Display Component
 *
 * This file implements a clickable photo card that displays a photo thumbnail
 * with its title and source information. Each card has a staggered fade-in
 * animation for visual appeal.
 *
 * Key Features:
 * - Optimized image loading using Next.js Image component
 * - Staggered fade-in animations based on card index
 * - Glass-morphism styling for modern appearance
 * - Responsive image sizing with proper aspect ratio handling
 * - Click handler to open photo in modal view
 *
 * Performance Considerations:
 * - Uses Next.js Image for automatic optimization and lazy loading
 * - Responsive sizes attribute ensures appropriate image size for viewport
 * - CSS animations use GPU-accelerated properties
 */

'use client';

import Image from 'next/image';
import { Item } from '@/lib/data';

/**
 * Props for the PhotoCard component
 */
interface PhotoCardProps {
    /** The photo data to display */
    item: Item;

    /** Index within the batch (used for staggered animation timing) */
    index: number;

    /** Priority loading for LCP images (default: false) */
    priority?: boolean;
    
    /** Click handler - receives the photo item directly */
    onClick?: (item: Item) => void;
}

/**
 * PhotoCard Component
 */
export function PhotoCard({ item, index, priority = false, onClick }: PhotoCardProps) {
    const handleClick = () => {
        console.log('[PhotoCard] Clicked:', { index, photoId: item.id, title: item.title });
        if (onClick) {
            onClick(item);
        }
    };
    
    return (
        <div
            data-local-index={index}
            data-photo-id={item.id}
            className="glass"
            onClick={handleClick}
            style={{
                borderRadius: '3px',
                overflow: 'hidden',
                animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                animationFillMode: 'both',
                animationDelay: `${index * 0.05}s`,
                cursor: 'pointer',
            }}
        >
            {/* Image container with fixed aspect ratio */}
            <div className="card-image-container">
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    priority={priority}
                    fetchPriority={priority ? "high" : "auto"}
                    // Responsive sizes optimized for our specific grid:
                    // - < 600px: 2 cols (Forced 2-col grid) -> 50vw (CRITICAL FIX for mweb LCP)
                    // - 600-950px: 1 col (Natural grid minmax 465px) -> 100vw
                    // - 950-1400px: 2 cols -> 50vw
                    // - > 1400px: 3+ cols -> 33vw
                    sizes="(max-width: 600px) 50vw, (max-width: 950px) 100vw, (max-width: 1400px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                />
            </div>

            {/* Photo metadata */}
            <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                <h4 style={{
                    fontSize: '1rem',
                    color: 'var(--foreground-dark)',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    letterSpacing: '-0.01em',
                }}>
                    {item.title}
                </h4>
                <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    fontWeight: 500,
                }}>
                    {item.source}
                </div>
            </div>
        </div>
    );
}

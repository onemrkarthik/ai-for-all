/**
 * PhotoBatchClient - Client-Side Photo Batch Renderer
 *
 * This file implements the client-side component responsible for rendering a batch
 * of photos and registering them with the global photo gallery context. It handles
 * the conversion between local batch indices and global gallery indices.
 *
 * Key Features:
 * - Registers photos with global gallery on mount
 * - Manages local-to-global index mapping for navigation
 * - Displays batch metadata (range, latency, SSR indicator)
 * - Renders photos in a responsive grid layout
 *
 * Architecture:
 * This is the client component counterpart to PhotoBatch. It receives pre-fetched
 * data from the server component and handles all client-side interactions including
 * photo clicks and gallery integration.
 */

'use client';

import React, { useEffect } from 'react';
import { Item } from '@/lib/data';
import { PhotoCard } from './PhotoCard';
import { ProCTACard } from './ProCTACard';
import { usePhotoGalleryActions } from './PhotoGallery';

/**
 * Props for the PhotoBatchClient component
 */
interface PhotoBatchClientProps {
    /** Array of photo items to display in this batch */
    data: Item[];

    /** Starting index of this batch in the global photo collection */
    offset: number;

    /** Number of photos in this batch */
    limit: number;

    /** Whether this batch was server-rendered (true) or streamed (false/undefined) */
    initialData?: boolean;

    /** Simulated network latency in milliseconds (displayed for demo purposes) */
    delay: number;

    /** Whether to show the Pro CTA card in this batch (after 3rd photo) */
    showCTACard?: boolean;
}

/**
 * PhotoBatchClient Component
 *
 * Renders a batch of photos in a grid layout and integrates them with the global
 * photo gallery. Each photo is registered with its correct global index to enable
 * seamless navigation across batches.
 *
 * Index Management:
 * - Local index: Position within this batch (0 to limit-1)
 * - Global index: Position in the overall collection (offset + localIndex)
 *
 * @param props - Batch data, offset, limit, and rendering metadata
 * @returns A grid of photo cards with batch information header
 *
 * @example
 * <PhotoBatchClient
 *   data={photos}
 *   offset={20}
 *   limit={20}
 *   delay={2000}
 *   initialData={false}
 * />
 */
export function PhotoBatchClient({ data, offset, limit: _limit, initialData, delay: _delay, showCTACard = false }: PhotoBatchClientProps) {
    // Optimization: Use actions-only hook to avoid re-rendering when 'photos' state changes
    const { registerPhotos, openPhoto } = usePhotoGalleryActions();

    /**
     * Register this batch's photos with the global gallery
     * 
     * OPTIMIZATION: Wrapped in setTimeout to defer this work until after
     * the critical painting/hydration phase. This yields to the main thread,
     * significantly reducing Total Blocking Time (TBT).
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            registerPhotos(data, offset);
        }, 0);
        return () => clearTimeout(timer);
    }, [data, offset, registerPhotos]);

    /**
     * Handle photo click - directly called from PhotoCard
     * 
     * FIX: Changed from event delegation to direct callback to avoid
     * potential issues with display:contents and event bubbling.
     * The photo is passed directly from the card, guaranteeing correctness.
     */
    const handlePhotoClick = (photo: Item, localIndex: number) => {
        const globalIndex = offset + localIndex;
        openPhoto(photo, globalIndex);
    };

    return (
        <div
            className="batch-container"
            style={{ display: 'contents' }}
        >
            {data.map((item, localIndex) => (
                <React.Fragment key={item.id}>
                    {/* Insert CTA card after 3rd photo (index 3) */}
                    {showCTACard && localIndex === 3 && <ProCTACard />}
                    <PhotoCard
                        item={item}
                        index={localIndex}
                        // Prioritize loading for the first 4 images of the first batch (LCP optimization)
                        priority={initialData && localIndex < 4}
                        // Direct onClick - bypasses event delegation for reliability
                        onClick={(photo) => handlePhotoClick(photo, localIndex)}
                    />
                </React.Fragment>
            ))}
        </div>
    );
}

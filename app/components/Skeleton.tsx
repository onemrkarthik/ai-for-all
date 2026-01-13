/**
 * Skeleton - Loading Placeholder Component
 *
 * This file implements a skeleton loader component that displays animated placeholder
 * cards while photo batches are being fetched. It provides visual feedback during
 * the streaming/loading process to improve perceived performance.
 *
 * Key Features:
 * - Configurable number of skeleton cards
 * - Shimmer animation effect for visual feedback
 * - Matches the layout and dimensions of actual PhotoCard components
 * - CSS-based animations for performance (GPU accelerated)
 *
 * Design Considerations:
 * - Skeleton dimensions match PhotoCard for seamless transition
 * - Reduced opacity (0.6) to indicate loading state
 * - Shimmer animation runs continuously until real content loads
 * - Uses same grid layout as PhotoBatchClient for consistency
 *
 * Usage:
 * Typically used as a Suspense fallback while PhotoBatch components stream in.
 */

/**
 * Props for the Skeleton component
 */
interface SkeletonProps {
    /** Number of skeleton cards to display (default: 4) */
    count?: number;
}

/**
 * Skeleton Component
 *
 * Renders placeholder cards with a shimmer animation to indicate loading content.
 * The skeleton maintains the same grid layout and card dimensions as the actual
 * photo batch to prevent layout shift when content loads.
 *
 * Animation:
 * - Continuous shimmer effect using CSS keyframe animation
 * - 1.5s animation loop with linear timing
 * - Skewed gradient overlay creates the shimmer illusion
 *
 * @param props - Configuration for number of cards to display
 * @returns A grid of animated skeleton cards
 *
 * @example
 * // As a Suspense fallback
 * <Suspense fallback={<Skeleton count={6} />}>
 *   <PhotoBatch {...props} />
 * </Suspense>
 */
export function Skeleton({ count = 4 }: SkeletonProps) {
    return (
        <div style={{ display: 'contents' }}>
            {/* Generate skeleton cards based on count - they become direct grid items */}
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-card" style={{
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: 0.6 // Reduced opacity indicates loading state
                }}>
                    {/* Shimmer effect overlay - animated gradient sweep */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                        animation: 'shim 1.5s infinite linear',
                        transform: 'skewX(-20deg)', // Diagonal sweep effect
                        zIndex: 10
                    }} />

                    {/* Image placeholder - matches PhotoCard image container */}
                    <div className="card-image-container" style={{
                        background: '#f5f5f5',
                        borderBottom: '1px solid #efefef'
                    }}></div>

                    {/* Text placeholders - simulates title and source */}
                    <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                        {/* Title placeholder */}
                        <div style={{
                            width: '75%',
                            height: '16px',
                            background: '#efefef',
                            borderRadius: '4px',
                            marginBottom: '0.5rem'
                        }}></div>
                        {/* Source placeholder */}
                        <div style={{
                            width: '50%',
                            height: '14px',
                            background: '#f5f5f5',
                            borderRadius: '4px'
                        }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

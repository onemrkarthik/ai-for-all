/**
 * PhotoBatch - Server Component for Photo Data Fetching
 *
 * This file implements a server-side component responsible for fetching photo data
 * and passing it to the client-side rendering component. It supports both immediate
 * server-side rendering (SSR) and streaming scenarios.
 *
 * Key Features:
 * - Server Component that can be used with React Suspense for streaming
 * - Supports pre-fetched data (SSR) or on-demand fetching (streaming)
 * - Delegates rendering to a client component (PhotoBatchClient)
 *
 * Architecture:
 * This component follows the Next.js App Router pattern of separating server and
 * client components. The server component handles data fetching, while the client
 * component handles interactivity and UI rendering.
 */

import { fetchLiveStreamData, Item } from '@/lib/data';
import { PhotoBatchClient } from './PhotoBatchClient';

/**
 * Props for the PhotoBatch server component
 */
interface PhotoBatchProps {
    /** Unique identifier for this batch (used as a React key) */
    batchId: number;

    /** Starting index in the overall photo collection */
    offset: number;

    /** Number of photos to fetch in this batch */
    limit: number;

    /** Simulated network latency in milliseconds (for demo purposes) */
    delay: number;

    /** Optional pre-fetched data for SSR scenarios */
    initialData?: Item[];

    /** Whether to show the Pro CTA card in this batch */
    showCTACard?: boolean;
}

/**
 * PhotoBatch Server Component
 *
 * Fetches a batch of photos from the data source and renders them using the
 * PhotoBatchClient component. This component can be wrapped in Suspense to
 * enable progressive streaming of content.
 *
 * @param props - Configuration for the batch including offset, limit, and optional initial data
 * @returns A PhotoBatchClient component with the fetched or provided data
 *
 * @example
 * // Server-side rendered batch (no Suspense needed)
 * const data = await fetchLiveStreamData(0, 20, 500);
 * <PhotoBatch batchId={1} offset={0} limit={20} delay={500} initialData={data} />
 *
 * @example
 * // Streaming batch (wrap in Suspense)
 * <Suspense fallback={<Skeleton />}>
 *   <PhotoBatch batchId={2} offset={20} limit={20} delay={2000} />
 * </Suspense>
 */
export async function PhotoBatch({ batchId, offset, limit, delay, initialData, showCTACard = false }: PhotoBatchProps) {
    // Use pre-fetched data if available (SSR), otherwise fetch on-demand (streaming)
    const data = initialData || await fetchLiveStreamData(offset, limit, delay);

    return (
        <PhotoBatchClient
            data={data}
            offset={offset}
            limit={limit}
            delay={delay}
            initialData={!!initialData}
            showCTACard={showCTACard}
        />
    );
}

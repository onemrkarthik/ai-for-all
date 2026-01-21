/**
 * Topic Photos Page - Photo Gallery by Topic with React Streaming
 *
 * This file implements the topic-based photo gallery with Houzz-style URLs.
 * URL Format: /photos/:topicName-phbr0-bp~t_:topicId
 * Example: /photos/kitchen-ideas-and-designs-phbr0-bp~t_709
 *
 * Server-Side Streaming Architecture:
 * - First batch (20 photos): SSR'd immediately for fast initial paint
 * - Subsequent batches: Stream progressively with React Suspense
 * - Each streaming batch shows skeleton loaders while loading
 * - Total of 100 photos per page, split into 5 batches of 20
 *
 * SEO Optimization:
 * - First 20 photos are in initial HTML for search engine indexing
 * - JSON-LD structured data for rich search results
 * - Semantic HTML structure
 * - Dynamic metadata based on topic
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PhotoBatch } from '@/app/components/PhotoBatch';
import { Skeleton } from '@/app/components/Skeleton';
import { fetchPaginatedPhotos, fetchLiveStreamData } from '@/lib/data';
import { PhotoGalleryProvider } from '@/app/components/PhotoGallery';
import { FilteredGallery } from '@/app/components/FilteredGallery';
import { Pagination } from '@/app/components/Pagination';
import { GalleryPageController } from '@/app/components/GalleryPageController';
import { parseTopicSlug, getTopicDisplayName } from '@/lib/utils/slug';

const ITEMS_PER_PAGE = 100;
const BATCH_SIZE = 20; // Photos per streaming batch

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topicInfo = parseTopicSlug(slug);

  if (!topicInfo) {
    return {
      title: 'Photos Not Found',
    };
  }

  const displayName = getTopicDisplayName(topicInfo.name);

  return {
    title: `${displayName} | Photos, Ideas & Designs`,
    description: `Browse ${displayName.toLowerCase()} with professional portfolios, ratings, and inspiration for your home.`,
  };
}

/**
 * Topic Photos Page Component with React Streaming
 *
 * Main page component that displays a paginated photo gallery for a specific topic.
 * Uses React Server Components with Suspense for progressive streaming:
 * 
 * Streaming Strategy:
 * - Batch 1 (photos 1-20): SSR immediately - Critical content for LCP
 * - Batch 2 (photos 21-40): Streams after 500ms delay
 * - Batch 3 (photos 41-60): Streams after 1000ms delay
 * - Batch 4 (photos 61-80): Streams after 1500ms delay
 * - Batch 5 (photos 81-100): Streams after 2000ms delay
 *
 * @param params - Route parameters containing the topic slug
 * @param searchParams - Query parameters including page number
 * @returns The complete photos page with streaming photo batches
 */
export default async function TopicPhotosPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const topicInfo = parseTopicSlug(slug);

  // If slug is invalid, show 404
  if (!topicInfo) {
    notFound();
  }

  // Parse page number, default to 1
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10));

  const displayName = getTopicDisplayName(topicInfo.name);

  // Fetch only the first batch for immediate SSR (fast initial paint)
  const baseOffset = (currentPage - 1) * ITEMS_PER_PAGE;
  const firstBatchData = await fetchLiveStreamData(baseOffset, BATCH_SIZE, 0);
  
  // Get total count for pagination
  const { totalCount, totalPages } = await fetchPaginatedPhotos(currentPage, ITEMS_PER_PAGE);

  // If page is out of range, show 404
  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }

  /**
   * Configuration for streaming batches (batches 2-5)
   * Each batch streams in progressively with increasing delays
   */
  const streamingBatches = [
    { id: 2, offset: baseOffset + 20, delay: 500 },
    { id: 3, offset: baseOffset + 40, delay: 1000 },
    { id: 4, offset: baseOffset + 60, delay: 1500 },
    { id: 5, offset: baseOffset + 80, delay: 2000 },
  ];

  /**
   * JSON-LD structured data for SEO
   * Only includes first batch images (which are in initial HTML)
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": `${displayName} Gallery`,
    "description": `Browse ${displayName.toLowerCase()} with professional portfolios and inspiration.`,
    "image": firstBatchData.map(item => item.image)
  };

  return (
    <PhotoGalleryProvider>
      {/* Controller to handle loading more photos in modal */}
      <GalleryPageController
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        totalPages={totalPages}
      />

      {/* Inject JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main style={{ minHeight: '100vh', background: 'white' }}>
        {/* Page Header - Simple Title */}
        <header style={{
          padding: '1.5rem 24px 1rem',
        }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: 'var(--foreground-dark)',
            margin: 0,
          }}>
            {displayName}
          </h1>
        </header>

        {/* Filter Bar and Content Area */}
        <FilteredGallery totalCount={totalCount} currentPage={currentPage}>
          {/* Main Content Area */}
          <section style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
            {/* Photo Grid Container - Single grid for all batches */}
            <div className="container photo-grid">
              
              {/*
                Batch 1: Server-Side Rendered (No Suspense)
                
                This batch is fetched on the server before rendering begins.
                Benefits:
                - Immediate content for users (fast LCP)
                - SEO-friendly (in initial HTML)
                - Fast First Contentful Paint
              */}
              <PhotoBatch
                batchId={1}
                offset={baseOffset}
                limit={BATCH_SIZE}
                delay={0}
                initialData={firstBatchData}
                showCTACard={currentPage === 1}
              />

              {/*
                Batches 2-5: Streaming with Suspense
                
                These batches stream in progressively as they become available.
                Each Suspense boundary:
                - Shows skeleton loaders immediately
                - Streams in content when ready
                - Doesn't block other batches
                
                This creates a progressive loading experience where content
                appears in waves, maintaining interactivity throughout.
              */}
              {streamingBatches.map((batch) => (
                <Suspense key={batch.id} fallback={<Skeleton count={BATCH_SIZE} />}>
                  <PhotoBatch
                    batchId={batch.id}
                    offset={batch.offset}
                    limit={BATCH_SIZE}
                    delay={batch.delay}
                  />
                </Suspense>
              ))}

            </div>

            {/* Pagination */}
            <div className="container">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          </section>
        </FilteredGallery>
      </main>
    </PhotoGalleryProvider>
  );
}

/**
 * Topic Photos Page - Photo Gallery by Topic
 *
 * This file implements the topic-based photo gallery with Houzz-style URLs.
 * URL Format: /photos/:topicName-phbr0-bp~t_:topicId
 * Example: /photos/kitchen-ideas-and-designs-phbr0-bp~t_709
 *
 * It demonstrates Next.js App Router's streaming capabilities using React Suspense
 * to progressively load content batches.
 *
 * Key Architecture:
 * - First batch (0-20): Server-side rendered for SEO and initial paint
 * - Subsequent batches (21-100): Streamed progressively with Suspense boundaries
 * - Each batch has configurable latency to simulate real-world API delays
 *
 * Performance Strategy:
 * 1. Critical content (first 20 photos) rendered immediately on server
 * 2. Remaining content streams in as it becomes available
 * 3. Skeleton loaders provide immediate visual feedback
 * 4. Photos register with global gallery context for modal navigation
 *
 * SEO Optimization:
 * - First batch is SSR for search engine indexing
 * - JSON-LD structured data for rich search results
 * - Semantic HTML structure
 * - Dynamic metadata based on topic
 *
 * User Experience:
 * - Content appears progressively (no blocking on full dataset)
 * - Interactive immediately (first batch)
 * - Smooth loading states with skeleton screens
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PhotoBatch } from '@/app/components/PhotoBatch';
import { Skeleton } from '@/app/components/Skeleton';
import { fetchLiveStreamData } from '@/lib/data';
import { PhotoGalleryProvider } from '@/app/components/PhotoGallery';
import { FilteredGallery } from '@/app/components/FilteredGallery';
import { parseTopicSlug, getTopicDisplayName } from '@/lib/utils/slug';

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
 * Topic Photos Page Component
 *
 * Main page component that orchestrates the streaming photo gallery for a specific topic.
 * This is an async Server Component that fetches the first batch of data
 * before rendering, ensuring immediate content availability.
 *
 * Streaming Strategy:
 * - Batch 1 (photos 1-20): SSR with 500ms delay - Critical content
 * - Batch 2 (photos 21-40): Streamed with 2000ms delay
 * - Batch 3 (photos 41-60): Streamed with 3500ms delay
 * - Batch 4 (photos 61-80): Streamed with 5000ms delay
 * - Batch 5 (photos 81-100): Streamed with 6500ms delay
 *
 * The staggered delays simulate real-world API latency and demonstrate
 * progressive content loading.
 *
 * @param params - Route parameters containing the topic slug
 * @returns The complete photos page with navigation, header, and photo batches
 */
export default async function TopicPhotosPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const topicInfo = parseTopicSlug(slug);

  // If slug is invalid, show 404
  if (!topicInfo) {
    notFound();
  }

  const displayName = getTopicDisplayName(topicInfo.name);
  /**
   * Server-side fetch of first batch (blocking)
   *
   * This ensures the initial 20 photos are in the HTML response, providing:
   * - Immediate content for users
   * - SEO-friendly indexable content
   * - Fast First Contentful Paint (FCP)
   */
  const batch1Data = await fetchLiveStreamData(0, 20, 500);

  /**
   * JSON-LD structured data for SEO
   *
   * Provides search engines with structured information about the image gallery.
   * This can enhance search results with rich snippets.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": `${displayName} Gallery`,
    "description": `Browse ${displayName.toLowerCase()} with professional portfolios and inspiration.`,
    "image": batch1Data.map(item => item.image)
  };

  /**
   * Configuration for streaming batches
   *
   * Each batch will be wrapped in Suspense and fetched independently.
   * The delay simulates different API response times.
   */
  const streamingBatches = [
    { id: 2, delay: 2000 },
    { id: 3, delay: 3500 },
    { id: 4, delay: 5000 },
    { id: 5, delay: 6500 },
  ];

  return (
    <PhotoGalleryProvider>
      {/* Inject JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky Navigation Bar - Houzz Style */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid var(--border-light)',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Left side: Logo and navigation links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 500,
              color: 'var(--primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              Design Gallery
            </h2>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9375rem' }}>
              <a href="#" style={{
                color: 'var(--foreground-dark)',
                textDecoration: 'none',
                fontWeight: 600,
                borderBottom: '2px solid var(--primary)',
                paddingBottom: '0.25rem',
                transition: 'color 0.2s ease',
              }}>Photos</a>
              <a href="#" style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}>Discussions</a>
              <a href="#" style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}>Shop</a>
            </div>
          </div>
          {/* Right side: Mode indicator */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
            }}>
              Streaming Mode
            </span>
          </div>
        </div>
      </nav>

      <main style={{ minHeight: '100vh', background: 'var(--background-warm)' }}>
        {/* Page Header - Houzz Style */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid var(--border-light)',
          padding: '3rem 0 2.5rem',
        }}>
          <div className="container">
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.75rem',
              marginBottom: '0.75rem',
              color: 'var(--foreground-dark)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>
              {displayName}
            </h1>
            <p style={{
              fontSize: '1.0625rem',
              color: 'var(--secondary)',
              lineHeight: 1.6,
              maxWidth: '600px',
            }}>
              Browse professional portfolios, photos and get inspiration for your home
            </p>
          </div>
        </header>

        {/* Filter Bar and Content Area */}
        <FilteredGallery>
          {/* Main Content Area - Shown when no filters active */}
          <section style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
            {/* Filter/Sort Controls - Houzz Style */}
            <div className="container" style={{
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                fontSize: '0.9375rem',
                color: 'var(--secondary)',
                fontWeight: 500,
              }}>
                Showing design inspiration photos
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}>Sort by:</span>
                <select style={{
                  padding: '0.625rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '2px',
                  fontSize: '0.9375rem',
                  background: 'white',
                  color: 'var(--foreground-dark)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}>
                  <option>Popular Today</option>
                  <option>Latest Activity</option>
                  <option>All Time Popular</option>
                </select>
              </div>
            </div>

            {/* Photo Grid Container - Single grid for continuous feed */}
            <div className="container photo-grid">

              {/*
            Batch 1: Server Side Rendered (No Suspense)

            This batch is fetched on the server before rendering begins.
            Benefits:
            - Immediate content for users
            - SEO-friendly (in HTML)
            - Fast initial paint
          */}
              <PhotoBatch
                batchId={1}
                offset={0}
                limit={20}
                delay={500}
                initialData={batch1Data}
              />

              {/*
            Batches 2-5: Streaming (Wrapped in Suspense)

            These batches stream in progressively as they become available.
            Each Suspense boundary:
            - Shows a Skeleton loader immediately
            - Streams in content when ready
            - Doesn't block other batches

            This creates a progressive loading experience where content
            appears in waves, maintaining interactivity throughout.
          */}
              {streamingBatches.map((batch, index) => (
                <Suspense key={batch.id} fallback={<Skeleton count={4} />}>
                  <PhotoBatch
                    batchId={batch.id}
                    // Calculate offset: batch 2 starts at 20, batch 3 at 40, etc.
                    offset={(index + 1) * 20}
                    limit={20}
                    delay={batch.delay}
                  />
                </Suspense>
              ))}

            </div>

            {/* End of content indicator */}
            <div className="container" style={{
              textAlign: 'center',
              margin: '3rem auto 0',
              padding: '2.5rem 0',
              borderTop: '1px solid var(--border-light)',
              color: 'var(--text-subtle)',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              End of results
            </div>
          </section>
        </FilteredGallery>
      </main>
    </PhotoGalleryProvider>
  );
}

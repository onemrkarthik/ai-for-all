/**
 * Topic Photos Page - Photo Gallery by Topic
 *
 * This file implements the topic-based photo gallery with Houzz-style URLs.
 * URL Format: /photos/:topicName-phbr0-bp~t_:topicId
 * Example: /photos/kitchen-ideas-and-designs-phbr0-bp~t_709
 *
 * Features pagination with 30 photos per page.
 *
 * SEO Optimization:
 * - All photos on current page are SSR for search engine indexing
 * - JSON-LD structured data for rich search results
 * - Semantic HTML structure
 * - Dynamic metadata based on topic
 */

import { notFound } from 'next/navigation';
import { PhotoBatch } from '@/app/components/PhotoBatch';
import { fetchPaginatedPhotos } from '@/lib/data';
import { PhotoGalleryProvider } from '@/app/components/PhotoGallery';
import { FilteredGallery } from '@/app/components/FilteredGallery';
import { Pagination } from '@/app/components/Pagination';
import { GalleryPageController } from '@/app/components/GalleryPageController';
import { parseTopicSlug, getTopicDisplayName } from '@/lib/utils/slug';

const ITEMS_PER_PAGE = 30;

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
 * Main page component that displays a paginated photo gallery for a specific topic.
 * Shows 30 photos per page with pagination controls.
 *
 * @param params - Route parameters containing the topic slug
 * @param searchParams - Query parameters including page number
 * @returns The complete photos page with navigation, header, photo grid, and pagination
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

  // Fetch paginated photos
  const { photos, totalCount, totalPages } = await fetchPaginatedPhotos(currentPage, ITEMS_PER_PAGE);

  // If page is out of range, show 404
  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }

  /**
   * JSON-LD structured data for SEO
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": `${displayName} Gallery`,
    "description": `Browse ${displayName.toLowerCase()} with professional portfolios and inspiration.`,
    "image": photos.map(item => item.image)
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
          {/* Main Content Area - Shown when no filters active */}
          <section style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
            {/* Photo Grid Container */}
            <div className="container photo-grid">
              <PhotoBatch
                batchId={1}
                offset={(currentPage - 1) * ITEMS_PER_PAGE}
                limit={ITEMS_PER_PAGE}
                delay={0}
                initialData={photos}
                showCTACard={currentPage === 1}
              />
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

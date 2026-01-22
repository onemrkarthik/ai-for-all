# Photos Pages

This directory contains the main photo gallery pages with React Server Components streaming architecture.

## Responsibilities

- Display photo galleries with progressive server-side streaming
- Handle topic-based photo organization and URL routing
- Provide filtering by style, color, and layout
- Support pagination for large photo collections
- Enable photo modal/lightbox functionality
- Generate SEO-optimized metadata and JSON-LD structured data

**Does NOT handle:**
- Photo upload or editing (admin functionality)
- Direct database access (uses service layer)
- Professional profiles (see `/professionals`)

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/photos/[slug]` | `[slug]/page.tsx` | Topic-based photo gallery |

## Key Components

| Component | Purpose |
|-----------|---------|
| `[slug]/page.tsx` | Main topic photos page with streaming batches |
| `PhotoBatch` | Server component that fetches and renders a batch of photos |
| `PhotoBatchClient` | Client component for photo rendering and gallery registration |
| `FilteredGallery` | Wrapper providing filter controls |
| `Pagination` | Page navigation controls |

## Topic Photos Page (`[slug]/page.tsx`)

**Route**: `/photos/:slug`
**Example**: `/photos/kitchen-ideas-and-designs-phbr0-bp~t_709`

### URL Format
```
/photos/:topicName-phbr0-bp~t_:topicId
```

The slug contains:
- `topicName`: Human-readable topic name (e.g., "kitchen-ideas-and-designs")
- `phbr0-bp~t_`: Separator pattern
- `topicId`: Numeric topic ID (e.g., "709")

### Purpose
Main photo gallery page displaying kitchen design photos with progressive server-side streaming for optimal performance.

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | string | "1" | Current page number |
| `style` | string | - | Filter by kitchen style |

### Streaming Architecture

The page uses React Server Components with Suspense for progressive loading:

```
┌─────────────────────────────────────────────────────┐
│ Batch 1 (SSR Immediate) - Photos 1-20               │
│ ✓ In initial HTML for SEO                           │
│ ✓ Fast First Contentful Paint                       │
├─────────────────────────────────────────────────────┤
│ Batch 2 (Stream after 500ms) - Photos 21-40         │
│ [Skeleton] → [Content]                              │
├─────────────────────────────────────────────────────┤
│ Batch 3 (Stream after 1000ms) - Photos 41-60        │
│ [Skeleton] → [Content]                              │
├─────────────────────────────────────────────────────┤
│ Batch 4 (Stream after 1500ms) - Photos 61-80        │
│ [Skeleton] → [Content]                              │
├─────────────────────────────────────────────────────┤
│ Batch 5 (Stream after 2000ms) - Photos 81-100       │
│ [Skeleton] → [Content]                              │
└─────────────────────────────────────────────────────┘
```

### Configuration

```typescript
const ITEMS_PER_PAGE = 100;  // Total photos per page
const BATCH_SIZE = 20;       // Photos per streaming batch
```

### Streaming Batches

| Batch | Photos | Delay | Rendering |
|-------|--------|-------|-----------|
| 1 | 1-20 | 0ms | Server-side rendered (SSR) |
| 2 | 21-40 | 500ms | Streamed with Suspense |
| 3 | 41-60 | 1000ms | Streamed with Suspense |
| 4 | 61-80 | 1500ms | Streamed with Suspense |
| 5 | 81-100 | 2000ms | Streamed with Suspense |

### Code Structure

```typescript
export default async function TopicPhotosPage({ params, searchParams }) {
  // 1. Parse URL parameters
  const topicInfo = parseTopicSlug(slug);

  // 2. Fetch first batch immediately (no delay)
  const firstBatchData = await fetchLiveStreamData(baseOffset, BATCH_SIZE, 0);

  // 3. Get pagination data
  const { totalCount, totalPages } = await fetchPaginatedPhotos(currentPage, ITEMS_PER_PAGE);

  return (
    <PhotoGalleryProvider>
      {/* Batch 1: SSR'd immediately */}
      <PhotoBatch
        batchId={1}
        initialData={firstBatchData}
        showCTACard={currentPage === 1}
      />

      {/* Batches 2-5: Streamed with Suspense */}
      {streamingBatches.map((batch) => (
        <Suspense key={batch.id} fallback={<Skeleton count={BATCH_SIZE} />}>
          <PhotoBatch
            batchId={batch.id}
            offset={batch.offset}
            delay={batch.delay}
          />
        </Suspense>
      ))}

      <Pagination ... />
    </PhotoGalleryProvider>
  );
}
```

### Features

1. **Progressive Loading**
   - First 20 photos render immediately
   - Remaining 80 stream in progressively
   - Skeleton loaders during streaming

2. **Filter Bar** (via `FilteredGallery`)
   - Style filter dropdown
   - Color filter
   - Layout filter
   - Real-time filtering

3. **Pagination** (via `Pagination`)
   - Page numbers with ellipsis
   - Previous/Next buttons
   - Total count display

4. **Photo Modal** (via `PhotoGalleryProvider`)
   - Click photo to open lightbox
   - Navigation between photos
   - Contact professional CTA

5. **Pro CTA Card**
   - Appears on first page only
   - Promotes professional consultation

### Dynamic Metadata

```typescript
export async function generateMetadata({ params }) {
  const topicInfo = parseTopicSlug(slug);
  const displayName = getTopicDisplayName(topicInfo.name);

  return {
    title: `${displayName} | Photos, Ideas & Designs`,
    description: `Browse ${displayName.toLowerCase()} with professional portfolios...`
  };
}
```

### JSON-LD Schema

```json
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Kitchen Ideas and Designs Gallery",
  "description": "Browse kitchen ideas...",
  "image": ["https://...", "https://..."]  // First batch images only
}
```

### Error Handling
- Invalid slug format → `notFound()` (404)
- Page out of range → `notFound()` (404)

### SEO Benefits
- First 20 photos in initial HTML
- JSON-LD structured data
- Semantic HTML structure
- Dynamic meta tags

## Supporting Components

| Component | File | Purpose |
|-----------|------|---------|
| `PhotoBatch` | `components/PhotoBatch.tsx` | Renders a batch of photos |
| `PhotoBatchClient` | `components/PhotoBatchClient.tsx` | Client-side batch with registration |
| `Skeleton` | `components/Skeleton.tsx` | Loading placeholder |
| `FilteredGallery` | `components/FilteredGallery.tsx` | Filter bar wrapper |
| `FilterBar` | `components/FilterBar.tsx` | Filter controls |
| `Pagination` | `components/Pagination.tsx` | Page navigation |
| `GalleryPageController` | `components/GalleryPageController.tsx` | Page state management |
| `PhotoGalleryProvider` | `components/PhotoGallery.tsx` | Gallery context provider |

## Context Providers

**PhotoGalleryProvider** enables:
- Photo modal/lightbox
- Photo navigation
- Photo registration from streaming batches
- Cross-batch photo browsing

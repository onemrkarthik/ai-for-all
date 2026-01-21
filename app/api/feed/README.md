# Feed API

Photo feed endpoint for listing and filtering kitchen design photos.

## Endpoint

```
GET /api/feed
```

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `offset` | number | 0 | Number of items to skip |
| `limit` | number | 20 | Maximum items to return |
| `filters` | JSON string | - | Filter criteria (URL-encoded JSON) |

## Filter Object

When provided, `filters` should be a URL-encoded JSON object:

```typescript
interface PhotoFilters {
  style?: string;      // Kitchen style (Modern, Traditional, etc.)
  color?: string;      // Primary color
  layout?: string;     // Kitchen layout type
  // Additional filter fields as supported
}
```

## Examples

### Basic Pagination

```bash
# Get first 20 photos
GET /api/feed?offset=0&limit=20

# Get second page
GET /api/feed?offset=20&limit=20
```

### With Filters

```bash
# Filter by style
GET /api/feed?offset=0&limit=20&filters=%7B%22style%22%3A%22Modern%22%7D

# Decoded: filters={"style":"Modern"}
```

## Response

### Success (200 OK)

```json
{
  "photos": [
    {
      "id": 1,
      "title": "Modern White Kitchen",
      "image": "https://images.unsplash.com/...",
      "source": "Unsplash",
      "attributes": {
        "style": "Modern",
        "color": "White",
        "layout": "L-shaped"
      }
    }
  ],
  "totalCount": 150,    // Only included when filters applied
  "offset": 0,
  "limit": 20
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `photos` | array | Array of photo objects |
| `totalCount` | number | Total matching photos (only with filters) |
| `offset` | number | Current offset |
| `limit` | number | Current limit |

## Implementation Details

```typescript
// route.ts
import { getPhotos, getFilteredPhotos, getFilteredPhotosCount } from '@/lib/services/photos';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const filtersParam = searchParams.get('filters');

  let filters: PhotoFilters | undefined;
  if (filtersParam) {
    filters = JSON.parse(filtersParam);
  }

  const photos = filters
    ? getFilteredPhotos({ offset, limit, filters })
    : getPhotos({ offset, limit });

  const totalCount = filters ? getFilteredPhotosCount(filters) : undefined;

  return NextResponse.json({ photos, totalCount, offset, limit });
}
```

## Service Layer

The endpoint uses these service functions from `@/lib/services/photos`:

| Function | Description |
|----------|-------------|
| `getPhotos({ offset, limit })` | Get paginated photos |
| `getFilteredPhotos({ offset, limit, filters })` | Get filtered photos |
| `getFilteredPhotosCount(filters)` | Count matching photos |

## Type-Safe Client Usage

```typescript
import { api } from '@/lib/api';

// Basic fetch
const { photos, offset, limit } = await api.feed.list({
  offset: 0,
  limit: 20
});

// With filters
const { photos, totalCount } = await api.feed.list({
  offset: 0,
  limit: 20,
  filters: { style: 'Modern' }
});
```

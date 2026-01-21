# Photos API

Endpoint for retrieving individual photo details by ID.

## Endpoint

```
GET /api/photos/[id]
```

## URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Photo's numeric ID |

## Examples

```bash
# Get photo with ID 123
GET /api/photos/123

# Get photo with ID 1
GET /api/photos/1
```

## Response

### Success (200 OK)

```json
{
  "id": 123,
  "title": "Modern White Kitchen with Island",
  "image": "https://images.unsplash.com/photo-...",
  "source": "Unsplash",
  "attributes": {
    "style": "Modern",
    "color": "White",
    "layout": "L-shaped",
    "countertop": "Quartz",
    "backsplash": "Subway Tile"
  },
  "professional": {
    "id": 5,
    "name": "Jane Smith",
    "company": "Modern Kitchens Inc."
  }
}
```

### Error Responses

**Invalid ID (400 Bad Request)**
```json
{
  "error": "Invalid ID"
}
```

**Not Found (404)**
```json
{
  "error": "Photo not found"
}
```

## Implementation Details

```typescript
// route.ts
import { getPhotoById } from '@/lib/services/photos';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const photo = getPhotoById(id);

  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  return NextResponse.json(photo);
}
```

## Service Layer

The endpoint uses `getPhotoById(id)` from `@/lib/services/photos`.

## Photo Object Structure

```typescript
interface Photo {
  id: number;
  title: string;
  image: string;           // Full URL to image
  source: string;          // Image source attribution
  attributes?: {
    style?: string;        // Kitchen style
    color?: string;        // Primary color
    layout?: string;       // Layout type
    countertop?: string;   // Countertop material
    backsplash?: string;   // Backsplash type
    flooring?: string;     // Flooring type
    appliances?: string;   // Appliance style
  };
  professional?: {
    id: number;
    name: string;
    company: string;
  };
}
```

## Type-Safe Client Usage

```typescript
import { api } from '@/lib/api';

// Get single photo
const photo = await api.photos.get(123);

// Access photo details
console.log(photo.title);
console.log(photo.attributes?.style);
console.log(photo.professional?.name);
```

## Related Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/feed` | List all photos with pagination |
| `/api/professionals/[id]` | Get professional who posted the photo |

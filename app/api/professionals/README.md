# Professionals API

Endpoint for retrieving kitchen design professional details by ID.

## Endpoint

```
GET /api/professionals/[id]
```

## URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Professional's numeric ID |

## Examples

```bash
# Get professional with ID 5
GET /api/professionals/5

# Get professional with ID 1
GET /api/professionals/1
```

## Response

### Success (200 OK)

```json
{
  "id": 5,
  "name": "Jane Smith",
  "company": "Modern Kitchens Inc.",
  "averageRating": 4.8,
  "reviewCount": 24,
  "totalProjects": 45,
  "reviews": [
    {
      "id": 1,
      "reviewerName": "John Doe",
      "rating": 5,
      "comment": "Excellent work on our kitchen remodel!",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "photos": [
    {
      "id": 101,
      "title": "Modern White Kitchen",
      "image": "https://images.unsplash.com/..."
    }
  ]
}
```

### Error Responses

**Invalid ID (400 Bad Request)**
```json
{
  "error": "Invalid professional ID"
}
```

**Not Found (404)**
```json
{
  "error": "Professional not found"
}
```

**Server Error (500)**
```json
{
  "error": "Failed to fetch professional"
}
```

## Implementation Details

```typescript
// route.ts
import { getProfessionalById } from '@/lib/services/professionals';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const professionalId = parseInt(id);

    if (isNaN(professionalId)) {
      return NextResponse.json(
        { error: 'Invalid professional ID' },
        { status: 400 }
      );
    }

    const professional = getProfessionalById(professionalId);

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(professional);
  } catch (error) {
    console.error('Error fetching professional:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professional' },
      { status: 500 }
    );
  }
}
```

## Service Layer

The endpoint uses `getProfessionalById(id)` from `@/lib/services/professionals`.

## Professional Object Structure

```typescript
interface Professional {
  id: number;
  name: string;
  company: string;
  averageRating?: number;     // 1-5 star rating
  reviewCount?: number;       // Total number of reviews
  totalProjects?: number;     // Total portfolio projects
  reviews?: Review[];         // Array of review objects
  photos?: Photo[];           // Portfolio photos
}

interface Review {
  id: number;
  reviewerName: string;
  rating: number;             // 1-5 stars
  comment: string;
  createdAt: string;          // ISO date string
}

interface Photo {
  id: number;
  title: string;
  image: string;              // Full URL to image
}
```

## Type-Safe Client Usage

```typescript
import { api } from '@/lib/api';

// Get professional details
const professional = await api.professionals.get(5);

// Access professional info
console.log(professional.name);
console.log(professional.averageRating);
console.log(professional.reviews?.length);
console.log(professional.photos?.length);
```

## Related Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/contact/init` | Start consultation with professional |
| `/api/contact/by-professional` | Get existing conversation |
| `/api/photos/[id]` | Get photo details (includes professional) |

## Usage in Pages

The professional page (`/professionals/[id]`) fetches this data server-side:

```typescript
async function getProfessional(id: string) {
  const response = await fetch(`http://localhost:3000/api/professionals/${id}`, {
    cache: 'no-store',
  });
  return await response.json();
}
```

# Professionals Pages

This directory contains pages for the professional directory - showcasing kitchen design professionals with their portfolios, reviews, and AI-powered consultation features.

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/professionals` | `page.tsx` | Directory listing all professionals |
| `/professionals/[id]` | `[id]/page.tsx` | Individual professional profile |

## Professionals Directory Page (`page.tsx`)

**Route**: `/professionals`

### Purpose
Landing page displaying all kitchen design professionals in a browsable list.

### Features
- **Hero Section**: Gradient header with title and description
- **Professionals List**: Via `ProfessionalsList` component
- **CTA Section**: Links to photo gallery for inspiration
- **SEO**: Full metadata and JSON-LD structured data

### Data Flow
```
getAllProfessionals() → ProfessionalsList component → Rendered cards
```

### Metadata
```typescript
export const metadata: Metadata = {
  title: 'Find Kitchen Design Professionals | Houzz',
  description: 'Browse our directory of kitchen design professionals...',
  openGraph: { ... }
};
```

### JSON-LD Schema
```json
{
  "@type": "CollectionPage",
  "name": "Kitchen Design Professionals",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "LocalBusiness",
        "name": "Professional Name",
        "aggregateRating": { ... }
      }
    ]
  }
}
```

---

## Professional Profile Page (`[id]/page.tsx`)

**Route**: `/professionals/:id` (e.g., `/professionals/1`, `/professionals/5`)

### Purpose
Detailed profile page for an individual professional with portfolio, reviews, and AI-powered consultation chat.

### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Professional's numeric ID |

### Page Layout
```
┌─────────────────────────────────────────────┐
│                 Container                    │
├─────────────────────────┬───────────────────┤
│    Left Column (2fr)    │  Right Column (1fr)│
│                         │                    │
│  ┌─────────────────┐   │  ┌──────────────┐  │
│  │ Professional    │   │  │ Contact      │  │
│  │ Header (name,   │   │  │ Section      │  │
│  │ company, rating)│   │  │ (AI Chat)    │  │
│  └─────────────────┘   │  │              │  │
│                         │  │ - Sticky     │  │
│  ┌─────────────────┐   │  │ - Streamable │  │
│  │ Projects        │   │  │              │  │
│  │ Gallery         │   │  └──────────────┘  │
│  └─────────────────┘   │                    │
│                         │                    │
│  ┌─────────────────┐   │                    │
│  │ Reviews         │   │                    │
│  │ Section         │   │                    │
│  └─────────────────┘   │                    │
└─────────────────────────┴───────────────────┘
```

### Features

1. **Professional Header**
   - Avatar with initial
   - Name and company
   - Star rating with count
   - Stats (Projects, Reviews)

2. **Projects Gallery**
   - Grid of portfolio photos
   - Clickable for modal view
   - Uses `PhotoGalleryProvider` for lightbox

3. **Reviews Section**
   - Individual review cards
   - Reviewer name, rating, comment

4. **Contact Section (AI Chat)**
   - Sticky positioned
   - Server-side streaming with Suspense
   - AI-powered consultation
   - Conversation resumption support

### Server-Side Data Fetching

```typescript
// Fetch professional data
async function getProfessional(id: string) {
  const response = await fetch(`http://localhost:3000/api/professionals/${id}`, {
    cache: 'no-store', // Always fresh data
  });
  return await response.json();
}

// Fetch existing conversation
async function getConversation(professionalId: string) {
  const response = await fetch(
    `http://localhost:3000/api/contact/by-professional?professionalId=${professionalId}`
  );
  return await response.json();
}
```

### Streaming Architecture

The contact section uses React Suspense for progressive loading:

```typescript
<Suspense fallback={<ContactSectionSkeleton />}>
  <ContactSectionWithData
    professionalId={id}
    professional={{ id, name, company }}
  />
</Suspense>
```

Benefits:
- Page content loads immediately
- Contact section streams in when data is ready
- Skeleton shows during loading
- No blocking of main content

### Error Handling
- Invalid/missing professional ID → `notFound()` (404 page)
- API errors → Logged to console, graceful degradation

### Data Model

**Professional Details**
```typescript
interface ProfessionalDetails {
  id: number;
  name: string;
  company: string;
  averageRating?: number;
  reviewCount?: number;
  reviews?: Array<{
    id: number;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  photos?: Array<{
    id: number;
    title: string;
    image: string;
  }>;
  totalProjects?: number;
}
```

## Supporting Components

| Component | File | Purpose |
|-----------|------|---------|
| `ProfessionalsList` | `ProfessionalsList.tsx` | List of professional cards |
| `ContactSection` | `[id]/ContactSection.tsx` | AI chat interface |
| `PhotoCard` | `[id]/PhotoCard.tsx` | Portfolio photo card |
| `PhotoGalleryRegistrar` | `[id]/PhotoGalleryRegistrar.tsx` | Registers photos with gallery context |
| `ContactSectionSkeleton` | Inline | Loading placeholder |

## Context Providers

The page wraps content in `PhotoGalleryProvider` to enable:
- Photo modal/lightbox functionality
- Photo navigation within portfolio
- Consistent gallery experience

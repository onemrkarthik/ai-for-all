# Kitchen Styles Pages

This directory contains pages for browsing kitchen design styles with educational content and inspiration galleries.

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/styles` | `page.tsx` | Index page listing all kitchen styles |
| `/styles/[style]` | `[style]/page.tsx` | Individual style detail page |

## Styles Index Page (`page.tsx`)

**Route**: `/styles`

### Purpose
Landing page showcasing all available kitchen design styles (Modern, Contemporary, Transitional, Farmhouse, Traditional, Scandinavian).

### Features
- **Hero Section**: Gradient header with title and description
- **Styles Grid**: Responsive grid of style cards with images
- **CTA Section**: Links to main photo gallery
- **SEO**: Full metadata and JSON-LD structured data

### Data Flow
```
STYLE_GUIDES (lib/data/style-guides) → StyleCard components → Grid display
```

### Key Components Used
- `StyleCard` - Card component for each style

### Metadata
```typescript
export const metadata: Metadata = {
  title: 'Kitchen Design Styles | Houzz',
  description: 'Explore popular kitchen design styles...',
  openGraph: { ... }
};
```

---

## Style Detail Page (`[style]/page.tsx`)

**Route**: `/styles/:style` (e.g., `/styles/modern`, `/styles/farmhouse`)

### Purpose
Individual landing page for each kitchen design style with comprehensive educational content and a filtered photo gallery.

### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `style` | string | Style slug (modern, contemporary, transitional, farmhouse, traditional, scandinavian) |

### Features

1. **Breadcrumb Navigation**: Links back to styles index
2. **Hero Section**: Style name with tagline
3. **Overview Card**: "What is [Style] Style?" description
4. **Content Sections** (via `StyleContent` component):
   - Layout recommendations
   - Cabinet styles
   - Countertop materials
   - Backsplash options
   - Flooring choices
   - Appliance suggestions
   - Color palettes
   - Lighting tips
5. **Photo Gallery** (via `StyleGallery` component): Filtered photos for the style
6. **Related Styles CTA**: Links to explore other styles

### Data Flow
```
URL param (style) → getStyleGuide() → StyleContent + StyleGallery → Rendered page
```

### Static Generation
Pre-generates pages for all known styles at build time:

```typescript
export async function generateStaticParams() {
  return STYLE_SLUGS.map((style) => ({ style }));
}
```

### Dynamic Metadata
Generates SEO-optimized metadata based on style:

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = getStyleGuide(style);
  return {
    title: `${guide.name} Kitchen Design Guide | Houzz`,
    description: `${guide.tagline}. Expert tips on layout, cabinets...`,
    keywords: [`${guide.name.toLowerCase()} kitchen`, ...]
  };
}
```

### Error Handling
- Invalid style slug → `notFound()` (404 page)

### JSON-LD Schema
```json
{
  "@type": "Article",
  "headline": "Modern Kitchen Design Guide",
  "description": "...",
  "author": { "@type": "Organization", "name": "Houzz" },
  "articleSection": "Kitchen Design"
}
```

## Supporting Components

| Component | File | Purpose |
|-----------|------|---------|
| `StyleCard` | `StyleCard.tsx` | Card for style index grid |
| `StyleContent` | `[style]/StyleContent.tsx` | Educational content sections |
| `StyleGallery` | `[style]/StyleGallery.tsx` | Filtered photo gallery for style |

## Available Styles

| Slug | Display Name |
|------|--------------|
| `modern` | Modern |
| `contemporary` | Contemporary |
| `transitional` | Transitional |
| `farmhouse` | Farmhouse |
| `traditional` | Traditional |
| `scandinavian` | Scandinavian |

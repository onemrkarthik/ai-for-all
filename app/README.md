# App Directory

This is the main application directory using Next.js 16 App Router architecture. It contains all pages, API routes, and shared components.

## Directory Structure

```
app/
├── layout.tsx          # Root layout (HTML shell, Header, Footer)
├── page.tsx            # Home page (redirects to default topic)
├── globals.css         # Global styles
├── components/         # Reusable React components
├── api/                # API routes
│   ├── feed/           # Photo feed endpoints
│   ├── photos/         # Individual photo endpoints
│   ├── professionals/  # Professional details endpoints
│   └── contact/        # AI chat consultation endpoints
├── photos/             # Photo gallery pages
│   └── [slug]/         # Topic-based photo gallery
├── professionals/      # Professional directory
│   ├── page.tsx        # List all professionals
│   └── [id]/           # Individual professional profile
└── styles/             # Kitchen style guides
    ├── page.tsx        # Style index page
    └── [style]/        # Individual style detail pages
```

## Root Layout (`layout.tsx`)

The root layout wraps all pages and provides:

- **HTML Structure**: Sets up the `<html>` and `<body>` tags
- **Global Header/Footer**: Includes `Header` and `Footer` components
- **Metadata**: SEO title "AI for All" and description
- **Flex Layout**: Uses flexbox for sticky footer behavior

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
```

## Home Page (`page.tsx`)

The root page (`/`) immediately redirects to the default topic gallery:

- **Default Topic**: `kitchen-ideas-and-designs-phbr0-bp~t_709`
- **Redirect URL**: `/photos/kitchen-ideas-and-designs-phbr0-bp~t_709`
- **Purpose**: Ensures users land on content-rich gallery page

```typescript
import { redirect } from 'next/navigation';
import { DEFAULT_TOPIC, getTopicPath } from '@/lib/utils/slug';

export default function RootPage() {
  redirect(getTopicPath(DEFAULT_TOPIC));
}
```

## Server vs Client Components

- **Server Components (default)**: Pages without `'use client'` directive
- **Client Components**: Interactive elements in `components/` folder with `'use client'` directive

## Related Documentation

- [Photos Documentation](./photos/[slug]/README.md)
- [Professionals Documentation](./professionals/README.md)
- [Styles Documentation](./styles/README.md)
- [API Documentation](./api/README.md)

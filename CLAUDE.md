# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kitchen design gallery with AI-powered professional consultation. Full-stack Next.js 16 application using React 19, TypeScript, SQLite (better-sqlite3), and Google Gemini AI.

## Commands

```bash
# Development
npm run dev          # Start development server at http://localhost:3000

# Build & Production
npm run build        # Create production build
npm run start        # Run production server

# Linting
npm run lint         # Run ESLint

# Database
npx tsx scripts/init-db.ts    # Initialize/seed database
```

## Architecture

For detailed architecture documentation, see `ARCHITECTURE.md`.

### Key Directory Structure

- `app/` - Next.js App Router pages and API routes
  - `api/` - Backend API routes (contact, feed, photos, professionals)
  - `components/` - React components (PhotoGallery, PhotoModal, ContactPane, etc.)
  - `professionals/[id]/` - Professional profile pages with server-side streaming
  - `styles/[style]/` - Kitchen style landing pages (Modern, Traditional, etc.)
  - `photos/[slug]/` - Individual photo detail pages
- `lib/` - Business logic and utilities
  - `api/` - Type-safe API client (`api.photos.get()`, `api.contact.init()`, etc.)
  - `navigation/` - Type-safe client navigation (`nav.home.index()`, `nav.professionals.detail()`)
  - `services/` - Database query services (photos.ts, chat.ts)
  - `db/` - Database connection (index.ts) and schema definitions (schema.ts)
  - `ai.ts` - Google Gemini integration
- `scripts/` - Database initialization scripts

### Server vs Client Components

- Server Components (default): Data fetching, no 'use client' directive
- Client Components: Interactive elements require `'use client'` directive at top of file
- Components in `app/components/` are mostly client components for interactivity

### Type-Safe Patterns

**API Calls** - Use the typed API client instead of raw fetch:
```typescript
import { api } from '@/lib/api';
const photo = await api.photos.get(123);  // Typed response
const feed = await api.feed.list({ offset: 0, limit: 20 });
```

**Navigation** - Use typed navigation helpers:
```typescript
import { nav } from '@/lib/navigation';
<Link href={nav.professionals.detail(5)} />  // "/professionals/5"
<Link href={nav.home.index({ photo: 123 })} />  // "/?photo=123"
```

### Database

SQLite with WAL mode. Schema defined in `lib/db/schema.ts`. Tables: photos, photo_attributes, professionals, photos_professionals, reviews, conversations, messages.

### Environment Variables

Required in `.env.local`:
- `GOOGLE_API_KEY` - Google Gemini API key

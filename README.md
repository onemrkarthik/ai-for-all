# Kitchen Design Gallery (AI for All)

Kitchen design gallery with AI-powered professional consultation. Full-stack Next.js 16 application using React 19, TypeScript, SQLite (better-sqlite3), and Google Gemini AI.

## Quick Start (New Developer Setup)

### Prerequisites

- **Node.js 18+** (recommended: use `nvm` to manage versions)
- **npm** (comes with Node.js)

### Setup in 3 Steps

```bash
# 1. Clone and install (database auto-initializes on first install)
git clone git@github.com:onemrkarthik/ai-for-all.git
cd ai-for-all
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and add your Google API key

# 3. Start development server
npm run dev
```

Open http://localhost:3000 - you should see the kitchen photo gallery.

### Getting a Google API Key

1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env.local` file

**Note:** The app works without an API key, but AI chat features will be disabled.

## Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:3000

# Database
npm run db:init          # Initialize database with seed data
npm run db:reset         # Delete and recreate database (fresh start)

# Build & Production
npm run build            # Create production build (includes code check)
npm run start            # Run production server

# Testing & Linting
npm run lint             # Run ESLint
npm run test             # Run Jest tests (architecture tests)
npm run type-check       # Run TypeScript type checking
npm run check:no-houzz   # Verify no Houzz/IVY ecosystem code is included

# Git Hooks (auto-configured)
# Pre-commit: Runs lint-staged (ESLint --fix on staged files)
# Pre-push: Runs type-check, standards check, and architecture tests

# Full Setup (install + db init + hooks)
npm run setup            # Run after cloning if npm install didn't auto-init
```

## Project Structure

```
app/                          # INTERFACE LAYER
├── api/                      # Backend API routes
│   ├── contact/              # Contact form endpoints (init, chat, latest, etc.)
│   ├── feed/                 # Photo feed endpoints
│   ├── photos/               # Photo CRUD endpoints
│   └── professionals/        # Professional endpoints
├── components/               # Shared React UI components
│   ├── ContactPane.tsx       # AI chat interface
│   ├── FilterBar.tsx         # Gallery filtering
│   ├── Header.tsx            # Site header
│   ├── Footer.tsx            # Site footer
│   ├── PhotoBatch.tsx        # Server component for photo batches
│   ├── PhotoBatchClient.tsx  # Client renderer for photo batches
│   ├── PhotoCard.tsx         # Individual photo card
│   ├── PhotoGallery.tsx      # Gallery with context provider
│   ├── PhotoModal.tsx        # Photo detail modal
│   └── Skeleton.tsx          # Loading skeletons
├── professionals/            # Professional feature
│   ├── [id]/                 # Dynamic professional profile pages
│   └── page.tsx              # Professionals listing page
├── photos/                   # Photos feature
│   └── [slug]/               # Individual photo detail pages
├── styles/                   # Kitchen styles feature
│   ├── [style]/              # Dynamic style pages (Modern, Traditional, etc.)
│   └── page.tsx              # Styles index page
├── layout.tsx                # Root layout
├── page.tsx                  # Home page
└── globals.css               # Global styles

lib/                          # LOGIC + DATA LAYERS
├── api/                      # Type-safe API client
│   ├── builder.ts            # URL construction utilities
│   ├── client.ts             # API client methods
│   ├── config.ts             # Route configuration
│   ├── types.ts              # Request/response types
│   └── index.ts              # Public exports
├── navigation/               # Type-safe routing
│   ├── routes.ts             # Route definitions
│   └── index.ts              # Public exports (nav helpers)
├── services/                 # Business logic + database queries
│   ├── chat.ts               # Chat/conversation operations
│   ├── photos.ts             # Photo operations
│   └── professionals.ts      # Professional operations
├── db/                       # Database layer
│   ├── connection.ts         # Database connection
│   ├── schema.ts             # Schema definitions
│   ├── config.ts             # Database configuration
│   ├── types.ts              # Database types
│   └── index.ts              # Public exports
├── data/                     # Static data
│   └── style-guides.ts       # Kitchen style guide content
├── utils/                    # Utility functions
│   └── slug.ts               # URL slug utilities
├── ai.ts                     # Google Gemini AI integration
├── cdn.ts                    # CDN/image utilities
└── data.ts                   # Data fetching orchestration

scripts/                      # Build & setup scripts
├── check-no-houzz-code.ts    # Houzz/IVY code detection
├── check-standards.ts        # Standards compliance check
├── init-db.ts                # Database initialization
├── install-hooks.sh          # Git hooks installer
└── git-hooks/                # Custom git hooks
    └── pre-push              # Pre-push verification

tests/                        # Test files
└── architecture.test.ts      # Architecture compliance tests

.husky/                       # Husky git hooks
├── pre-commit                # Lint-staged on commit
└── pre-push                  # Type-check + tests on push
```

## Architecture

For detailed architecture documentation, see `ARCHITECTURE.md`.

### Three-Layer Architecture

```
INTERFACE  → app/, app/api/, app/components/
LOGIC      → lib/api/, lib/navigation/, lib/services/
DATA       → lib/db/, lib/services/ (query functions)
```

### Key Principles

1. **Feature Isolation** - Features cannot import from other features
2. **Single Responsibility** - Each file/function does ONE thing
3. **Type Safety** - Use `api` client and `nav` helpers, not raw fetch/hardcoded paths

### Server vs Client Components

- **Server Components** (default): Data fetching, no 'use client' directive
- **Client Components**: Interactive elements require `'use client'` at top
- Components in `app/components/` are mostly client components

### Type-Safe Patterns

**API Calls** - Use the typed API client:
```typescript
import { api } from '@/lib/api';
const photo = await api.photos.get(123);  // Typed response
const feed = await api.feed.list({ offset: 0, limit: 20 });

// With filters support:
const filtered = await api.feed.list({
  offset: 0,
  limit: 20,
  filters: { style: 'Modern', layout: 'L-Shaped' }
});
```

**Navigation** - Use typed navigation helpers:
```typescript
import { nav } from '@/lib/navigation';
<Link href={nav.professionals.detail(5)} />     // "/professionals/5"
<Link href={nav.home.index({ photo: 123 })} />  // "/?photo=123"
<Link href={nav.photos.ideas()} />              // "/photos/ideas"
<Link href={nav.styles.detail('modern')} />     // "/styles/modern"
```

### Database

SQLite with WAL mode. Schema defined in `lib/db/schema.ts`.

**Tables:** photos, photo_attributes, professionals, photos_professionals, reviews, conversations, messages

### Environment Variables

Required in `.env.local`:
- `GOOGLE_API_KEY` - Google Gemini API key (get one at https://aistudio.google.com/apikey)

## Troubleshooting

### "no such table: photos" error
```bash
npm run db:init
```

### Database corruption or stale data
```bash
npm run db:reset
```

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Image 404 errors
```bash
npm run db:reset
```

### better-sqlite3 compilation errors
On macOS:
```bash
xcode-select --install
```

### Build fails with "Houzz/IVY ecosystem code detected"
1. Run `npm run check:no-houzz` to see specific violations
2. Remove or replace any `@houzz/*` or `@ivy/*` package imports
3. Replace `houzz.com` or `ivy.co` URLs with appropriate alternatives

### Pre-push hook fails
The pre-push hook runs type checking and architecture tests. If it fails:
1. Run `npm run type-check` to see TypeScript errors
2. Run `npm test` to see failing architecture tests
3. Fix the violations before pushing

## Development Workflow

### Git Hooks (Automatic)

- **Pre-commit**: Runs ESLint with auto-fix on staged files
- **Pre-push**: Runs TypeScript type-check, standards check, and architecture tests

### Adding New Features

1. Create feature folder under `app/` (e.g., `app/new-feature/`)
2. Extract shared components to `app/components/`
3. Add business logic to `lib/services/`
4. Add API routes to `app/api/new-feature/`
5. Update `lib/api/config.ts` with new routes
6. Update `lib/navigation/routes.ts` for navigation

### Commit Message Format

```
[feature] verb: description

[photos] add: style filtering
[chat] fix: message ordering
[lib] refactor: extract validation
```

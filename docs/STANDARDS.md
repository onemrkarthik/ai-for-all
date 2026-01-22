# Engineering Standards & Architecture Guide

**Version:** 2.0.0
**Status:** Enforced
**Last Updated:** 2026-01-22
**References:** Google (TypeScript), Airbnb (React), Clean Architecture, Project Constraints

This document defines the engineering standards for our full-stack codebase. It synthesizes industry-best architectural patterns with strict operational enforcement to ensure scalability, maintainability, and developer velocity.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Core Architectural Principles](#core-architectural-principles)
3. [Workflow & Enforcement](#workflow--enforcement)
4. [Project Structure & Naming](#project-structure--naming)
5. [Frontend Standards (React/Next.js)](#frontend-standards-reactnextjs)
6. [Backend Standards (TypeScript/Node)](#backend-standards-typescriptnode)
7. [Database Standards](#database-standards)
8. [Operational Safety](#operational-safety)
9. [Fixing Violations](#fixing-violations)
10. [For AI Assistants](#for-ai-assistants)

---

## Quick Reference

| Standard | What It Means | Severity |
|----------|---------------|----------|
| No generic file names | Don't use `utils.ts`, `helpers.ts`, `misc.ts` | ERROR |
| Layer separation | UI code can't directly access the database | ERROR |
| Feature isolation | Features can't import from other features | ERROR |
| API isolation | API routes can't import from other API routes | ERROR |
| Client directive | Components using hooks need `'use client'` | ERROR |
| Type safety | Don't use `any` type or `@ts-ignore` | WARNING |
| Async/await | Use `async/await` not `.then()` chains | WARNING |
| No console.log | Remove `console.log` from production code | WARNING |
| No require() | Use ES imports, not CommonJS `require()` | WARNING |
| Use API client | Use `api.photos.get()` not `fetch('/api/...')` | WARNING |
| Use nav helpers | Use `nav.home.index()` not `href="/"` | WARNING |
| No hardcoded values | URLs and secrets go in environment variables | WARNING |
| Feature READMEs | Each feature folder needs a README.md | WARNING |
| README template | Feature READMEs need required sections | WARNING |

**ERROR** = Code cannot be pushed until fixed
**WARNING** = Code can be pushed, but should be fixed

---

## Core Architectural Principles

We follow a **Clean Architecture** approach. The goal is to create a system where business logic is independent of the UI, database, and external frameworks.

### The Dependency Rule

Dependencies must always point **inwards** (toward stability and abstraction).

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERFACE LAYER                       │
│              (app/, app/api/, app/components/)               │
│                    UI, API Routes, Pages                     │
└─────────────────────────────┬───────────────────────────────┘
                              │ depends on
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         LOGIC LAYER                          │
│              (lib/api/, lib/navigation/, lib/services/)      │
│               Business Rules, Use Cases, Validation          │
└─────────────────────────────┬───────────────────────────────┘
                              │ depends on
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          DATA LAYER                          │
│                    (lib/db/, lib/services/)                  │
│                Database, External APIs, Storage              │
└─────────────────────────────────────────────────────────────┘
```

**Key Rules:**
- **Interface Layer** can import from Logic Layer
- **Logic Layer** can import from Data Layer
- **Nothing** imports upward (Data Layer never imports from Interface)
- **Same-layer imports** are allowed within the same feature

### Why This Matters

| Without Clean Architecture | With Clean Architecture |
|---------------------------|------------------------|
| Changing the database breaks the UI | Database changes are isolated |
| UI code is full of SQL queries | UI only knows about data shapes |
| Testing requires a real database | Business logic is easily unit tested |
| One developer's change breaks another's | Changes are localized |

### Feature Isolation (Vertical Slices)

**Rule:** Features cannot import from other features.

**Why:** Prevents "Spaghetti Code" where changing the `photos` module breaks the `professionals` module.

```
app/
├── professionals/     ❌ Cannot import from photos/, styles/, etc.
├── photos/            ❌ Cannot import from professionals/, styles/, etc.
├── styles/            ❌ Cannot import from professionals/, photos/, etc.
├── api/
│   ├── professionals/ ❌ Cannot import from api/photos/, api/contact/
│   ├── photos/        ❌ Cannot import from api/professionals/
│   └── contact/       ❌ Cannot import from api/professionals/
├── components/        ✅ SHARED - any feature can import
└── lib/               ✅ SHARED - any feature can import
```

**When two features need the same code:**

| Need to Share | Put It In |
|--------------|-----------|
| UI Components | `app/components/` |
| Business Logic | `lib/services/` |
| Type Definitions | `lib/types/` or feature's `types.ts` |
| Utilities | `lib/[specific-name].ts` |

---

## Workflow & Enforcement

We rely on **automation over debate**. Standards are checked at multiple stages.

### Enforcement Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Write Code  │ ──▶ │  git commit  │ ──▶ │   git push   │ ──▶ │   GitHub     │
└──────────────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
                            │                    │                    │
                            ▼                    ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                     │   ESLint     │     │  Pre-push    │     │   CI/CD      │
                     │   (auto-fix) │     │   Hooks      │     │   Actions    │
                     └──────┬───────┘     └──────┬───────┘     └──────────────┘
                            │                    │
                            │             ┌──────┴──────┐
                            │             │             │
                            ▼             ▼             ▼
                     ┌──────────┐  ┌───────────┐  ┌───────────┐
                     │ Prettier │  │TypeScript │  │ Standards │
                     │  format  │  │  check    │  │   check   │
                     └──────────┘  └───────────┘  └─────┬─────┘
                                                       │
                                                       ▼
                                                ┌───────────┐
                                                │Architecture│
                                                │   tests   │
                                                └───────────┘
```

### What Gets Checked When

| Check | Trigger | What It Does | Failure Action |
|-------|---------|--------------|----------------|
| ESLint + Prettier | Commit | Fixes formatting, catches syntax | Auto-fixes most issues |
| TypeScript | Push | Ensures types are correct | **Blocks push** |
| Standards Check | Push | Verifies architectural rules | **Blocks push** (errors) |
| Architecture Tests | Push | Tests file structure and imports | **Blocks push** |
| GitHub Actions | PR/Push | Runs all checks in CI | **Blocks merge** |

### Running Checks Locally

```bash
# Run all checks (same as pre-push)
npm run type-check && npm run check:standards && npm test

# Run individual checks
npm run type-check        # TypeScript errors
npm run check:standards   # Architectural standards
npm test                  # Architecture tests
npm run lint              # ESLint (also auto-fixes)
```

---

## Project Structure & Naming

### The "No Utils" Rule

**Rule:** Do not use generic names like `utils.ts`, `helpers.ts`, or `common.ts`

**Why:** Generic names become junk drawers. After six months, nobody knows what's in `utils.ts` or where to find specific functionality.

**Bad:**
```
lib/
├── utils.ts        ← What's in here? Everything!
├── helpers.ts      ← How is this different from utils?
└── misc.ts         ← The junk drawer
```

**Good:**
```
lib/
├── dateFormatting.ts    ← Formats dates
├── priceCalculation.ts  ← Calculates prices
└── inputValidation.ts   ← Validates input
```

### Directory Layout

We use a **Domain-Driven** structure with clear layer separation:

```
app/                          # INTERFACE LAYER
├── api/                      # Backend API routes
│   ├── contact/              # Contact feature API
│   ├── feed/                 # Photo feed API
│   ├── photos/               # Photos API
│   └── professionals/        # Professionals API
├── components/               # SHARED UI components
├── professionals/            # Professionals feature pages
├── photos/                   # Photos feature pages
├── styles/                   # Kitchen styles feature pages
├── layout.tsx                # Root layout
├── page.tsx                  # Home page
└── globals.css               # Global styles

lib/                          # LOGIC + DATA LAYERS
├── api/                      # Typed API client (Logic)
│   ├── client.ts             # API methods
│   ├── config.ts             # Route configuration
│   ├── types.ts              # Request/response types
│   └── builder.ts            # URL construction
├── navigation/               # Typed routing (Logic)
│   ├── routes.ts             # Route definitions
│   └── index.ts              # Nav helpers
├── services/                 # Business logic + queries
│   ├── chat.ts               # Chat operations
│   ├── photos.ts             # Photo operations
│   └── professionals.ts      # Professional operations
├── db/                       # Database layer (Data)
│   ├── connection.ts         # DB connection
│   ├── schema.ts             # Schema definitions
│   └── types.ts              # Row type interfaces
└── ai.ts                     # External AI integration
```

---

## Frontend Standards (React/Next.js)

*Based on Airbnb React Style Guide & Next.js Best Practices*

### Component Design Patterns

#### Server vs Client Components

| Use Server Components (default) | Use Client Components (`'use client'`) |
|--------------------------------|---------------------------------------|
| Data fetching | Event handlers (onClick, onChange) |
| Database access (via services) | Browser APIs (localStorage, etc.) |
| Static content | State management (useState, useReducer) |
| Sensitive logic | Effects (useEffect) |

#### Compound Components (for complex UI)

Use compound components to avoid "Prop Drilling" and create flexible APIs.

**Bad (Prop Explosion):**
```tsx
// ❌ Too many props, hard to extend
<Modal
  isOpen={open}
  title="Edit Profile"
  subtitle="Update your information"
  primaryAction={save}
  primaryActionLabel="Save"
  secondaryAction={cancel}
  secondaryActionLabel="Cancel"
  showCloseButton={true}
  closeOnOverlayClick={true}
  size="large"
/>
```

**Good (Compound Components):**
```tsx
// ✅ Flexible, composable, self-documenting
<Modal isOpen={open} onClose={close}>
  <Modal.Header>
    <Modal.Title>Edit Profile</Modal.Title>
    <Modal.Subtitle>Update your information</Modal.Subtitle>
  </Modal.Header>
  <Modal.Body>
    <ProfileForm />
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={cancel}>Cancel</Button>
    <Button variant="primary" onClick={save}>Save</Button>
  </Modal.Footer>
</Modal>
```

### Navigation & API Integration

**Rule:** Never use raw strings for internal links or fetch calls.

**Why:** Refactoring a route shouldn't require a global find-and-replace.

**Bad:**
```tsx
// ❌ Hardcoded - breaks if routes change
fetch('/api/photos/123');
<Link href="/professionals/5">View Profile</Link>
<Link href="/?photo=123">Open Photo</Link>
```

**Good:**
```tsx
// ✅ Typed helpers - refactor-safe
import { api } from '@/lib/api';
import { nav } from '@/lib/navigation';

const photo = await api.photos.get(123);
<Link href={nav.professionals.detail(5)}>View Profile</Link>
<Link href={nav.home.index({ photo: 123 })}>Open Photo</Link>
```

**Available API Methods:**

| Method | Purpose |
|--------|---------|
| `api.feed.list({ offset, limit, filters })` | Get photo feed with filters |
| `api.photos.get(id)` | Get photo details |
| `api.professionals.get(id)` | Get professional details |
| `api.contact.init(body)` | Start a conversation |
| `api.contact.chat(body)` | Send a message |
| `api.contact.latest(photoId)` | Get latest conversation |

**Available Navigation Helpers:**

| Helper | Result |
|--------|--------|
| `nav.home.index()` | `"/"` |
| `nav.home.index({ photo: 123 })` | `"/?photo=123"` |
| `nav.professionals.detail(5)` | `"/professionals/5"` |
| `nav.photos.ideas()` | `"/photos/ideas"` |
| `nav.styles.detail('modern')` | `"/styles/modern"` |

### Context & State Management

**Pattern:** Split contexts to prevent unnecessary re-renders.

```tsx
// ✅ Separate state from actions
const PhotoGalleryStateContext = createContext<State>({});
const PhotoGalleryActionsContext = createContext<Actions>({});

// Components using only actions don't re-render on state changes
export function usePhotoGalleryActions() {
  return useContext(PhotoGalleryActionsContext);
}
```

---

## Backend Standards (TypeScript/Node)

*Based on Google TypeScript Style Guide*

### Layer Separation

**Rule:** UI Code (`app/`) cannot import `lib/db`.

**Why:** The frontend should communicate with the backend via APIs/Services, even in Server Components. This allows:
- Swapping databases without touching UI code
- Unit testing business logic without a database
- Clear ownership boundaries

**Bad:**
```tsx
// ❌ app/page.tsx - UI directly accessing database
import { db } from '@/lib/db';

export default function Page() {
  const photos = db.prepare('SELECT * FROM photos').all();
  return <Gallery photos={photos} />;
}
```

**Good:**
```tsx
// ✅ app/page.tsx - UI uses service layer
import { getPhotos } from '@/lib/services/photos';

export default function Page() {
  const photos = getPhotos({ offset: 0, limit: 20 });
  return <Gallery photos={photos} />;
}
```

### TypeScript Patterns

#### No `any` Type

**Rule:** Never use `any`. Use `unknown` if the type is truly unknown.

**Bad:**
```typescript
// ❌ Disables type checking entirely
function processData(data: any) {
  return data.name.toUpperCase(); // Might crash!
}
```

**Good:**
```typescript
// ✅ Define interfaces for your data
interface UserData {
  name: string;
  email: string;
}

function processData(data: UserData) {
  return data.name.toUpperCase(); // TypeScript knows this is safe
}

// ✅ Use unknown with type guards when truly unknown
function processUnknown(data: unknown) {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    return (data as { name: string }).name.toUpperCase();
  }
  throw new Error('Invalid data');
}
```

#### Error Handling

**Rule:** Use custom error classes, not generic objects.

```typescript
// ✅ Custom error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

// Usage
try {
  const photo = await api.photos.get(123);
} catch (error) {
  if (error instanceof ApiError && error.status === 404) {
    return notFound();
  }
  throw error;
}
```

#### Async/Await

**Rule:** Always use async/await, never raw `.then()` chains.

```typescript
// ❌ Promise chains are harder to read
function getData() {
  return fetch('/api/data')
    .then(res => res.json())
    .then(data => processData(data))
    .catch(err => handleError(err));
}

// ✅ Async/await is clearer
async function getData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    return processData(data);
  } catch (err) {
    handleError(err);
  }
}
```

---

## Database Standards

### Type-Safe Queries

**Rule:** All database queries must use typed row interfaces.

```typescript
// lib/db/types.ts - Define row shapes
export interface PhotoRow {
  id: number;
  title: string;
  source: string;
  image_url: string;
  description?: string;
}

// lib/services/photos.ts - Use the types
import type { PhotoRow } from '@/lib/db/types';

export function getPhotoById(id: number): PhotoRow | undefined {
  return db.prepare(
    'SELECT * FROM photos WHERE id = ?'
  ).get(id) as PhotoRow | undefined;
}
```

### Schema Management

| Practice | Rule |
|----------|------|
| Schema Location | All definitions in `lib/db/schema.ts` |
| Migrations | Never edit a migration after merge; create a new one |
| Foreign Keys | Always define with proper CASCADE rules |
| Indexes | Index foreign keys and columns in WHERE clauses |

### Query Patterns

```typescript
// ✅ Use prepared statements (automatic with better-sqlite3)
const stmt = db.prepare('SELECT * FROM photos WHERE id = ?');
const photo = stmt.get(id);

// ✅ Use transactions for multi-table operations
db.transaction(() => {
  db.prepare('INSERT INTO photos ...').run(...);
  db.prepare('INSERT INTO photo_attributes ...').run(...);
})();
```

---

## Operational Safety

### No Hardcoded Values

**Rule:** URLs, secrets, and configuration must be environment variables.

**Bad:**
```typescript
// ❌ Hardcoded values
const API_URL = 'https://api.production.com';
const API_KEY = 'sk-1234567890abcdef';
```

**Good:**
```typescript
// ✅ Environment variables
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
```

**Allowed URLs** (won't trigger warnings):
- `schema.org` - SEO structured data
- `unsplash.com` / `images.unsplash.com` - Image CDN
- `localhost` - Development
- `example.com` - Documentation placeholders
- `w3.org` - W3C standards

### Feature Documentation

**Rule:** Every feature folder must have a `README.md`.

**Required Format:**

```markdown
# [Feature Name]

Brief description of what this feature does.

## Responsibilities

- What this feature handles
- What it does NOT handle (boundaries)

## Routes

| Route | Description |
|-------|-------------|
| `/feature` | Main page |
| `/feature/[id]` | Detail page |

## Key Components

| Component | Purpose |
|-----------|---------|
| `FeatureCard` | Displays a single item |
| `FeatureList` | Grid/list of items |

## API Dependencies

| Endpoint | Usage |
|----------|-------|
| `api.feature.list()` | Load items |
| `api.feature.get(id)` | Load details |

## Data Flow

```
User Action → Component → API Client → API Route → Service → Database
```
```

---

## Fixing Violations

### Quick Fixes by Error Type

| Error | Quick Fix |
|-------|-----------|
| Generic file name | Rename to describe purpose: `utils.ts` → `dateFormatting.ts` |
| Layer violation | Move DB code to `lib/services/`, use API client in UI |
| Cross-feature import | Move shared code to `app/components/` or `lib/` |
| Cross-API import | Move shared logic to `lib/services/` |
| Missing `'use client'` | Add `'use client'` directive at top of file |
| `any` type | Define an interface in `lib/types/` or locally |
| `@ts-ignore` | Fix the underlying type error |
| `.then()` chain | Convert to `async/await` syntax |
| `console.log` | Remove or use `console.error` for errors |
| `require()` | Convert to ES import: `import x from 'y'` |
| Raw fetch | Use `api` client from `@/lib/api` |
| Hardcoded path | Use `nav` helper from `@/lib/navigation` |
| Hardcoded URL | Move to environment variable |
| Missing README | Create README.md with required sections |
| Missing README section | Add Responsibilities, Routes, Key Components sections |

### Understanding Check Output

```
🔍 Checking code standards...

   Scanning 64 files...

   ✅ Generic file names       ← All files have good names
   ✅ Layer violations         ← No UI→DB imports
   ❌ Cross-feature imports    ← PROBLEM FOUND
   ...

============================================================

❌ ERRORS:

   [no-cross-feature-imports] app/photos/page.tsx:5
   Feature "photos" cannot import from feature "professionals".
   Extract shared code to app/components/ or lib/

============================================================

📊 Summary: 1 error, 0 warnings

❌ Standards check FAILED
```

### Getting Help

1. **Check existing code** for similar patterns
2. **Read ARCHITECTURE.md** for design decisions
3. **Ask in team chat** - someone has probably solved it before
4. **Use AI assistants** (Claude, Cursor) - they know our standards

---

## For AI Assistants

**Instructions for Claude/Cursor/Copilot:**

### Before Generating Code

1. **Read this document** and `CLAUDE.md` / `.cursorrules`
2. **Identify the feature** - Which folder does this belong to?
3. **Check the layer** - Interface, Logic, or Data?
4. **Check for existing code** - Does `lib/` or `app/components/` have this?

### Strict Mode Rules

| Rule | Action |
|------|--------|
| Cross-feature import requested | **Refuse.** Suggest extracting to shared location. |
| Database import in UI requested | **Refuse.** Suggest service layer pattern. |
| `any` type suggested | **Refuse.** Ask for type definition or use `unknown`. |
| Raw `fetch('/api/...')` | **Replace** with `api` client. |
| Hardcoded route path | **Replace** with `nav` helper. |
| Generic file name | **Suggest** specific name. |

### Response Template for Violations

When asked to generate code that would violate standards:

```
"I cannot fulfill this request because [ACTION] violates the
[STANDARD NAME] standard.

**Why this matters:** [Brief explanation]

**Recommended Fix:**
1. [Step 1]
2. [Step 2]

Shall I generate the code using this compliant pattern?"
```

### Example Refusal

**User:** "Import the PhotoCard from the photos feature into professionals"

**AI Response:**
```
"I cannot import from `app/photos/` into `app/professionals/` because
this violates the Feature Isolation standard.

**Why this matters:** Cross-feature imports create tight coupling.
Changing the photos feature would break the professionals feature.

**Recommended Fix:**
1. Move `PhotoCard` to `app/components/PhotoCard.tsx`
2. Update `app/photos/` to import from `app/components/`
3. Import from `app/components/` in `app/professionals/`

Shall I generate the code with PhotoCard in the shared components folder?"
```

### Self-Validation Checklist

Before finalizing any code generation:

```
□ Would this pass `npm run check:standards`?
□ Are there any layer violations?
□ Are there any cross-feature imports?
□ Are all types properly defined (no any)?
□ Are `api` client and `nav` helpers used?
□ Are all URLs in the allowed list or environment variables?
□ Does any new feature folder need a README?
```

---

## Summary

These standards exist to make our codebase:

| Goal | How We Achieve It |
|------|-------------------|
| **Predictable** | Same patterns everywhere |
| **Maintainable** | Changes don't cause ripple effects |
| **Testable** | Business logic isolated from infrastructure |
| **Secure** | No exposed secrets or vulnerabilities |
| **Collaborative** | Anyone can work on any part |
| **AI-Friendly** | Clear rules that AI assistants follow |

When in doubt:
1. **Ask** - The team is here to help
2. **Check existing code** - Follow established patterns
3. **Run the checks** - `npm run check:standards`
4. **Use AI assistants** - They're trained on these standards

---

**Version History:**
- 2.1.0 (2026-01-22) - Added 5 new automated checks: async/await, console.log, require(), client directive, README template
- 2.0.0 (2026-01-22) - Added Clean Architecture principles, component patterns, database standards
- 1.0.0 (2026-01-22) - Initial release

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## AI Behavior Directives

> **CRITICAL**: These rules are NON-NEGOTIABLE. Claude must follow them for EVERY code generation task.

### Before Generating ANY Code

1. **Identify the feature** — Which feature folder does this belong to?
2. **Check for isolation violations** — Will this import from another feature? If yes, STOP and refactor.
3. **Check the layer** — Interface, logic, or data? Never mix.
4. **Check for existing code** — Does `lib/` or `app/components/` already have this?

### AI Must REFUSE To Generate Code That:

**Architecture Violations (ERROR - blocks push):**
- ❌ Imports from one feature into another (e.g., `professionals/` → `photos/`)
- ❌ Imports from one API route into another (e.g., `api/professionals/` → `api/photos/`)
- ❌ Imports `lib/db` directly in UI components or pages
- ❌ Uses generic file names (`utils.ts`, `helpers.ts`, `misc.ts`)
- ❌ Uses React hooks without `'use client'` directive

**Code Quality Violations (WARNING - should fix):**
- ❌ Uses `any` type or `@ts-ignore` or `@ts-nocheck`
- ❌ Uses `.then()` promise chains instead of `async/await`
- ❌ Contains `console.log` statements (use proper error handling)
- ❌ Uses CommonJS `require()` instead of ES imports
- ❌ Uses raw `fetch()` for internal API calls (use `api` client)
- ❌ Uses hardcoded route paths (use `nav` helpers)
- ❌ Contains hardcoded URLs, IPs, or secrets (except allowed: schema.org, unsplash, xmlns, w3.org, localhost, example.com)

### Automated Standards Enforcement

All generated code MUST pass `npm run check:standards`. For detailed explanations of each standard with examples, see `docs/STANDARDS.md`.

This script enforces:

| Check | Rule | Severity |
|-------|------|----------|
| `no-generic-names` | No `utils.ts`, `helpers.ts`, `misc.ts` | ERROR |
| `layer-violation` | `app/` cannot import from `lib/db` directly | ERROR |
| `no-cross-feature-imports` | Features cannot import from other features | ERROR |
| `no-cross-api-imports` | API routes cannot import from other API routes | ERROR |
| `missing-use-client` | Components using hooks need `'use client'` | ERROR |
| `type-safety` | No `any`, `@ts-ignore`, `@ts-nocheck` | WARNING |
| `use-async-await` | Use `async/await` not `.then()` chains | WARNING |
| `no-console-log` | Remove `console.log` from production code | WARNING |
| `no-require-imports` | Use ES imports, not CommonJS `require()` | WARNING |
| `use-api-client` | Use `api` client, not raw `fetch('/api/...')` | WARNING |
| `use-nav-helpers` | Use `nav` helpers, not hardcoded paths | WARNING |
| `no-hardcoded-values` | No hardcoded URLs/IPs/secrets (with exceptions) | WARNING |
| `missing-readme` | Feature folders must have README.md | WARNING |
| `readme-missing-section` | Feature READMEs need required sections | WARNING |

**Before finalizing any code generation:**
```
ARCHITECTURE (ERROR - must fix):
□ Would this pass npm run check:standards?
□ Are there any layer violations?
□ Are there any cross-feature imports?
□ Does client component have 'use client' directive?

CODE QUALITY (WARNING - should fix):
□ Are all types properly defined (no any)?
□ Using async/await (not .then() chains)?
□ No console.log statements?
□ Using ES imports (not require())?
□ Using api client (not raw fetch)?
□ Using nav helpers (not hardcoded paths)?
□ Are all URLs in the allowed list or config?
```

### AI Must ALWAYS:

- ✅ Ask clarifying questions if the request would violate standards
- ✅ Suggest extracting shared code to `app/components/` or `lib/` when needed
- ✅ Propose the correct location before writing code
- ✅ Use existing patterns from the codebase
- ✅ Generate types for all data structures
- ✅ **Generate tests for ALL code written** (see Test Generation Rule below)
- ✅ **Generate documentation for ALL features built** (see Documentation Rule below)
- ✅ **Keep documentation and tests in sync with code changes** (see below)

### Test Generation Rule (CRITICAL)

**Every code generation task MUST include corresponding unit tests.**

This is NON-NEGOTIABLE. When generating code, Claude must:

1. **Create test file alongside the code:**
   - Component `app/components/Foo.tsx` → Test `tests/app/components/Foo.test.tsx`
   - Service `lib/services/bar.ts` → Test `tests/lib/services/bar.test.ts`
   - API route `app/api/baz/route.ts` → Test `tests/app/api/baz.test.ts`
   - Utility `lib/utils/qux.ts` → Test `tests/lib/utils/qux.test.ts`

2. **Test coverage requirements:**
   - Test all exported functions/components
   - Test happy path AND error cases
   - Test edge cases (empty inputs, null values, etc.)
   - Mock external dependencies (database, APIs, etc.)

3. **Test file structure:**
   ```typescript
   /**
    * Unit Tests for [file path]
    */
   import { functionName } from '@/path/to/module';

   // Mock dependencies
   jest.mock('@/lib/db', () => ({ ... }));

   describe('FunctionName', () => {
     it('handles normal input correctly', () => { ... });
     it('handles edge case X', () => { ... });
     it('throws error on invalid input', () => { ... });
   });
   ```

4. **What to test by code type:**

   | Code Type | What to Test |
   |-----------|--------------|
   | **Components** | Renders correctly, props work, events fire, conditional rendering |
   | **Services** | Business logic, data transformations, error handling |
   | **API Routes** | Response format, status codes, validation, error responses |
   | **Utilities** | All input/output combinations, edge cases |
   | **Hooks** | State changes, effect triggers, return values |

5. **Testing patterns to use:**
   ```typescript
   // React components
   import { render, screen, fireEvent } from '@testing-library/react';
   
   // API routes
   import { NextRequest } from 'next/server';
   import { GET, POST } from '@/app/api/route';
   
   // Services with DB
   jest.mock('@/lib/db', () => ({
     db: { prepare: jest.fn().mockReturnValue({ all: jest.fn(), get: jest.fn() }) }
   }));
   ```

**Checklist before completing any task:**
```
□ Did I create/update tests for the code I wrote?
□ Do tests cover happy path and error cases?
□ Are external dependencies properly mocked?
□ Do all tests pass? (npm test)
```

### Documentation Rule (CRITICAL)

**Every feature MUST include comprehensive documentation.**

This is NON-NEGOTIABLE. When building a feature, Claude must:

1. **Create a README.md in the feature folder:**
   - Feature `app/photos/` → `app/photos/README.md`
   - Feature `app/professionals/` → `app/professionals/README.md`
   - API route group `app/api/contact/` → `app/api/contact/README.md`

2. **Required README sections:**

   ```markdown
   # Feature Name

   Brief description of what this feature does.

   ## Responsibilities

   **What this feature handles:**
   - Responsibility 1
   - Responsibility 2

   **What this feature does NOT handle:**
   - Delegated responsibility 1
   - Delegated responsibility 2

   ## Key Components

   | Component | File | Purpose |
   |-----------|------|---------|
   | ComponentName | `ComponentName.tsx` | What it does |

   ## Routes (if applicable)

   | Route | File | Description |
   |-------|------|-------------|
   | `/path` | `page.tsx` | What the page shows |

   ## Data Flow

   ```
   Source → Processing → Output
   ```

   ## Usage Examples

   ```typescript
   // Example code showing how to use this feature
   ```
   ```

3. **For API routes, also document:**
   - Request/response formats
   - Query parameters
   - Error responses
   - Authentication requirements

4. **For components, also document:**
   - Props interface
   - Usage examples
   - State management
   - Event handlers

5. **Update project-level docs:**
   - Add new features to `README.md` project structure
   - Update `ARCHITECTURE.md` if architecture changes
   - Add types to `lib/api/types.ts` for API routes

**Documentation checklist:**
```
□ Feature README.md created with all required sections?
□ Responsibilities section clearly defines scope?
□ Key Components table lists all files?
□ Routes documented (if applicable)?
□ Data flow diagram included?
□ Usage examples provided?
□ Project README.md updated?
□ ARCHITECTURE.md updated (if needed)?
```

### Documentation & Test Sync Rule (CRITICAL)

**Every code change must include updates to related documentation and tests.**

When making code changes, Claude must:

1. **Update Documentation** — If the change affects:
   - Project structure → Update `README.md` and `ARCHITECTURE.md`
   - API routes → Update `lib/api/config.ts` and route README files
   - Navigation → Update `lib/navigation/routes.ts`
   - Database schema → Update `lib/db/schema.ts` comments and `ARCHITECTURE.md`
   - New features → Add feature README in the feature folder
   - Commands/scripts → Update `README.md` Commands section

2. **Update Tests** — If the change affects:
   - Architecture (new folders, imports) → Update `tests/architecture.test.ts`
   - New components → Consider adding component tests
   - New services → Consider adding service tests

3. **Update Type Definitions** — If the change affects:
   - API responses → Update `lib/api/types.ts`
   - Database queries → Update `lib/db/types.ts`
   - Shared interfaces → Update relevant type files

4. **Update References** — If renaming or moving files:
   - Find all imports using the old path
   - Update all references to the new path
   - Update documentation mentioning the old path

**Checklist after every code change:**
```
□ Does README.md need updating?
□ Does ARCHITECTURE.md need updating?
□ Do any tests need updating?
□ Do any type definitions need updating?
□ Are there stale references to update?
```

**Example:**
```
User: "Add a new /api/bookings endpoint"

Claude: 
1. Create app/api/bookings/route.ts
2. Add route to lib/api/config.ts
3. Add types to lib/api/types.ts
4. Add api.bookings methods to lib/api/client.ts
5. Update README.md project structure
6. Update ARCHITECTURE.md file structure
7. Create app/api/bookings/README.md
```

---

### When User Requests Violating Code

If a user asks for code that violates these standards, Claude must:

1. **Explain** why the request violates standards
2. **Propose** a compliant alternative
3. **Only proceed** with the compliant approach

Example:
```
User: "Add a helper function to professionals/ that uses the photo formatting from photos/"

Claude: "I can't import from photos/ into professionals/ as that violates feature isolation. 
Instead, I'll:
1. Extract the photo formatting logic to lib/services/photoFormatting.ts
2. Update photos/ to import from there
3. Have professionals/ also import from there

Should I proceed with this approach?"
```

---

## Team Standards

> These rules apply to all code generation and modifications. Non-negotiable.

### Core Principles

1. **Single Responsibility** — Every file, function, component does ONE thing. If you say "and" when describing it, split it up.

2. **Three-Layer Architecture** — Every feature has exactly three layers:
   ```
   interface/  → UI components, API endpoints (app/, app/api/)
   logic/      → Business rules, validation (lib/services/, lib/api/)
   data/       → Database operations (lib/db/, lib/services/)
   ```

3. **Feature Isolation** — Features cannot import from other features. Ever.
   ```
   app/
   ├── professionals/     # Feature A
   │   └── ❌ Cannot import from photos/ or styles/
   ├── photos/            # Feature B  
   │   └── ❌ Cannot import from professionals/ or styles/
   ├── api/
   │   ├── professionals/ # ❌ Cannot import from api/photos/
   │   └── photos/        # ❌ Cannot import from api/professionals/
   └── components/        # ✅ SHARED - any feature can import
   ```
   **If two features need the same code**: Extract to `app/components/` or `lib/`

4. **Human Readable** — Non-technical team members must understand file names and structure. No `utils.js`, no `handleClick`, no clever code.

5. **Shareable by Default** — No hardcoded values, no hidden dependencies, everything explicit and configurable.

### Naming Conventions

| Type | Pattern | Examples |
|------|---------|----------|
| Functions | verb + noun | `createPhoto`, `validateContact`, `fetchProfessional` |
| Files | descriptive content | `photoGallery.tsx`, `chatService.ts` |
| Folders | domain-based | `professionals/`, `photos/`, `contact/` |

**Never use**: `utils.ts`, `helpers.ts`, `misc/`, `handleClick`, `processData`

### Before Writing Code

1. What ONE thing does this code do?
2. Which layer: interface, logic, or data?
3. Which folder does it belong in?
4. Does similar code already exist in `lib/`?

### Code Checklist

- [ ] Single clear purpose per file
- [ ] Descriptive names (no generic utils)
- [ ] No hardcoded values
- [ ] Layers not mixed (UI doesn't touch DB directly)
- [ ] Types defined for all data structures

### Anti-Patterns — Never Do These

| Pattern | Fix |
|---------|-----|
| God file that does everything | Split into layers |
| Growing `utils.ts` | Specific files: `dateFormat.ts`, `priceCalc.ts` |
| UI component with DB calls | Use service layer |
| Implicit dependencies | Import explicitly |
| Clever compact code | Boring obvious code |
| **Cross-feature imports** | Extract shared code to `app/components/` or `lib/` |
| **API routes importing other API routes** | Extract shared logic to `lib/services/` |

### Commit Messages

```
[feature] verb: description

[photos] add: filtering by style
[chat] fix: message ordering
[lib] refactor: extract validation utilities
```

---

## Project Overview

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
npm run build            # Create production build (includes Houzz code check)
npm run start            # Run production server

# Linting & Checks
npm run lint             # Run ESLint
npm run check:no-houzz   # Verify no Houzz/IVY ecosystem code is included

# Git Hooks
npm run hooks:install    # Install git hooks (auto-runs on npm install)

# Full Setup (install + db init + hooks)
npm run setup            # Run after cloning if npm install didn't auto-init
```

## Troubleshooting

### "no such table: photos" error
The database wasn't initialized. Run:
```bash
npm run db:init
```

### Database corruption or stale data
Reset the database completely:
```bash
npm run db:reset
```

### Port 3000 already in use
Kill the existing process:
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Image 404 errors
The database may have stale image URLs. Reset with fresh data:
```bash
npm run db:reset
```

### better-sqlite3 compilation errors
This native module requires build tools. On macOS:
```bash
xcode-select --install
```

### Build fails with "Houzz/IVY ecosystem code detected"
The build includes a pre-check that scans for Houzz and IVY-related code patterns. If you see this error:
1. Run `npm run check:no-houzz` to see specific violations
2. Remove or replace any `@houzz/*` or `@ivy/*` package imports
3. Replace `houzz.com` or `ivy.co` URLs with appropriate alternatives
4. The check script is at `scripts/check-no-houzz-code.ts` - see allowlist patterns there

### Push blocked with "Houzz/IVY namespace detected"
Git hooks prevent pushing to Houzz or IVY-owned GitHub namespaces. If you see this error:
1. You're trying to push to a forbidden organization (github.com/houzz/*, github.com/ivy/*, etc.)
2. Use a different remote: `git remote set-url origin git@github.com:onemrkarthik/ai-for-all.git`
3. Hooks are installed via `npm run hooks:install` (auto-runs on npm install)

## Architecture

For detailed architecture documentation, see `ARCHITECTURE.md`.

### Key Directory Structure

```
app/                          # INTERFACE LAYER
├── api/                      # Backend API routes
│   ├── contact/              # Contact form endpoints
│   ├── feed/                 # Photo feed endpoints
│   ├── photos/               # Photo CRUD endpoints
│   └── professionals/        # Professional endpoints
├── components/               # React UI components
│   ├── PhotoGallery.tsx      # Gallery display
│   ├── PhotoModal.tsx        # Photo detail modal
│   └── ContactPane.tsx       # Contact form UI
├── professionals/[id]/       # Professional profile pages
├── styles/[style]/           # Kitchen style landing pages
└── photos/[slug]/            # Photo detail pages

lib/                          # LOGIC + DATA LAYERS
├── api/                      # Type-safe API client (logic)
├── navigation/               # Type-safe routing (logic)
├── services/                 # Business logic + queries
│   ├── photos.ts             # Photo operations
│   └── chat.ts               # Chat operations
├── db/                       # DATA LAYER
│   ├── index.ts              # Database connection
│   └── schema.ts             # Schema definitions
└── ai.ts                     # Gemini AI integration

scripts/                      # Build & setup scripts
```

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
- `GOOGLE_API_KEY` - Google Gemini API key (get one at https://aistudio.google.com/apikey)

---

## AI Quick Reference Card

**Copy-paste checklist before generating code:**

```
LOCATION CHECK:
□ Feature folder: ________________
□ Layer: [ ] interface  [ ] logic  [ ] data
□ File name (no utils/helpers): ________________

IMPORT CHECK:
□ Importing from another feature? → STOP, extract to shared
□ Importing from another API route? → STOP, extract to lib/services
□ Importing lib/db in UI? → STOP, use service layer

PATTERN CHECK:
□ Using api client (not raw fetch)?
□ Using nav helpers (not hardcoded paths)?
□ Types defined for all data?
□ No any/@ts-ignore?

TEST CHECK (REQUIRED):
□ Test file created? tests/[mirror path].test.ts(x)
□ Happy path tested?
□ Error cases tested?
□ Dependencies mocked?
□ All tests pass?

DOCUMENTATION CHECK (REQUIRED):
□ Feature README.md created/updated?
□ Responsibilities section complete?
□ Key Components table complete?
□ Usage examples included?
□ Project README.md updated?
```

**Import Rules Visual:**
```
✅ CAN IMPORT                    ❌ CANNOT IMPORT
─────────────────────────────    ─────────────────────────────
feature → app/components/        feature → other feature
feature → lib/*                  api/X → api/Y
api → lib/services/*             component → lib/db
component → lib/api/*            page → lib/db
```

**Shared Code Destinations:**
```
Need to share...        Put it in...
─────────────────────   ─────────────────────
UI components        →  app/components/
Business logic       →  lib/services/
API client code      →  lib/api/
Type definitions     →  lib/types/ or feature/types.ts
Utilities            →  lib/[specificName].ts
Constants            →  lib/constants/
```

**Post-Change Documentation Sync:**
```
□ README.md updated?
□ ARCHITECTURE.md updated?
□ API config/types updated?
□ Tests updated?
□ Stale references fixed?
```

**Standards Validation (REQUIRED):**
```
Before committing, verify code passes: npm run check:standards

Allowed URL patterns (won't trigger warnings):
- schema.org (JSON-LD structured data)
- unsplash.com / images.unsplash.com (image CDN)
- xmlns / w3.org (XML/SVG namespaces)
- example.com (placeholder URLs)
- localhost (development)
```

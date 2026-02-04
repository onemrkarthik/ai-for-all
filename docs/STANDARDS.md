# Engineering Standards & Architecture Guide

**Version:** 3.0.0  
**Status:** Enforced  
**Last Updated:** 2026-02-03  
**Classification:** Industry Gold Standard  
**References:** Google (TypeScript), Airbnb (React), Clean Architecture, AWS Well-Architected

This document defines the engineering standards for full-stack development. It synthesizes industry-best architectural patterns with operational enforcement to ensure scalability, maintainability, and developer velocity. This guide is designed to be portable across projects and organizations.

---

## Table of Contents

1. [Engineering Philosophy](#1-engineering-philosophy)
2. [Quick Reference](#2-quick-reference)
3. [Core Architectural Principles](#3-core-architectural-principles)
4. [Workflow & Enforcement](#4-workflow--enforcement)
5. [Project Structure & Naming](#5-project-structure--naming)
6. [Frontend Standards (React/Next.js)](#6-frontend-standards-reactnextjs)
7. [Backend Standards (TypeScript/Node)](#7-backend-standards-typescriptnode)
8. [Database Standards](#8-database-standards)
9. [Testing Standards](#9-testing-standards)
10. [Security Standards](#10-security-standards)
11. [Observability Standards](#11-observability-standards)
12. [Performance Standards](#12-performance-standards)
13. [API Design Standards](#13-api-design-standards)
14. [Operational Safety](#14-operational-safety)
15. [Engineering Lifecycle](#15-engineering-lifecycle)
16. [Dependency Management](#16-dependency-management)
17. [Standards Maturity Model](#17-standards-maturity-model)
18. [Anti-Patterns Gallery](#18-anti-patterns-gallery)
19. [Architecture Decision Records](#19-architecture-decision-records)
20. [Exception Process](#20-exception-process)
21. [Standards Evolution (RFC Process)](#21-standards-evolution-rfc-process)
22. [Lessons from Production](#22-lessons-from-production)
23. [Metrics & Measurement](#23-metrics--measurement)
24. [Fixing Violations](#24-fixing-violations)
25. [For AI Assistants](#25-for-ai-assistants)

---

## 1. Engineering Philosophy

Standards without philosophy create cargo-cult compliance. This section defines the foundational beliefs that drive all other decisions.

### 1.1 Core Beliefs

**1. Optimize for Change, Not Perfection**

Software is never finished. We optimize for how quickly we can safely modify the system, not for theoretical purity. Every abstraction must earn its complexity by enabling faster future changes.

**2. Make the Right Thing the Easy Thing**

If engineers consistently work around a standard, the standard is wrong. We design workflows where compliance is the path of least resistance.

**3. Explicit Over Implicit**

We prefer verbose clarity over clever brevity. Code is read 10x more than it's written. A new engineer should understand intent without tribal knowledge.

**4. Boundaries Enable Autonomy**

Strict interfaces between components allow teams to move independently. We accept duplication at boundaries to preserve isolation.

**5. Production is the Only Truth**

Local tests and staging environments lie. We design for observability and progressive rollout because production will always surprise us.

**6. Automate Over Debate**

If a standard can be enforced automatically, it must be. Human review time is precious and should focus on design and logic, not formatting and import order.

### 1.2 Trade-off Framework

When standards conflict, we prioritize in this order:

| Priority | Concern | Question to Ask |
|----------|---------|-----------------|
| 1 | **Safety** | Will this hurt users or the business? |
| 2 | **Correctness** | Does it work as specified? |
| 3 | **Clarity** | Can others understand and modify it? |
| 4 | **Performance** | Is it fast enough? |
| 5 | **Elegance** | Is it beautiful? |

We never sacrifice a higher priority for a lower one.

### 1.3 Decision-Making Principles

- **Reversible decisions**: Move fast, iterate
- **Irreversible decisions**: Document thoroughly, get broad input
- **When uncertain**: Prefer the option that's easier to change later
- **When debating style**: Defer to automation (linters, formatters)

---

## 2. Quick Reference

### 2.1 Standards Severity Levels

| Severity | Meaning | Enforcement |
|----------|---------|-------------|
| **ERROR** | Code cannot be pushed until fixed | Blocks CI/CD |
| **WARNING** | Code can be pushed, should be fixed | Tracked in metrics |
| **INFO** | Recommendation, not enforced | Documentation only |

### 2.2 Quick Reference Table

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
| Use API client | Use `api.resource.get()` not `fetch('/api/...')` | WARNING |
| Use nav helpers | Use `nav.home.index()` not `href="/"` | WARNING |
| No hardcoded values | URLs and secrets go in environment variables | WARNING |
| Feature READMEs | Each feature folder needs a README.md | WARNING |
| README template | Feature READMEs need required sections | WARNING |
| Error boundaries | Every route segment needs error handling | WARNING |
| Test coverage | New code requires tests | WARNING |

---

## 3. Core Architectural Principles

We follow a **Clean Architecture** approach. The goal is to create a system where business logic is independent of the UI, database, and external frameworks.

### 3.1 The Dependency Rule

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

### 3.2 Why This Matters

| Without Clean Architecture | With Clean Architecture |
|---------------------------|------------------------|
| Changing the database breaks the UI | Database changes are isolated |
| UI code is full of SQL queries | UI only knows about data shapes |
| Testing requires a real database | Business logic is easily unit tested |
| One developer's change breaks another's | Changes are localized |

### 3.3 Feature Isolation (Vertical Slices)

**Rule:** Features cannot import from other features.

**Why:** Prevents "Spaghetti Code" where changing one module breaks another.

```
app/
├── feature-a/         ❌ Cannot import from feature-b/, feature-c/, etc.
├── feature-b/         ❌ Cannot import from feature-a/, feature-c/, etc.
├── feature-c/         ❌ Cannot import from feature-a/, feature-b/, etc.
├── api/
│   ├── feature-a/     ❌ Cannot import from api/feature-b/, api/feature-c/
│   ├── feature-b/     ❌ Cannot import from api/feature-a/
│   └── feature-c/     ❌ Cannot import from api/feature-a/
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

## 4. Workflow & Enforcement

We rely on **automation over debate**. Standards are checked at multiple stages.

### 4.1 Enforcement Pipeline

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

### 4.2 What Gets Checked When

| Check | Trigger | What It Does | Failure Action |
|-------|---------|--------------|----------------|
| ESLint + Prettier | Commit | Fixes formatting, catches syntax | Auto-fixes most issues |
| TypeScript | Push | Ensures types are correct | **Blocks push** |
| Standards Check | Push | Verifies architectural rules | **Blocks push** (errors) |
| Architecture Tests | Push | Tests file structure and imports | **Blocks push** |
| Security Scan | Push | Checks for vulnerabilities | **Blocks push** (critical) |
| GitHub Actions | PR/Push | Runs all checks in CI | **Blocks merge** |

### 4.3 Running Checks Locally

```bash
# Run all checks (same as pre-push)
npm run type-check && npm run check:standards && npm test

# Run individual checks
npm run type-check        # TypeScript errors
npm run check:standards   # Architectural standards
npm test                  # All tests including architecture
npm run lint              # ESLint (also auto-fixes)
npm run security:check    # Security vulnerability scan
```

---

## 5. Project Structure & Naming

### 5.1 The "No Utils" Rule

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

### 5.2 Directory Layout

We use a **Domain-Driven** structure with clear layer separation:

```
app/                          # INTERFACE LAYER
├── api/                      # Backend API routes
│   ├── v1/                   # API version 1
│   │   ├── feature-a/        # Feature A API
│   │   ├── feature-b/        # Feature B API
│   │   └── feature-c/        # Feature C API
│   └── health/               # Health check endpoint
├── components/               # SHARED UI components
├── feature-a/                # Feature A pages
├── feature-b/                # Feature B pages
├── feature-c/                # Feature C pages
├── layout.tsx                # Root layout
├── page.tsx                  # Home page
├── error.tsx                 # Root error boundary
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
│   ├── featureA.ts           # Feature A operations
│   ├── featureB.ts           # Feature B operations
│   └── featureC.ts           # Feature C operations
├── db/                       # Database layer (Data)
│   ├── connection.ts         # DB connection
│   ├── schema.ts             # Schema definitions
│   ├── migrations/           # Database migrations
│   └── types.ts              # Row type interfaces
├── errors/                   # Custom error classes
│   ├── ApiError.ts           # API error class
│   ├── ValidationError.ts    # Validation error class
│   └── index.ts              # Error exports
├── types/                    # Shared type definitions
│   ├── domain.ts             # Domain types
│   └── api.ts                # API types
└── config/                   # Configuration
    ├── env.ts                # Environment variables
    └── constants.ts          # Application constants

docs/                         # Documentation
├── adr/                      # Architecture Decision Records
├── runbooks/                 # Operational runbooks
└── templates/                # Document templates

scripts/                      # Build and utility scripts
├── check-standards.ts        # Standards enforcement
└── generate-api-client.ts    # API client generation

tests/                        # Test files
├── unit/                     # Unit tests
├── integration/              # Integration tests
├── e2e/                      # End-to-end tests
└── architecture/             # Architecture tests
```

### 5.3 Feature Folder Structure

Each feature folder should follow this structure:

```
app/feature-name/
├── README.md                 # Feature documentation (REQUIRED)
├── page.tsx                  # Main page
├── layout.tsx                # Feature layout (if needed)
├── loading.tsx               # Loading state
├── error.tsx                 # Error boundary
├── components/               # Feature-specific components
│   ├── FeatureCard.tsx
│   └── FeatureList.tsx
├── hooks/                    # Feature-specific hooks
│   └── useFeatureData.ts
├── types.ts                  # Feature-specific types
└── [id]/                     # Dynamic routes
    └── page.tsx
```

### 5.4 Feature README Template

Every feature folder must have a `README.md` with these sections:

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

## Feature Flags

| Flag | Description | Default |
|------|-------------|---------|
| `FEATURE_NEW_UI` | Enable new UI design | `false` |

## Monitoring

- Dashboard: [link to monitoring dashboard]
- Key alerts: [list of alerts]

## Runbook

### Common Issues

| Issue | Solution |
|-------|----------|
| Data not loading | Check API health, verify auth token |

### Escalation Path

1. On-call engineer
2. Feature team lead
3. Platform team
```

---

## 6. Frontend Standards (React/Next.js)

*Based on Airbnb React Style Guide & Next.js Best Practices*

### 6.1 Component Design Patterns

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

### 6.2 Navigation & API Integration

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

### 6.3 Context & State Management

**Pattern:** Split contexts to prevent unnecessary re-renders.

```tsx
// ✅ Separate state from actions
const FeatureStateContext = createContext<State>({});
const FeatureActionsContext = createContext<Actions>({});

// Components using only actions don't re-render on state changes
export function useFeatureActions() {
  return useContext(FeatureActionsContext);
}
```

### 6.4 Error Boundaries

**Rule:** Every route segment must have an `error.tsx` boundary.

```tsx
// app/feature/error.tsx
'use client';

export default function FeatureError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    logError(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 7. Backend Standards (TypeScript/Node)

*Based on Google TypeScript Style Guide*

### 7.1 Layer Separation

**Rule:** UI Code (`app/`) cannot import `lib/db`.

**Why:** The frontend should communicate with the backend via APIs/Services. This allows:
- Swapping databases without touching UI code
- Unit testing business logic without a database
- Clear ownership boundaries

**Bad:**
```tsx
// ❌ app/page.tsx - UI directly accessing database
import { db } from '@/lib/db';

export default function Page() {
  const items = db.prepare('SELECT * FROM items').all();
  return <List items={items} />;
}
```

**Good:**
```tsx
// ✅ app/page.tsx - UI uses service layer
import { getItems } from '@/lib/services/items';

export default function Page() {
  const items = getItems({ offset: 0, limit: 20 });
  return <List items={items} />;
}
```

### 7.2 Service Layer Patterns

Services should be:
- **Stateless**: No instance variables, pure functions preferred
- **Transaction-scoped**: One service call = one transaction
- **Domain-focused**: Named after business capabilities, not technical operations

```typescript
// ✅ Good: Domain-focused, returns domain types
export async function getItemWithDetails(id: number): Promise<ItemWithDetails> {
  return db.transaction(() => {
    const item = getItem(id);
    const details = getDetails(item.detailsId);
    return { ...item, details };
  })();
}

// ❌ Bad: Technical operation, leaks DB details
export function selectItemJoinDetails(id: number) {
  return db.prepare('SELECT i.*, d.* FROM items i JOIN...').get(id);
}
```

### 7.3 TypeScript Patterns

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

### 7.4 Error Handling

**Rule:** Use custom error classes with typed error codes.

```typescript
// lib/errors/ApiError.ts
export type ErrorCode = 
  | 'VALIDATION_ERROR'    // 400 - client can fix
  | 'AUTHENTICATION_ERROR' // 401 - re-auth needed
  | 'AUTHORIZATION_ERROR'  // 403 - insufficient permissions
  | 'NOT_FOUND'           // 404 - resource doesn't exist
  | 'CONFLICT'            // 409 - state conflict
  | 'RATE_LIMITED'        // 429 - back off
  | 'INTERNAL_ERROR';     // 500 - our fault, alert

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  isRetryable(): boolean {
    return this.code === 'RATE_LIMITED' || this.status >= 500;
  }
}

// Usage
try {
  const item = await api.items.get(123);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 404) return notFound();
    if (error.isRetryable()) return retry();
  }
  throw error;
}
```

### 7.5 Async/Await

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

## 8. Database Standards

### 8.1 Type-Safe Queries

**Rule:** All database queries must use typed row interfaces.

```typescript
// lib/db/types.ts - Define row shapes
export interface ItemRow {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// lib/services/items.ts - Use the types
import type { ItemRow } from '@/lib/db/types';

export function getItemById(id: number): ItemRow | undefined {
  return db.prepare(
    'SELECT * FROM items WHERE id = ?'
  ).get(id) as ItemRow | undefined;
}
```

### 8.2 Schema Management

| Practice | Rule |
|----------|------|
| Schema Location | All definitions in `lib/db/schema.ts` |
| Migrations | Never edit a migration after merge; create a new one |
| Foreign Keys | Always define with proper CASCADE rules |
| Indexes | Index foreign keys and columns in WHERE clauses |
| Naming | Use snake_case for columns, singular for tables |

### 8.3 Query Patterns

```typescript
// ✅ Use prepared statements (automatic with better-sqlite3)
const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
const item = stmt.get(id);

// ✅ Use transactions for multi-table operations
db.transaction(() => {
  db.prepare('INSERT INTO items ...').run(...);
  db.prepare('INSERT INTO item_details ...').run(...);
})();

// ✅ Use parameterized queries - NEVER string concatenation
const item = db.prepare('SELECT * FROM items WHERE name = ?').get(name);

// ❌ NEVER do this - SQL injection vulnerability
const item = db.prepare(`SELECT * FROM items WHERE name = '${name}'`).get();
```

### 8.4 Migration Rules

1. Migrations are immutable after merge
2. One migration per logical change
3. Include both `up` and `down` functions
4. Test rollback in staging before production
5. Large data migrations run as background jobs

---

## 9. Testing Standards

### 9.1 Test Pyramid

| Level | Target | Coverage Goal | Speed |
|-------|--------|---------------|-------|
| Unit | Pure functions, services | 80%+ | < 1ms each |
| Integration | API routes, DB queries | Critical paths | < 100ms each |
| E2E | User journeys | Happy paths only | < 10s each |

### 9.2 What to Test Where

| Test Type | Location | What to Test |
|-----------|----------|--------------|
| Unit tests | `tests/unit/` | Business logic in `lib/services/` |
| Integration tests | `tests/integration/` | API routes with test database |
| E2E tests | `tests/e2e/` | Critical user flows only |
| Architecture tests | `tests/architecture/` | File structure, imports, patterns |

### 9.3 Mocking Rules

- Mock at architectural boundaries only (DB, external APIs)
- Never mock what you own—test it
- Use dependency injection to enable testing
- Prefer fakes over mocks for complex dependencies

```typescript
// ✅ Good: Mock at boundary
const mockDb = createMockDatabase();
const service = createItemService(mockDb);
const result = await service.getItem(123);

// ❌ Bad: Mock internal implementation
jest.mock('@/lib/services/items', () => ({
  getItem: jest.fn().mockResolvedValue({ id: 123 })
}));
```

### 9.4 Test Naming Convention

```typescript
// Pattern: describe('unit under test', () => { it('should [expected behavior] when [condition]') })

describe('ItemService', () => {
  describe('getItem', () => {
    it('should return item when item exists', async () => {
      // ...
    });

    it('should throw NOT_FOUND when item does not exist', async () => {
      // ...
    });

    it('should throw VALIDATION_ERROR when id is negative', async () => {
      // ...
    });
  });
});
```

### 9.5 Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Line coverage | 70% | 85% |
| Branch coverage | 60% | 80% |
| Function coverage | 80% | 90% |

**Exceptions:** Generated code, type definitions, and configuration files are excluded from coverage requirements.

---

## 10. Security Standards

### 10.1 Input Validation

**Rule:** Validate at API boundary using schema validation (Zod recommended).

```typescript
// lib/api/schemas/item.ts
import { z } from 'zod';

export const CreateItemSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
});

// app/api/v1/items/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const validated = CreateItemSchema.parse(body); // Throws on invalid
  return createItem(validated);
}
```

### 10.2 Authentication & Authorization

| Pattern | Implementation |
|---------|----------------|
| Auth checks | Use middleware, not per-route logic |
| RBAC | Implement typed permission checks |
| Session cookies | Use SameSite=Strict, HttpOnly, Secure |
| Tokens | Short-lived access tokens, refresh via secure cookie |

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session');
  
  if (!token && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

### 10.3 Security Headers

Required headers (set via middleware or next.config.js):

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Strict policy | Prevent XSS |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Strict-Transport-Security` | `max-age=31536000` | Force HTTPS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer info |

### 10.4 Secrets Management

| Environment | Storage | Access |
|-------------|---------|--------|
| Local | `.env.local` (gitignored) | Direct |
| CI/CD | GitHub Secrets | Injected |
| Production | Vault/AWS Secrets Manager | Runtime fetch |

**Never commit secrets.** Use `git-secrets` or similar to prevent accidental commits.

---

## 11. Observability Standards

### 11.1 Structured Logging

**Rule:** Use structured JSON logging, not console.log.

```typescript
// lib/logging/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// Usage
logger.info({ userId, action: 'item_created', itemId }, 'User created item');
logger.error({ err, requestId }, 'Failed to process request');
```

### 11.2 Log Levels

| Level | Use Case | Alerts |
|-------|----------|--------|
| `error` | Failures requiring attention | Yes |
| `warn` | Degraded performance, potential issues | Monitor |
| `info` | Audit trail, business events | No |
| `debug` | Development troubleshooting | No (dev only) |

### 11.3 Correlation IDs

**Rule:** Include correlation IDs across service boundaries.

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);
  
  return response;
}
```

### 11.4 Metrics

Required metrics for all API routes (RED method):

| Metric | Type | Purpose |
|--------|------|---------|
| `http_requests_total` | Counter | Request rate |
| `http_request_duration_seconds` | Histogram | Latency distribution |
| `http_requests_errors_total` | Counter | Error rate |

### 11.5 Tracing

| Rule | Implementation |
|------|----------------|
| Propagate trace context | Through all async operations |
| Instrument | Database queries, external API calls |
| Sampling | 1-5% production, 100% staging |

---

## 12. Performance Standards

### 12.1 Web Vitals Targets

| Metric | Target (P75) | Maximum (P95) |
|--------|--------------|---------------|
| LCP (Largest Contentful Paint) | < 2.5s | < 4s |
| INP (Interaction to Next Paint) | < 200ms | < 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.25 |
| TTFB (Time to First Byte) | < 800ms | < 1.8s |

### 12.2 Bundle Budgets

| Asset | Budget (gzipped) |
|-------|------------------|
| Initial JS | < 200KB |
| Per-route JS | < 50KB |
| Initial CSS | < 50KB |
| Total page weight | < 1MB |

### 12.3 Image Standards

| Rule | Implementation |
|------|----------------|
| Format | WebP/AVIF with JPEG fallback |
| Lazy loading | Below-the-fold images |
| Responsive | Use `srcset` for multiple sizes |
| Dimensions | Always specify width/height |

### 12.4 API Response Time Targets

| Percentile | Target |
|------------|--------|
| P50 | < 100ms |
| P95 | < 500ms |
| P99 | < 1s |

### 12.5 Database Query Limits

| Metric | Limit |
|--------|-------|
| Query execution time | < 100ms |
| Rows returned per query | < 1000 (paginate beyond) |
| Queries per request | < 10 (batch/join instead) |

---

## 13. API Design Standards

### 13.1 Versioning Strategy

**Strategy:** URL Path Versioning

```
/api/v1/items      # Current version
/api/v2/items      # New version with breaking changes
```

**Version Support Policy:**
- Support N-1 versions minimum (current + previous)
- Deprecation notice: 6 months before removal
- Sunset header on deprecated versions

### 13.2 Breaking vs Non-Breaking Changes

| Breaking Change (requires new version) | Non-Breaking (same version) |
|---------------------------------------|----------------------------|
| Removing a field from response | Adding optional fields |
| Changing field type | Adding new endpoints |
| Changing validation rules (stricter) | Relaxing validation |
| Removing an endpoint | Adding new query parameters |
| Changing error response format | Adding new error codes |

### 13.3 Response Format

```typescript
// Success response
{
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO8601"
  }
}

// Error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [ ... ]
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO8601"
  }
}

// Paginated response
{
  "data": [ ... ],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 150,
    "hasMore": true
  },
  "meta": { ... }
}
```

### 13.4 HTTP Status Codes

| Code | When to Use |
|------|-------------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) |
| 400 | Invalid request body/params |
| 401 | Missing or invalid authentication |
| 403 | Valid auth but insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate) |
| 422 | Valid syntax but semantic error |
| 429 | Rate limited |
| 500 | Server error (our fault) |
| 503 | Service unavailable (temporary) |

---

## 14. Operational Safety

### 14.1 No Hardcoded Values

**Rule:** URLs, secrets, and configuration must be environment variables.

**Bad:**
```typescript
// ❌ Hardcoded values
const API_URL = 'https://api.production.com';
const API_KEY = 'sk-1234567890abcdef';
```

**Good:**
```typescript
// ✅ Environment variables with validation
import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.string().url(),
  API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
});

export const env = envSchema.parse(process.env);
```

**Allowed Hardcoded URLs:**
- `schema.org` - SEO structured data
- `localhost` - Development
- `example.com` - Documentation placeholders
- W3C/standards body URLs

### 14.2 Feature Flags

**Rule:** New features behind flags, progressive rollout.

```typescript
// lib/features/flags.ts
export const flags = {
  NEW_CHECKOUT_FLOW: process.env.FLAG_NEW_CHECKOUT === 'true',
  EXPERIMENTAL_SEARCH: process.env.FLAG_EXPERIMENTAL_SEARCH === 'true',
};

// Usage
if (flags.NEW_CHECKOUT_FLOW) {
  return <NewCheckout />;
}
return <LegacyCheckout />;
```

### 14.3 Deployment Windows

| Allowed | Forbidden |
|---------|-----------|
| Mon-Thu, 9am-3pm local | Fridays |
| | Weekends |
| | Holidays |
| | Day before major events |

**Exception:** Critical security patches can deploy anytime with approval.

### 14.4 Rollback Criteria

Automatic rollback triggers:
- Error rate increase > 0.1%
- P95 latency increase > 20%
- Any critical alert firing
- Customer-reported P0 issue

---

## 15. Engineering Lifecycle

### 15.1 Design Phase

**Required for Medium/Large changes:**

| Change Size | Requirements |
|-------------|--------------|
| Small (< 50 lines) | PR description |
| Medium (50-500 lines) | Design document |
| Large (> 500 lines) | Design doc + architecture review |
| Security-sensitive | Security review required |

**Design Document Template:**

```markdown
# Design: [Feature Name]

## Problem Statement
What problem are we solving?

## Proposed Solution
Technical approach with diagrams.

## Alternatives Considered
What else did we consider and why not?

## Rollout Plan
How will we deploy this safely?

## Rollback Plan
How do we undo if something goes wrong?

## Success Metrics
How do we know this worked?
```

### 15.2 Review Phase

**Reviewer Requirements:**

| Change Size | Reviewers Required |
|-------------|-------------------|
| < 200 lines | 1 reviewer |
| 200-500 lines | 2 reviewers |
| > 500 lines or architectural | Tech lead + 1 |

**Review SLAs:**
- First response: < 4 business hours
- Approval/changes requested: < 24 hours

**Reviewer Checklist:**
- [ ] Correctness — Does it work?
- [ ] Standards — Does it follow patterns?
- [ ] Security — Are there vulnerabilities?
- [ ] Observability — Can we debug this in prod?
- [ ] Tests — Is behavior verified?

### 15.3 Deployment Phase

**Progressive Rollout:**

| Risk Level | Strategy |
|------------|----------|
| Low (copy changes, minor UI) | Direct deploy |
| Medium (new features, refactors) | 10% → 50% → 100% over 24h |
| High (payments, auth, data model) | 1% → 10% → 50% → 100% over 72h |

### 15.4 Operations Phase

**On-Call Responsibilities:**
- Acknowledge alerts within 15 minutes
- Update incident channel within 30 minutes
- Escalate if not resolved within 1 hour

**Post-Incident:**
- Blameless post-mortem within 48 hours
- Action items tracked to completion
- Standards updated if applicable

---

## 16. Dependency Management

### 16.1 Adding Dependencies

Before adding a package:

| Check | Criteria |
|-------|----------|
| Popularity | > 1M weekly downloads preferred |
| Maintenance | Updated in last 6 months |
| Types | TypeScript support (native or @types) |
| Bundle size | Check via bundlephobia.com |
| Security | No known vulnerabilities |

### 16.2 Required Tools

| Category | Tool | Why |
|----------|------|-----|
| Linting | ESLint + Prettier | Consistent formatting |
| Type checking | TypeScript strict mode | Catch errors at compile time |
| Testing | Vitest or Jest | Fast, reliable |
| E2E | Playwright | Cross-browser, reliable |
| CI/CD | GitHub Actions | Native integration |

### 16.3 Recommended Tools

| Category | Options | Notes |
|----------|---------|-------|
| State management | Zustand, Jotai | Avoid Redux for new projects |
| Forms | React Hook Form | Uncontrolled for performance |
| API layer | tRPC, TanStack Query | Type-safe data fetching |
| Validation | Zod | Runtime type validation |
| Logging | Pino | Structured JSON logging |

### 16.4 Prohibited Packages

| Package | Reason | Alternative |
|---------|--------|-------------|
| moment.js | Bundle size, mutable | date-fns, dayjs |
| lodash (full) | Bundle size | lodash-es with tree-shaking |
| jQuery | Unnecessary with React | Native DOM APIs |
| request | Deprecated | fetch, axios |

### 16.5 Update Policy

| Type | Frequency |
|------|-----------|
| Security patches | Immediate |
| Minor versions | Monthly |
| Major versions | Quarterly review |

---

## 17. Standards Maturity Model

### Level 1: Aware

- [ ] Team has read the standards document
- [ ] New code attempts to follow patterns
- [ ] Manual review catches violations

### Level 2: Compliant

- [ ] All automated checks pass
- [ ] No ERROR-level violations in codebase
- [ ] Feature READMEs exist for all features

### Level 3: Proficient

- [ ] WARNING-level violations < 10
- [ ] Test coverage > 70%
- [ ] All features have integration tests
- [ ] Deployment frequency > 1/week

### Level 4: Exemplary

- [ ] Zero standards violations
- [ ] Test coverage > 85%
- [ ] Deployment frequency > 1/day
- [ ] Change failure rate < 5%
- [ ] Mean time to recovery < 1 hour

### Level 5: Industry-Leading

- [ ] Contributing improvements back to standards
- [ ] Mentoring other teams on adoption
- [ ] Publishing learnings externally
- [ ] Standards inform industry best practices

**Assessment:** Teams self-assess quarterly. Results inform tech debt prioritization.

---

## 18. Anti-Patterns Gallery

### 18.1 The God Service

**What it looks like:**
```typescript
// lib/services/application.ts - 3,847 lines
export function doEverything(action: string, data: any) {
  switch(action) {
    case 'createUser': ...
    case 'updateItem': ...
    case 'processPayment': ...
    case 'sendEmail': ...
    // 200 more cases
  }
}
```

**Why it's bad:**
- Impossible to test in isolation
- Every change risks breaking unrelated features
- No clear ownership

**How to fix:**
Split into domain-specific services with single responsibilities.

---

### 18.2 The Leaky Abstraction

**What it looks like:**
```tsx
// Component that "abstracts" the database
function ItemCard({ item }: { item: ItemRow }) {
  // Using database row type directly in UI
  return <div>{item.image_url}</div>;
}
```

**Why it's bad:**
- UI coupled to database schema
- Column rename breaks the frontend
- Can't reshape data for UI needs

**How to fix:**
Transform to UI-specific types at the service boundary.

---

### 18.3 The Phantom Dependency

**What it looks like:**
```typescript
// Works locally, breaks in CI
import { config } from '../../../config';
// Relies on specific file structure that varies by environment
```

**Why it's bad:**
- Path assumptions break in different contexts
- No TypeScript protection for path validity
- Refactoring is terrifying

**How to fix:**
Use path aliases (`@/lib/config`) and validate at build time.

---

### 18.4 The Optimistic Migration

**What it looks like:**
```typescript
// "We'll clean this up after launch"
// TODO: Remove this hack
// @ts-ignore - legacy code
// eslint-disable-next-line
```

**Why it's bad:**
- "After launch" never comes
- Hacks accumulate and compound
- Disables safety nets

**How to fix:**
Create a ticket with a deadline. If it can't be fixed now, schedule it explicitly.

---

### 18.5 The Feature Flag Graveyard

**What it looks like:**
```typescript
if (flags.NEW_CHECKOUT_V2 || flags.NEW_CHECKOUT_V3 || flags.NEW_CHECKOUT_FINAL) {
  // Which one is active? Nobody knows.
}
```

**Why it's bad:**
- Dead code accumulates
- Impossible to reason about state
- Testing combinatorial explosion

**How to fix:**
Remove flags within 30 days of full rollout. Track in EXCEPTIONS.md if needed.

---

### 18.6 The Log Flood

**What it looks like:**
```typescript
function processItem(item: Item) {
  console.log('Processing item:', item);
  console.log('Step 1 complete');
  console.log('Step 2 complete');
  console.log('Done processing');
}
```

**Why it's bad:**
- Noise drowns out signal
- Performance impact
- No structured data for querying

**How to fix:**
Use structured logging with appropriate levels. One info log per operation.

---

## 19. Architecture Decision Records

### ADR Template

```markdown
# ADR-XXX: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Deciders:** [Names]

## Context

What is the issue that we're seeing that is motivating this decision?

## Decision

What is the change that we're proposing and/or doing?

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Option A | ... | ... |
| Option B | ... | ... |

## Consequences

What becomes easier or more difficult because of this decision?

### Positive
- ...

### Negative
- ...

### Neutral
- ...

## Validation

How will we know if this decision is working? When should we revisit?
```

### Sample ADRs

**ADR-001: Clean Architecture Over MVC**

- **Status:** Accepted
- **Context:** Need architecture pattern for scalable full-stack development
- **Decision:** Clean Architecture with feature-based vertical slices
- **Consequences:** More files but better isolation and testability

**ADR-002: No Cross-Feature Imports**

- **Status:** Accepted
- **Context:** Previous codebase had features importing freely, causing cascading breaks
- **Decision:** Features cannot import from other features; shared code in `lib/` or `app/components/`
- **Consequences:** Some code duplication at boundaries, but changes are isolated

**ADR-003: TypeScript Strict Mode**

- **Status:** Accepted
- **Context:** Runtime errors from type mismatches in production
- **Decision:** Enable all strict TypeScript options, no `any` types
- **Consequences:** Longer initial development, fewer production bugs

---

## 20. Exception Process

### 20.1 When Standards Don't Fit

Standards optimize for the common case. Legitimate exceptions exist.

**Valid reasons for exceptions:**
- Performance-critical path where abstraction cost is measurable
- Third-party integration that doesn't fit our patterns
- Prototype/experiment with defined expiration date
- Legacy code with bounded migration plan

**Invalid reasons:**
- "It's faster to write this way"
- "I've always done it this way"
- "The standard is annoying"

### 20.2 How to Request an Exception

1. **Document the constraint** — What standard are you deviating from?
2. **Explain the necessity** — Why can't you comply?
3. **Scope the blast radius** — What's affected?
4. **Define the exit criteria** — When/how will this become compliant?
5. **Get approval** — Tech lead for WARNING-level, architect for ERROR-level

### 20.3 Exception Template

```markdown
## Exception: [Brief Description]

**Standard:** [Which rule]
**Scope:** [Files/features affected]
**Justification:** [Why this is necessary]
**Expiration:** [Date or condition when this must be resolved]
**Approved by:** [Name, date]
**Tracking:** [Issue/ticket link]
```

### 20.4 Living with Exceptions

- Exceptions are tracked in `EXCEPTIONS.md` at repo root
- Exceptions are reviewed quarterly
- Expired exceptions become tech debt tickets automatically
- Maximum 10 active exceptions per repository

---

## 21. Standards Evolution (RFC Process)

### 21.1 RFC Process

Standards change through Requests for Comments (RFCs).

**Who can propose:** Any engineer
**Approval required:** 2 tech leads + 1 architect
**Timeline:** 2-week comment period minimum

### 21.2 RFC Template

```markdown
# RFC: [Title]

## Summary

One paragraph explanation.

## Motivation

Why are we doing this? What problems does it solve?

## Detailed Design

Technical details of the proposal.

## Drawbacks

Why should we NOT do this?

## Alternatives

What other approaches were considered?

## Adoption Strategy

How do we migrate existing code?

## Unresolved Questions

What needs to be figured out during implementation?
```

### 21.3 RFC Lifecycle

1. **Draft** — Author writes proposal
2. **Review** — 2-week comment period
3. **Decision** — Approved, rejected, or needs revision
4. **Implementation** — Standards doc updated, tooling added
5. **Adoption** — Teams migrate, grace period defined

### 21.4 Quarterly Standards Review

Each quarter we review:

1. **Violation trends** — Are we improving?
2. **Exception inventory** — Any expired?
3. **Pain points** — What standards cause friction?
4. **Industry changes** — Any new best practices to adopt?
5. **Incident analysis** — Any new rules needed?

---

## 22. Lessons from Production

Standards should be traceable to problems they prevent.

### 22.1 Incident-Driven Rules

| Rule | Incident | What Happened |
|------|----------|---------------|
| No cross-feature imports | INC-247 | Feature refactor broke unrelated feature. 3-hour outage. |
| No hardcoded URLs | INC-312 | Staging URL in production caused data leak. |
| Use `api` client | INC-089 | Raw fetch had no retry logic. Cascading failure during API hiccup. |
| Feature READMEs required | — | New engineers took 2 weeks to understand features vs. 2 days with docs. |
| No `any` types | INC-156 | Runtime crash from unexpected null. TypeScript couldn't warn us. |
| Error boundaries required | INC-201 | Unhandled error crashed entire page instead of component. |
| Structured logging | INC-178 | Couldn't trace request through system during incident. |

### 22.2 Post-Incident Standard Updates

When incidents occur:

1. **Immediate:** Fix the issue
2. **Within 48 hours:** Blameless post-mortem
3. **Within 1 week:** Propose standard update if applicable
4. **Within 2 weeks:** Automated check added if possible

**Rule of Three:** If a class of bug happens twice, it becomes a standard. If it happens three times, it becomes an automated check.

---

## 23. Metrics & Measurement

### 23.1 What We Track

| Metric | Target | Measured |
|--------|--------|----------|
| ERROR violations | 0 | Per push |
| WARNING violations | < 20 | Weekly |
| Test coverage | > 80% | Per PR |
| PR cycle time | < 24h | Weekly |
| Deployment frequency | > 1/day | Weekly |
| Change failure rate | < 5% | Monthly |
| Standards exceptions | < 5 active | Monthly |
| MTTR (Mean Time to Recovery) | < 1h | Per incident |

### 23.2 Health Dashboard

Every project should have a standards compliance dashboard showing:

- Violations by team/feature
- Trend over time
- Top violation types
- Upcoming exception expirations
- Test coverage by feature
- Deployment metrics

### 23.3 Reporting Cadence

| Report | Frequency | Audience |
|--------|-----------|----------|
| Violation summary | Weekly | Team leads |
| Coverage report | Per PR | Reviewers |
| Standards health | Monthly | Engineering leadership |
| Exception review | Quarterly | Architecture team |

---

## 24. Fixing Violations

### 24.1 Quick Fixes by Error Type

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
| `console.log` | Remove or use structured logger |
| `require()` | Convert to ES import: `import x from 'y'` |
| Raw fetch | Use `api` client from `@/lib/api` |
| Hardcoded path | Use `nav` helper from `@/lib/navigation` |
| Hardcoded URL | Move to environment variable |
| Missing README | Create README.md with required sections |
| Missing error boundary | Add `error.tsx` to route segment |

### 24.2 Understanding Check Output

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

### 24.3 Getting Help

1. **Check existing code** for similar patterns
2. **Read this document** for design decisions
3. **Check ADRs** for architectural context
4. **Ask in team chat** — someone has probably solved it before
5. **Use AI assistants** — they're trained on these standards

---

## 25. For AI Assistants

**Instructions for Claude, Cursor, Copilot, and other AI coding assistants:**

### 25.1 Before Generating Code

1. **Read this document** and any project-specific rules (`.cursorrules`, `CLAUDE.md`)
2. **Identify the feature** — Which folder does this belong to?
3. **Check the layer** — Interface, Logic, or Data?
4. **Check for existing code** — Does `lib/` or `app/components/` have this?

### 25.2 Strict Mode Rules

| Rule | Action |
|------|--------|
| Cross-feature import requested | **Refuse.** Suggest extracting to shared location. |
| Database import in UI requested | **Refuse.** Suggest service layer pattern. |
| `any` type suggested | **Refuse.** Ask for type definition or use `unknown`. |
| Raw `fetch('/api/...')` | **Replace** with `api` client. |
| Hardcoded route path | **Replace** with `nav` helper. |
| Generic file name | **Suggest** specific name. |
| Missing error handling | **Add** try/catch with typed errors. |
| Missing types | **Define** interfaces before implementation. |

### 25.3 Response Template for Violations

When asked to generate code that would violate standards:

```
I cannot fulfill this request because [ACTION] violates the
[STANDARD NAME] standard (Section X.Y).

**Why this matters:** [Brief explanation]

**Recommended approach:**
1. [Step 1]
2. [Step 2]

Would you like me to generate the code using this compliant pattern?
```

### 25.4 Self-Validation Checklist

Before finalizing any code generation:

```
□ Would this pass `npm run check:standards`?
□ Are there any layer violations?
□ Are there any cross-feature imports?
□ Are all types properly defined (no any)?
□ Are `api` client and `nav` helpers used?
□ Is error handling implemented?
□ Are all URLs in the allowed list or environment variables?
□ Does any new feature folder need a README?
□ Are there tests for new logic?
```

### 25.5 Example Refusal

**User:** "Import the ItemCard from the items feature into orders"

**AI Response:**
```
I cannot import from `app/items/` into `app/orders/` because this violates
the Feature Isolation standard (Section 3.3).

**Why this matters:** Cross-feature imports create tight coupling. Changing
the items feature would break the orders feature.

**Recommended approach:**
1. Move `ItemCard` to `app/components/ItemCard.tsx`
2. Update `app/items/` to import from `app/components/`
3. Import from `app/components/` in `app/orders/`

Would you like me to generate the code with ItemCard in the shared components folder?
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
| **Observable** | Structured logging, metrics, tracing |
| **Performant** | Budgets and targets enforced |
| **Collaborative** | Anyone can work on any part |
| **AI-Friendly** | Clear rules that AI assistants follow |
| **Evolvable** | RFC process for changes |

When in doubt:
1. **Ask** — The team is here to help
2. **Check existing code** — Follow established patterns
3. **Run the checks** — `npm run check:standards`
4. **Read the ADRs** — Understand why decisions were made
5. **Use AI assistants** — They're trained on these standards

---

## Appendix A: File Templates

### A.1 New Feature Checklist

```markdown
## New Feature: [Name]

- [ ] Create feature folder in `app/[feature-name]/`
- [ ] Add `page.tsx` (main page)
- [ ] Add `error.tsx` (error boundary)
- [ ] Add `loading.tsx` (loading state)
- [ ] Add `README.md` (documentation)
- [ ] Create service in `lib/services/[feature].ts`
- [ ] Add types in `lib/types/` or feature `types.ts`
- [ ] Add API routes if needed
- [ ] Add navigation helpers
- [ ] Add API client methods
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update root documentation if needed
```

### A.2 PR Description Template

```markdown
## Summary

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
```

---

## Appendix B: Tooling Configuration

### B.1 ESLint Configuration (`.eslintrc.js`)

```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': 'warn',
    'prefer-const': 'error',
  },
};
```

### B.2 TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### B.3 Pre-commit Hook (`.husky/pre-commit`)

```bash
#!/bin/sh
npm run lint-staged
```

### B.4 Pre-push Hook (`.husky/pre-push`)

```bash
#!/bin/sh
npm run type-check && npm run check:standards && npm test
```

---

**Version History:**

- 3.0.0 (2026-02-03) - Gold Standard release: Added philosophy, ADRs, exception process, lifecycle, maturity model, anti-patterns, observability, security, performance, API design, metrics
- 2.1.0 (2026-01-22) - Added 5 new automated checks
- 2.0.0 (2026-01-22) - Added Clean Architecture principles, component patterns, database standards
- 1.0.0 (2026-01-22) - Initial release

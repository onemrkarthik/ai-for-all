# Code Standards Guide

This guide explains the coding standards enforced in this project. These standards help us maintain a clean, consistent, and maintainable codebase that's easy for everyone to work with.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Why Standards Matter](#why-standards-matter)
3. [How Standards Are Enforced](#how-standards-are-enforced)
4. [Standards Explained](#standards-explained)
   - [File Naming](#1-file-naming)
   - [Layer Separation](#2-layer-separation)
   - [Feature Isolation](#3-feature-isolation)
   - [Type Safety](#4-type-safety)
   - [API Client Usage](#5-api-client-usage)
   - [Navigation Helpers](#6-navigation-helpers)
   - [No Hardcoded Values](#7-no-hardcoded-values)
   - [Documentation](#8-documentation)
5. [Running Checks Locally](#running-checks-locally)
6. [Fixing Violations](#fixing-violations)
7. [For AI Assistants](#for-ai-assistants)

---

## Quick Reference

| Standard | What It Means | Severity |
|----------|---------------|----------|
| No generic file names | Don't use `utils.ts`, `helpers.ts`, `misc.ts` | ERROR |
| Layer separation | UI code can't directly access the database | ERROR |
| Feature isolation | Features can't import from other features | ERROR |
| API isolation | API routes can't import from other API routes | ERROR |
| Type safety | Don't use `any` type or `@ts-ignore` | WARNING |
| Use API client | Use `api.photos.get()` not `fetch('/api/...')` | WARNING |
| Use nav helpers | Use `nav.home.index()` not `href="/"` | WARNING |
| No hardcoded values | URLs and secrets go in environment variables | WARNING |
| Feature READMEs | Each feature folder needs a README.md | WARNING |

**ERROR** = Code cannot be pushed until fixed
**WARNING** = Code can be pushed, but should be fixed

---

## Why Standards Matter

### For New Team Members
- **Consistency**: Code looks the same everywhere, making it easier to learn
- **Discoverability**: Find what you need by following predictable patterns
- **Onboarding**: Less time figuring out "how we do things here"

### For the Codebase
- **Maintainability**: Changes in one area don't break unrelated code
- **Scalability**: New features can be added without creating a tangled mess
- **Security**: Prevents common vulnerabilities like exposed secrets

### For the Team
- **Code Reviews**: Less time debating style, more time on logic
- **Collaboration**: Everyone can work on any part of the codebase
- **AI Assistance**: AI tools (Claude, Cursor) generate compliant code automatically

---

## How Standards Are Enforced

Standards are checked at multiple points to catch issues early:

```
You write code
       ↓
   git commit
       ↓
   Pre-commit hook runs ESLint (auto-fixes formatting)
       ↓
   git push
       ↓
   Pre-push hook runs:
   ├── TypeScript type checking
   ├── Standards check (npm run check:standards)
   └── Architecture tests (npm test)
       ↓
   If any check fails → Push is blocked
       ↓
   If all pass → Code goes to GitHub
       ↓
   GitHub Actions runs same checks (backup verification)
```

### What Gets Checked When

| Check | When It Runs | What It Does |
|-------|--------------|--------------|
| ESLint | On commit | Fixes formatting, catches syntax issues |
| Type Check | On push | Ensures TypeScript types are correct |
| Standards Check | On push | Verifies architectural rules |
| Architecture Tests | On push | Tests file structure and imports |
| GitHub Actions | On PR/push | Runs all checks in CI environment |

---

## Standards Explained

### 1. File Naming

**Rule**: Don't use generic file names like `utils.ts`, `helpers.ts`, or `misc.ts`

**Why**: Generic names become dumping grounds for unrelated code. Six months later, nobody knows what's in `utils.ts` or where to find specific functionality.

**Bad Example**:
```
lib/
├── utils.ts        ← What's in here? Everything!
├── helpers.ts      ← How is this different from utils?
└── misc.ts         ← The junk drawer
```

**Good Example**:
```
lib/
├── dateFormatting.ts    ← Formats dates
├── priceCalculation.ts  ← Calculates prices
└── validation.ts        ← Validates input
```

**How to Fix**: Rename generic files to describe their specific purpose. If a file has multiple unrelated functions, split it into separate files.

---

### 2. Layer Separation

**Rule**: UI code (components, pages) cannot directly import from the database layer (`lib/db`)

**Why**: This keeps our code organized into clear responsibilities:
- **Interface Layer** (`app/`): What users see and interact with
- **Logic Layer** (`lib/services/`): Business rules and data processing
- **Data Layer** (`lib/db/`): Database operations

**Bad Example**:
```typescript
// ❌ app/components/PhotoCard.tsx
import { db } from '@/lib/db';  // Component directly accessing database!

function PhotoCard({ id }) {
  const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(id);
  // ...
}
```

**Good Example**:
```typescript
// ✅ app/components/PhotoCard.tsx
import { api } from '@/lib/api';

function PhotoCard({ id }) {
  const photo = await api.photos.get(id);  // Uses API client
  // ...
}

// ✅ lib/services/photos.ts (handles the database work)
import { db } from '@/lib/db';

export function getPhotoById(id: number) {
  return db.prepare('SELECT * FROM photos WHERE id = ?').get(id);
}
```

**How to Fix**: Move database operations to `lib/services/`, then call those services from your components via the API client.

---

### 3. Feature Isolation

**Rule**: Feature folders cannot import from other feature folders

**Why**: This prevents features from becoming tangled together. If "photos" imports from "professionals" and vice versa, changing one breaks the other.

**Project Structure**:
```
app/
├── professionals/    ← Feature A
├── photos/           ← Feature B
├── styles/           ← Feature C
├── components/       ← SHARED (anyone can use)
└── api/
    ├── professionals/  ← API for Feature A
    ├── photos/         ← API for Feature B
    └── contact/        ← API for Feature C
```

**Bad Example**:
```typescript
// ❌ app/professionals/[id]/page.tsx
import { PhotoCard } from '@/app/photos/components/PhotoCard';  // Cross-feature!
```

**Good Example**:
```typescript
// ✅ app/professionals/[id]/page.tsx
import { PhotoCard } from '@/app/components/PhotoCard';  // Shared component
```

**How to Fix**: If two features need the same code:
1. **UI Components** → Move to `app/components/`
2. **Business Logic** → Move to `lib/services/`
3. **Utilities** → Move to `lib/`

---

### 4. Type Safety

**Rule**: Don't use `any` type, `@ts-ignore`, or `@ts-nocheck`

**Why**: TypeScript catches bugs before they reach users. Using `any` or ignoring errors defeats this purpose.

**Bad Examples**:
```typescript
// ❌ Using 'any'
function processData(data: any) {  // Could be anything!
  return data.name.toUpperCase();  // Might crash if data.name doesn't exist
}

// ❌ Ignoring TypeScript errors
// @ts-ignore
const result = someFunction(wrongArgument);
```

**Good Examples**:
```typescript
// ✅ Define proper types
interface UserData {
  name: string;
  email: string;
}

function processData(data: UserData) {
  return data.name.toUpperCase();  // TypeScript knows this is safe
}

// ✅ Fix the actual error instead of ignoring
const result = someFunction(correctArgument);
```

**How to Fix**:
- Define interfaces for your data structures
- Use type imports from `@/lib/api/types` or `@/lib/db/types`
- If you're unsure of a type, use `unknown` and add type guards

---

### 5. API Client Usage

**Rule**: Use the typed API client instead of raw `fetch()` for internal API calls

**Why**: The API client provides:
- **Type safety**: Know exactly what data you're getting back
- **Consistency**: Same error handling everywhere
- **Maintainability**: Change a URL once, it updates everywhere

**Bad Example**:
```typescript
// ❌ Raw fetch
const response = await fetch('/api/photos/123');
const data = await response.json();  // What type is this? 🤷
```

**Good Example**:
```typescript
// ✅ Typed API client
import { api } from '@/lib/api';

const photo = await api.photos.get(123);  // TypeScript knows this is a Photo
```

**Available API Methods**:
| Method | Purpose |
|--------|---------|
| `api.feed.list({ offset, limit, filters })` | Get photo feed |
| `api.photos.get(id)` | Get photo details |
| `api.professionals.get(id)` | Get professional details |
| `api.contact.init(body)` | Start a conversation |
| `api.contact.chat(body)` | Send a message |
| `api.contact.latest(photoId)` | Get latest conversation |

---

### 6. Navigation Helpers

**Rule**: Use navigation helpers instead of hardcoded paths

**Why**: If we rename a route, we only need to update one place instead of finding every hardcoded string.

**Bad Example**:
```typescript
// ❌ Hardcoded paths
<Link href="/professionals/5">View Profile</Link>
<Link href="/?photo=123">View Photo</Link>
```

**Good Example**:
```typescript
// ✅ Navigation helpers
import { nav } from '@/lib/navigation';

<Link href={nav.professionals.detail(5)}>View Profile</Link>
<Link href={nav.home.index({ photo: 123 })}>View Photo</Link>
```

**Available Navigation Helpers**:
| Helper | Result |
|--------|--------|
| `nav.home.index()` | `"/"` |
| `nav.home.index({ photo: 123 })` | `"/?photo=123"` |
| `nav.professionals.detail(5)` | `"/professionals/5"` |
| `nav.photos.ideas()` | `"/photos/ideas"` |
| `nav.styles.detail('modern')` | `"/styles/modern"` |

---

### 7. No Hardcoded Values

**Rule**: Don't hardcode URLs, IP addresses, or secrets in code

**Why**:
- **Security**: Secrets in code get committed to git history forever
- **Flexibility**: Different environments (dev, staging, prod) need different values
- **Maintenance**: Changing a URL means searching the entire codebase

**Bad Examples**:
```typescript
// ❌ Hardcoded URL
const response = await fetch('https://api.example.com/data');

// ❌ Hardcoded secret
const apiKey = 'sk-1234567890abcdef';
```

**Good Examples**:
```typescript
// ✅ Use environment variables
const response = await fetch(process.env.API_URL + '/data');

// ✅ Secret in .env.local (not committed to git)
const apiKey = process.env.API_KEY;
```

**Allowed URLs** (won't trigger warnings):
- `schema.org` - For SEO structured data
- `unsplash.com` - Image CDN
- `localhost` - Development
- `example.com` - Placeholder in documentation

---

### 8. Documentation

**Rule**: Feature folders should have a README.md file

**Why**: READMEs help team members understand:
- What the feature does
- How to use it
- Important implementation details

**Example Structure**:
```
app/photos/
├── README.md         ← Explains the photos feature
├── [slug]/
│   └── page.tsx
└── page.tsx
```

**Minimum README Content**:
```markdown
# Feature Name

Brief description of what this feature does.

## Routes

| Route | Description |
|-------|-------------|
| `/photos` | Photo listing page |
| `/photos/[slug]` | Photo detail page |

## Key Components

- `PhotoCard` - Displays a single photo
- `PhotoGallery` - Grid of photos
```

---

## Running Checks Locally

Before pushing, you can run all checks locally:

```bash
# Run all checks (same as pre-push)
npm run type-check && npm run check:standards && npm test

# Run individual checks
npm run type-check        # TypeScript errors
npm run check:standards   # Architectural standards
npm test                  # Architecture tests
npm run lint              # ESLint (also auto-fixes)
```

### Understanding Check Output

**Standards Check Output**:
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

---

## Fixing Violations

### Quick Fixes by Error Type

| Error | Quick Fix |
|-------|-----------|
| Generic file name | Rename to describe purpose: `utils.ts` → `dateFormatting.ts` |
| Layer violation | Move DB code to `lib/services/`, use API client |
| Cross-feature import | Move shared code to `app/components/` or `lib/` |
| Cross-API import | Move shared logic to `lib/services/` |
| `any` type | Define an interface in `lib/types/` or locally |
| `@ts-ignore` | Fix the underlying type error |
| Raw fetch | Use `api` client from `@/lib/api` |
| Hardcoded path | Use `nav` helper from `@/lib/navigation` |
| Hardcoded URL | Move to environment variable |
| Missing README | Create README.md in feature folder |

### Getting Help

If you're unsure how to fix a violation:

1. **Check existing code** for similar patterns
2. **Read ARCHITECTURE.md** for design decisions
3. **Ask in team chat** - someone has probably solved it before
4. **Use AI assistants** (Claude, Cursor) - they know our standards

---

## For AI Assistants

This project uses AI coding assistants (Claude Code, Cursor) that are configured to follow these standards automatically.

### How It Works

1. **CLAUDE.md** and **.cursorrules** contain all standards
2. AI reads these files before generating code
3. AI refuses to generate code that violates standards
4. AI suggests compliant alternatives

### If AI Generates Non-Compliant Code

The automated checks will catch it:
- Pre-push hook blocks the push
- Error message explains the violation
- AI can help fix the issue

### AI Response to Violations

When you ask for code that would violate standards, AI will respond like:

```
"I can't create this because it would import from photos/ into
professionals/, which violates feature isolation.

Instead, I'll:
1. Extract shared code to lib/services/photoUtils.ts
2. Have both features import from there

Should I proceed?"
```

---

## Summary

These standards exist to make our codebase:
- **Predictable** - Same patterns everywhere
- **Maintainable** - Changes don't cause ripple effects
- **Secure** - No exposed secrets or vulnerabilities
- **Collaborative** - Anyone can work on any part

When in doubt:
1. **Ask** - The team is here to help
2. **Check existing code** - Follow established patterns
3. **Run the checks** - `npm run check:standards`
4. **Use AI assistants** - They're trained on our standards

---

*Last updated: 2026-01-22*

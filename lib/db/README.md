# Database Schema Management

Centralized database schema management for AI for All.

## Overview

All database table definitions are centralized in `/lib/db/schema.ts`. This provides a single source of truth for the database structure with type safety and utility functions.

## Structure

```
/lib/db/
├── schema.ts     # Table definitions
├── types.ts      # TypeScript interfaces for database rows
├── index.ts      # Database connection and utilities
└── README.md     # This file
```

## Schema Definition

Each table is defined with:
- **Table name**: Unique identifier
- **SQL statement**: CREATE TABLE definition
- **Description**: Purpose of the table

### Example

```typescript
export const schema = {
  professionals: {
    name: 'professionals',
    description: 'Design professionals and contractors',
    sql: `
      CREATE TABLE IF NOT EXISTS professionals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company TEXT NOT NULL
      )
    `,
  },
  // ... more tables
};
```

## Tables

| Table | Purpose | Relationships |
|-------|---------|---------------|
| **professionals** | Design professionals who create designs | photos (M:M), reviews (1:M), conversations (1:M) |
| **photos** | Kitchen design photos | professionals (M:M), photo_attributes (1:M), conversations (1:M) |
| **photo_attributes** | Photo metadata (style, materials) | photos (M:1) |
| **photos_professionals** | Links photos to professionals | photos (M:1), professionals (M:1) |
| **reviews** | Customer reviews for professionals | professionals (M:1) |
| **conversations** | AI chat conversations | photos (M:1), professionals (M:1), messages (1:M) |
| **messages** | Individual chat messages | conversations (M:1) |

## Usage

### Initialize Database

```typescript
import { initializeDatabase } from '@/lib/db';

// Create all tables (safe to run multiple times)
initializeDatabase();
```

### Access Schema

```typescript
import { schema, getTableDefinition } from '@/lib/db';

// Get all schema
console.log(schema);

// Get specific table
const profTable = getTableDefinition('professionals');
console.log(profTable.sql);
```

### Get Statistics

```typescript
import { getDatabaseStats, isDatabaseInitialized } from '@/lib/db';

// Check if database is ready
if (isDatabaseInitialized()) {
  const stats = getDatabaseStats();
  console.log(`Photos: ${stats.photos}`);
  console.log(`Conversations: ${stats.conversations}`);
}
```

### Reset Database (Development)

```typescript
import { dropAllTables, initializeDatabase } from '@/lib/db';

// ⚠️ DANGER: Deletes all data
dropAllTables();

// Recreate tables
initializeDatabase();
```

## Utility Functions

### `initializeDatabase()`
Creates all tables defined in the schema. Safe to call multiple times (uses `IF NOT EXISTS`).

### `dropAllTables()`
Drops all tables in reverse dependency order. **⚠️ Use with caution - deletes all data!**

### `getDatabaseStats()`
Returns row counts for all tables.

```typescript
{
  professionals: 8,
  photos: 100,
  photo_attributes: 1000,
  reviews: 40,
  conversations: 5,
  messages: 25
}
```

### `isDatabaseInitialized()`
Checks if all required tables exist. Returns `true` if database is ready.

### `getTableNames()`
Returns array of table names in creation order:
```typescript
[
  'professionals',
  'photos',
  'photo_attributes',
  'photos_professionals',
  'reviews',
  'conversations',
  'messages'
]
```

### `getAllTablesSQL()`
Returns complete SQL for creating all tables in one statement.

## Foreign Key Relationships

### Cascade Rules

- **ON DELETE CASCADE**: Child records deleted when parent is deleted
  - `photo_attributes` → `photos`
  - `photos_professionals` → `photos`, `professionals`
  - `reviews` → `professionals`
  - `conversations` → `photos`
  - `messages` → `conversations`

- **ON DELETE SET NULL**: Foreign key set to NULL when parent is deleted
  - `conversations.professional_id` → `professionals`

## Constraints

### Check Constraints

- `reviews.rating`: Must be between 1 and 5
- `messages.role`: Must be 'user' or 'assistant'

### Unique Constraints

- `photos_professionals`: Composite primary key on (photo_id, professional_id)

## Indexes (Recommended)

For optimal performance, consider adding these indexes:

```sql
CREATE INDEX idx_photo_attributes_photo_id ON photo_attributes(photo_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_reviews_professional_id ON reviews(professional_id);
CREATE INDEX idx_conversations_photo_id ON conversations(photo_id);
```

## Seeding Data

To seed the database with sample data, run:

```bash
node scripts/init-db.ts
```

This will:
1. Drop existing database (if any)
2. Create all tables from schema
3. Seed 8 professionals
4. Seed 100 photos with attributes
5. Seed 40 reviews (5 per professional)
6. Link photos to professionals

## Migration Strategy

When modifying the schema:

1. **Update** `/lib/db/schema.ts` with new table definition
2. **Update** `/scripts/init-db.ts` inline SQL (keep in sync)
3. **Test** by running `initializeDatabase()`
4. **Document** changes in this README

### Adding a New Table

1. Add table definition to `schema` object in `schema.ts`
2. Add table name to dependency order in `getTableNames()`
3. Update `schemaDocumentation` with table metadata
4. Add seeding logic to `init-db.ts` if needed

## Best Practices

- ✅ Always use `initializeDatabase()` in production setup
- ✅ Check `isDatabaseInitialized()` before querying
- ✅ Use transactions for multi-table operations
- ✅ Keep schema.ts as the single source of truth
- ❌ Don't edit SQL directly in init-db.ts (sync from schema.ts)
- ❌ Don't run `dropAllTables()` in production

## TypeScript Integration

All table definitions are fully typed:

```typescript
import type { TableDefinition } from '@/lib/db';

const table: TableDefinition = {
  name: 'example',
  description: 'Example table',
  sql: 'CREATE TABLE...'
};
```

## Database Row Types (`types.ts`)

The `types.ts` file provides TypeScript interfaces for all database query results. These types eliminate `as any` casts in the service layer and provide full type safety for database operations.

### Available Types

| Type | Purpose | Used In |
|------|---------|---------|
| `ProfessionalRow` | Basic professional record | `professionals.ts` |
| `PhotoRow` | Basic photo record | `photos.ts` |
| `PhotoWithProfessionalRow` | Photo with joined professional data | `photos.ts` |
| `PhotoAttributeRow` | Photo attribute key-value pair | `photos.ts` |
| `ReviewRow` | Professional review record | `professionals.ts` |
| `RatingStatsRow` | Aggregated rating statistics | `professionals.ts` |
| `CountRow` | Count query result | `photos.ts`, `chat.ts` |
| `ConversationRow` | Chat conversation record | `chat.ts` |
| `MessageRow` | Chat message record | `chat.ts` |
| `NewMessagesCountRow` | Unread message count | `chat.ts` |
| `ProfessionalPhotoRow` | Photo summary for professional | `professionals.ts` |
| `ConversationWithNewMessageCountRow` | Conversation with unread count | `chat.ts` |

### Usage Example

```typescript
import type { PhotoRow, PhotoAttributeRow } from '@/lib/db/types';

// Type-safe query results
const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(id) as PhotoRow | undefined;

const attributes = db.prepare(
  'SELECT * FROM photo_attributes WHERE photo_id = ?'
).all(photoId) as PhotoAttributeRow[];
```

### Type Definitions

```typescript
// Basic row types
export interface ProfessionalRow {
  id: number;
  name: string;
  company: string;
}

export interface PhotoRow {
  id: number;
  title: string;
  source: string;
  image_url: string;
  description?: string;
}

// Joined query types
export interface PhotoWithProfessionalRow extends PhotoRow {
  prof_id: number;
  prof_name: string;
  prof_company: string;
}

// Aggregate types
export interface RatingStatsRow {
  avg_rating: number | null;
  review_count: number;
}

export interface CountRow {
  count: number;
}
```

### Benefits

1. **Type Safety**: Eliminates `as any` casts throughout the codebase
2. **IDE Support**: Full autocomplete for query result properties
3. **Refactoring**: Rename fields safely with TypeScript support
4. **Documentation**: Types serve as documentation for query shapes
5. **Error Prevention**: Catch property access errors at compile time

## Troubleshooting

### "no such table" Error
```typescript
import { isDatabaseInitialized, initializeDatabase } from '@/lib/db';

if (!isDatabaseInitialized()) {
  initializeDatabase();
}
```

### Database Locked
Close all connections before running `dropAllTables()` or `init-db.ts`.

### Foreign Key Violations
Ensure tables are created in dependency order (handled automatically by `initializeDatabase()`).

## See Also

- [ARCHITECTURE.md](/ARCHITECTURE.md#database-schema) - Full architecture documentation
- [schema.ts](./schema.ts) - Schema definitions
- [init-db.ts](/scripts/init-db.ts) - Database seeding script

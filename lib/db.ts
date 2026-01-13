/**
 * Database Connection (Legacy Export)
 *
 * This file maintains backwards compatibility with existing imports.
 * The actual database implementation is in lib/db/index.ts
 *
 * @deprecated Import from '@/lib/db' instead for access to schema utilities
 */

export { db, schema, initializeDatabase, dropAllTables, getDatabaseStats, isDatabaseInitialized } from './db/index';
export type { TableDefinition } from './db/schema';

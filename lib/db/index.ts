/**
 * Database Module
 *
 * Centralized database access and schema management.
 * Supports both local and external database connections via environment variables.
 *
 * Environment Variables:
 * - DATABASE_URL: Path to SQLite database (default: ./local.db)
 * - DATABASE_TYPE: Database type - "sqlite" | "libsql" (default: sqlite)
 * - DATABASE_AUTH_TOKEN: Auth token for remote databases (LibSQL/Turso)
 * - DATABASE_WAL_MODE: Enable WAL mode - "true" | "false" (default: true)
 * - DATABASE_READONLY: Read-only mode - "true" | "false" (default: false)
 *
 * @example
 * ```ts
 * import { db, schema, initializeDatabase } from '@/lib/db';
 *
 * // Use the database connection
 * const users = db.prepare('SELECT * FROM users').all();
 *
 * // Access schema definitions
 * console.log(schema.professionals.sql);
 *
 * // Initialize database with all tables
 * initializeDatabase();
 * ```
 *
 * @example External Database
 * ```env
 * # In .env.local
 * DATABASE_URL=/mnt/shared/production.db
 * ```
 */

import {
  schema,
  getAllTablesSQL,
  getTableCreationSQL,
  getTableNames,
  getTableDefinition,
  schemaDocumentation,
} from './schema';
import type { TableDefinition } from './schema';
import {
  getConnection,
  closeConnection,
  testConnection,
  getConnectionInfo,
} from './connection';
import { getDatabaseConfig, describeConfig } from './config';
import type { DatabaseConfig, DatabaseType } from './config';

// Database connection - uses singleton pattern with configuration from environment
export const db = getConnection();

/**
 * Initialize database with all tables
 *
 * Creates all tables defined in the schema if they don't exist.
 * Safe to call multiple times (uses IF NOT EXISTS).
 *
 * @example
 * ```ts
 * import { initializeDatabase } from '@/lib/db';
 *
 * initializeDatabase();
 * console.log('Database initialized');
 * ```
 */
export function initializeDatabase(): void {
  const sql = getAllTablesSQL();
  db.exec(sql);
}

/**
 * Drop all tables (DANGEROUS - use with caution)
 *
 * Drops all tables in reverse dependency order.
 * Useful for resetting the database during development.
 *
 * @example
 * ```ts
 * import { dropAllTables, initializeDatabase } from '@/lib/db';
 *
 * // Reset database
 * dropAllTables();
 * initializeDatabase();
 * ```
 */
export function dropAllTables(): void {
  const tableNames = getTableNames().reverse(); // Drop in reverse order

  for (const tableName of tableNames) {
    db.prepare(`DROP TABLE IF EXISTS ${tableName}`).run();
  }
}

/**
 * Get database statistics
 *
 * Returns row counts for all tables.
 *
 * @returns Object with table names as keys and row counts as values
 *
 * @example
 * ```ts
 * import { getDatabaseStats } from '@/lib/db';
 *
 * const stats = getDatabaseStats();
 * console.log(`Photos: ${stats.photos}, Conversations: ${stats.conversations}`);
 * ```
 */
export function getDatabaseStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  const tableNames = getTableNames();

  for (const tableName of tableNames) {
    const result = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as { count: number };
    stats[tableName] = result.count;
  }

  return stats;
}

/**
 * Check if database is initialized
 *
 * Verifies that all required tables exist.
 *
 * @returns True if all tables exist, false otherwise
 */
export function isDatabaseInitialized(): boolean {
  const tableNames = getTableNames();

  for (const tableName of tableNames) {
    const result = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
    ).get(tableName);

    if (!result) {
      return false;
    }
  }

  return true;
}

// Re-export schema utilities
export {
  schema,
  getAllTablesSQL,
  getTableCreationSQL,
  getTableNames,
  getTableDefinition,
  schemaDocumentation,
};

// Re-export connection utilities
export {
  getConnection,
  closeConnection,
  testConnection,
  getConnectionInfo,
  getDatabaseConfig,
  describeConfig,
};

export type { TableDefinition, DatabaseConfig, DatabaseType };

// Re-export database row types
export type {
  ProfessionalRow,
  PhotoRow,
  PhotoWithProfessionalRow,
  PhotoAttributeRow,
  ReviewRow,
  RatingStatsRow,
  CountRow,
  ConversationRow,
  MessageRow,
  NewMessagesCountRow,
  ProfessionalPhotoRow,
  ConversationWithNewMessageCountRow,
} from './types';

// Re-export db from the old location for backwards compatibility
// This maintains compatibility with existing imports like: import { db } from '@/lib/db'
export { db as default };

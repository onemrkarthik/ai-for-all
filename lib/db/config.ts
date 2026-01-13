/**
 * Database Configuration
 *
 * Centralized configuration for database connections.
 * Supports local SQLite and external database paths via environment variables.
 *
 * Environment Variables:
 * - DATABASE_URL: Connection string or path to the database
 *   - For SQLite: file path (e.g., "./local.db" or "/path/to/external.db")
 *   - For remote SQLite: full path to network/mounted drive
 * - DATABASE_TYPE: Type of database ("sqlite" | "libsql")
 *   - Defaults to "sqlite"
 *
 * @example
 * ```env
 * # Local SQLite (default)
 * DATABASE_URL=./local.db
 *
 * # External SQLite on mounted drive
 * DATABASE_URL=/mnt/shared/app.db
 *
 * # LibSQL (Turso) - requires libsql client
 * DATABASE_TYPE=libsql
 * DATABASE_URL=libsql://your-db.turso.io
 * DATABASE_AUTH_TOKEN=your-token
 * ```
 */

import path from 'path';

export type DatabaseType = 'sqlite' | 'libsql';

export interface DatabaseConfig {
  type: DatabaseType;
  url: string;
  authToken?: string;
  options: {
    /** Enable WAL mode for better concurrency (SQLite only) */
    walMode: boolean;
    /** Connection timeout in milliseconds */
    timeout?: number;
    /** Read-only mode */
    readonly?: boolean;
  };
}

/**
 * Get database configuration from environment variables
 *
 * @returns Parsed database configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  const dbType = (process.env.DATABASE_TYPE || 'sqlite') as DatabaseType;
  const dbUrl = process.env.DATABASE_URL || './local.db';
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  // Resolve relative paths for SQLite
  let resolvedUrl = dbUrl;
  if (dbType === 'sqlite' && !path.isAbsolute(dbUrl) && !dbUrl.startsWith('file:')) {
    resolvedUrl = path.join(process.cwd(), dbUrl);
  }

  return {
    type: dbType,
    url: resolvedUrl,
    authToken,
    options: {
      walMode: process.env.DATABASE_WAL_MODE !== 'false',
      timeout: process.env.DATABASE_TIMEOUT ? parseInt(process.env.DATABASE_TIMEOUT, 10) : undefined,
      readonly: process.env.DATABASE_READONLY === 'true',
    },
  };
}

/**
 * Validate database configuration
 *
 * @param config - Database configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateDatabaseConfig(config: DatabaseConfig): void {
  if (!config.url) {
    throw new Error('DATABASE_URL is required');
  }

  if (config.type === 'libsql' && !config.authToken && config.url.includes('turso.io')) {
    console.warn('Warning: LibSQL/Turso URL detected but DATABASE_AUTH_TOKEN is not set');
  }

  const validTypes: DatabaseType[] = ['sqlite', 'libsql'];
  if (!validTypes.includes(config.type)) {
    throw new Error(`Invalid DATABASE_TYPE: ${config.type}. Valid types: ${validTypes.join(', ')}`);
  }
}

/**
 * Get a human-readable description of the database configuration
 *
 * @param config - Database configuration
 * @returns Description string
 */
export function describeConfig(config: DatabaseConfig): string {
  const parts = [`Type: ${config.type}`];

  if (config.type === 'sqlite') {
    parts.push(`Path: ${config.url}`);
  } else {
    // Mask the URL for security
    const maskedUrl = config.url.replace(/\/\/[^@]+@/, '//***@');
    parts.push(`URL: ${maskedUrl}`);
  }

  if (config.options.readonly) {
    parts.push('(read-only)');
  }

  return parts.join(' | ');
}

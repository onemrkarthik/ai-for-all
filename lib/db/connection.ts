/**
 * Database Connection Factory
 *
 * Creates and manages database connections based on configuration.
 * Supports SQLite (local and external) and LibSQL (Turso).
 */

import Database, { Database as DatabaseType } from 'better-sqlite3';
import { DatabaseConfig, getDatabaseConfig, validateDatabaseConfig, describeConfig } from './config';

let dbInstance: DatabaseType | null = null;
let currentConfig: DatabaseConfig | null = null;

/**
 * Create a new database connection
 *
 * @param config - Database configuration
 * @returns Database instance
 */
function createConnection(config: DatabaseConfig): DatabaseType {
  validateDatabaseConfig(config);

  if (config.type === 'libsql') {
    // LibSQL support would require @libsql/client package
    // For now, provide a helpful error message
    throw new Error(
      'LibSQL support requires the @libsql/client package. ' +
      'Install it with: npm install @libsql/client\n' +
      'Note: LibSQL requires a different API. Consider using the @libsql/client directly.'
    );
  }

  // SQLite connection options
  const options: { readonly?: boolean; timeout?: number } = {};
  if (config.options.readonly) {
    options.readonly = true;
  }
  if (config.options.timeout !== undefined) {
    options.timeout = config.options.timeout;
  }

  const db = new Database(config.url, options);

  // Enable WAL mode for better concurrency
  if (config.options.walMode && !config.options.readonly) {
    db.pragma('journal_mode = WAL');
  }

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  return db;
}

/**
 * Get the database connection
 *
 * Returns existing connection or creates a new one based on configuration.
 * Uses singleton pattern to reuse connections.
 *
 * @returns Database instance
 *
 * @example
 * ```ts
 * import { getConnection } from '@/lib/db/connection';
 *
 * const db = getConnection();
 * const users = db.prepare('SELECT * FROM users').all();
 * ```
 */
export function getConnection(): DatabaseType {
  const config = getDatabaseConfig();

  // Check if we need to create a new connection
  if (!dbInstance || !currentConfig || hasConfigChanged(currentConfig, config)) {
    // Close existing connection if config changed
    if (dbInstance && currentConfig && hasConfigChanged(currentConfig, config)) {
      // Database configuration changed - reconnecting
      closeConnection();
    }

    // Connect to database (logging removed for production)
    dbInstance = createConnection(config);
    currentConfig = config;
  }

  return dbInstance;
}

/**
 * Check if database configuration has changed
 */
function hasConfigChanged(oldConfig: DatabaseConfig, newConfig: DatabaseConfig): boolean {
  return (
    oldConfig.type !== newConfig.type ||
    oldConfig.url !== newConfig.url ||
    oldConfig.authToken !== newConfig.authToken ||
    oldConfig.options.readonly !== newConfig.options.readonly
  );
}

/**
 * Close the database connection
 *
 * Useful for cleanup or when switching database configurations.
 */
export function closeConnection(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    currentConfig = null;
  }
}

/**
 * Test database connection
 *
 * Attempts to connect and run a simple query.
 *
 * @returns True if connection successful, false otherwise
 */
export function testConnection(): { success: boolean; message: string } {
  try {
    const db = getConnection();
    db.prepare('SELECT 1').get();
    return { success: true, message: `Connected successfully: ${describeConfig(getDatabaseConfig())}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Connection failed: ${message}` };
  }
}

/**
 * Get connection info
 *
 * @returns Information about the current database connection
 */
export function getConnectionInfo(): {
  connected: boolean;
  config: DatabaseConfig | null;
  description: string;
} {
  const connected = dbInstance !== null;
  return {
    connected,
    config: currentConfig,
    description: currentConfig ? describeConfig(currentConfig) : 'Not connected',
  };
}

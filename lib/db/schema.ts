/**
 * Database Schema Definitions
 *
 * Centralized schema management for all database tables.
 * All table structures, columns, and relationships are defined here.
 */

/**
 * Table definition interface
 */
export interface TableDefinition {
  name: string;
  sql: string;
  description?: string;
}

/**
 * Database schema - all table definitions
 */
export const schema: Record<string, TableDefinition> = {
  /**
   * Professionals (Designers/Contractors)
   *
   * Stores information about design professionals who create the kitchen designs.
   */
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

  /**
   * Photos (Kitchen Designs)
   *
   * Main table for kitchen design photos/projects.
   */
  photos: {
    name: 'photos',
    description: 'Kitchen design photos and projects',
    sql: `
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        source TEXT NOT NULL,
        image_url TEXT NOT NULL,
        description TEXT
      )
    `,
  },

  /**
   * Photo Attributes
   *
   * Key-value pairs for photo metadata (style, layout, materials, etc.)
   */
  photo_attributes: {
    name: 'photo_attributes',
    description: 'Metadata attributes for photos (style, layout, materials)',
    sql: `
      CREATE TABLE IF NOT EXISTS photo_attributes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        photo_id INTEGER NOT NULL,
        label TEXT NOT NULL,
        value TEXT NOT NULL,
        FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
      )
    `,
  },

  /**
   * Photos-Professionals Junction
   *
   * Many-to-many relationship between photos and professionals.
   * Links which professional(s) created each photo.
   */
  photos_professionals: {
    name: 'photos_professionals',
    description: 'Junction table linking photos to professionals',
    sql: `
      CREATE TABLE IF NOT EXISTS photos_professionals (
        photo_id INTEGER NOT NULL,
        professional_id INTEGER NOT NULL,
        FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
        PRIMARY KEY (photo_id, professional_id)
      )
    `,
  },

  /**
   * Reviews
   *
   * Customer reviews for professionals.
   */
  reviews: {
    name: 'reviews',
    description: 'Customer reviews for professionals',
    sql: `
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        professional_id INTEGER NOT NULL,
        reviewer_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
      )
    `,
  },

  /**
   * Conversations
   *
   * Chat conversations between users and professionals (via AI assistant).
   * Conversations are tied to a professional, not to a specific photo.
   */
  conversations: {
    name: 'conversations',
    description: 'Chat conversations between users and professionals',
    sql: `
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        professional_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_summary TEXT,
        last_viewed_at DATETIME,
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
      )
    `,
  },

  /**
   * Messages
   *
   * Individual messages within conversations.
   */
  messages: {
    name: 'messages',
    description: 'Individual chat messages within conversations',
    sql: `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `,
  },
};

/**
 * Get all table creation SQL statements in dependency order
 *
 * Tables are ordered to respect foreign key constraints.
 * Parent tables must be created before child tables.
 *
 * @returns Array of SQL statements to create all tables
 */
export function getTableCreationSQL(): string[] {
  const tableOrder = [
    'professionals',
    'photos',
    'photo_attributes',
    'photos_professionals',
    'reviews',
    'conversations',
    'messages',
  ];

  return tableOrder.map((tableName) => {
    const table = schema[tableName];
    if (!table) {
      throw new Error(`Table definition not found: ${tableName}`);
    }
    return table.sql.trim();
  });
}

/**
 * Get combined SQL for creating all tables
 *
 * @returns Single SQL string with all CREATE TABLE statements
 */
export function getAllTablesSQL(): string {
  return getTableCreationSQL().join(';\n\n') + ';';
}

/**
 * Get table names in creation order
 *
 * @returns Array of table names
 */
export function getTableNames(): string[] {
  return [
    'professionals',
    'photos',
    'photo_attributes',
    'photos_professionals',
    'reviews',
    'conversations',
    'messages',
  ];
}

/**
 * Get table definition by name
 *
 * @param tableName - Name of the table
 * @returns Table definition or undefined
 */
export function getTableDefinition(tableName: string): TableDefinition | undefined {
  return schema[tableName];
}

/**
 * Database schema documentation
 *
 * Provides a human-readable summary of the database structure.
 */
export const schemaDocumentation = {
  description: 'Kitchen Design Gallery with AI Consultation',
  version: '1.0.0',
  tables: {
    professionals: {
      purpose: 'Design professionals who create kitchen designs',
      rowCount: '~8',
      relationships: ['photos (many-to-many)', 'reviews (one-to-many)', 'conversations (one-to-many)'],
    },
    photos: {
      purpose: 'Kitchen design photos and project details',
      rowCount: '~100',
      relationships: ['professionals (many-to-many)', 'photo_attributes (one-to-many)', 'conversations (one-to-many)'],
    },
    photo_attributes: {
      purpose: 'Metadata for photos (style, layout, materials, colors)',
      rowCount: '~1000 (10 per photo)',
      relationships: ['photos (many-to-one)'],
    },
    photos_professionals: {
      purpose: 'Links photos to the professionals who created them',
      rowCount: '~100',
      relationships: ['photos (many-to-one)', 'professionals (many-to-one)'],
    },
    reviews: {
      purpose: 'Customer reviews and ratings for professionals',
      rowCount: 'Variable',
      relationships: ['professionals (many-to-one)'],
    },
    conversations: {
      purpose: 'AI chat conversations with professionals',
      rowCount: 'Variable (user-generated)',
      relationships: ['professionals (many-to-one)', 'messages (one-to-many)'],
    },
    messages: {
      purpose: 'Individual chat messages (user and AI assistant)',
      rowCount: 'Variable (user-generated)',
      relationships: ['conversations (many-to-one)'],
    },
  },
  indexes: {
    recommended: [
      'CREATE INDEX idx_photo_attributes_photo_id ON photo_attributes(photo_id)',
      'CREATE INDEX idx_messages_conversation_id ON messages(conversation_id)',
      'CREATE INDEX idx_reviews_professional_id ON reviews(professional_id)',
      'CREATE INDEX idx_conversations_professional_id ON conversations(professional_id)',
    ],
  },
};

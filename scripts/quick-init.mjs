// Quick database initialization without seeding
import { initializeDatabase, isDatabaseInitialized, getDatabaseStats } from '../lib/db/index.ts';

console.log('Initializing database...');
initializeDatabase();

if (isDatabaseInitialized()) {
  console.log('✓ Database initialized successfully');
  const stats = getDatabaseStats();
  console.log('Table counts:', stats);
} else {
  console.error('✗ Database initialization failed');
  process.exit(1);
}

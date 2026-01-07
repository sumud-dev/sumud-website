import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create Neon serverless SQL client
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle instance with Neon HTTP driver
export const db = drizzle(sql, { schema });

// Helper function for raw queries (use sparingly, prefer Drizzle queries)
// Note: This is a simplified wrapper - for parameterized queries, use Drizzle's sql tagged template
export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const start = Date.now();
  // Cast to any to work around template string requirement
  const res = await (sql as any)(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.length });
  return res as T[];
}

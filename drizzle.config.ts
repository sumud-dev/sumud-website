import { defineConfig } from 'drizzle-kit';

function buildDbUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.PGHOST || process.env.DB_HOST;
  const database = process.env.PGDATABASE || process.env.DB_NAME;
  if (host && database) {
    const port = process.env.PGPORT || process.env.DB_PORT;
    const user = process.env.PGUSER || process.env.DB_USER;
    const pass = process.env.PGPASSWORD || process.env.DB_PASS;
    const auth = user ? `${encodeURIComponent(user)}${pass ? `:${encodeURIComponent(pass)}` : ''}@` : '';
    const portPart = port ? `:${port}` : '';
    return `postgresql://${auth}${host}${portPart}/${database}`;
  }

  throw new Error(
    'Missing database configuration. Set DATABASE_URL or PGHOST+PGDATABASE (or DB_HOST+DB_NAME) in your environment.'
  );
}

export default defineConfig({
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: buildDbUrl(),
  },
  verbose: true,
  strict: true,
});

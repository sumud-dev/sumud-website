import { NextResponse } from 'next/server';
import { db, pool } from '@/src/lib/db';
import { posts, campaigns, events } from '@/src/lib/db/schema';
import { sql, count } from 'drizzle-orm';

export async function GET() {
  try {
    // Test 1: Basic connection and get current time
    const timeResult = await db.execute<{ current_time: Date; pg_version: string }>(
      sql`SELECT NOW() as current_time, version() as pg_version`
    );

    // Test 2: Query with Drizzle - count records in each table
    const [postsCount, campaignsCount, eventsCount] = await Promise.all([
      db.select({ count: count() }).from(posts),
      db.select({ count: count() }).from(campaigns),
      db.select({ count: count() }).from(events),
    ]);

    // Test 3: List all tables (using raw query)
    const tablesResult = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name
    `);

    // Test 4: Get database stats
    const statsResult = await pool.query(`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT count(*) FROM pg_stat_activity) as total_connections,
        current_database() as database_name
    `);

    return NextResponse.json({
      success: true,
      message: 'Drizzle ORM connection successful',
      data: {
        serverTime: timeResult.rows[0].current_time,
        postgresVersion: timeResult.rows[0].pg_version,
        database: statsResult.rows[0].database_name,
        connections: {
          active: statsResult.rows[0].active_connections,
          total: statsResult.rows[0].total_connections,
        },
        drizzleQueries: {
          postsCount: postsCount[0].count,
          campaignsCount: campaignsCount[0].count,
          eventsCount: eventsCount[0].count,
        },
        tables: tablesResult.rows,
        tableCount: tablesResult.rows.length,
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

# Drizzle ORM Setup Guide

This project uses **Drizzle ORM** for type-safe database operations with PostgreSQL.

## 📁 File Structure

```
src/lib/db/
├── index.ts              # Database client and connection pool
├── schema/
│   ├── index.ts         # Schema exports
│   ├── posts.ts         # Post and PostTranslation tables
│   ├── campaigns.ts     # Campaign, SubCampaign tables
│   └── content.ts       # SiteContent, Pages, Events tables
└── queries.ts           # Example queries and operations

drizzle.config.ts        # Drizzle Kit configuration
```

## 🚀 Quick Start

### Import and Use

```typescript
import { db } from '@/src/lib/db';
import { posts, campaigns } from '@/src/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Simple select
const allPosts = await db.select().from(posts);

// With conditions
const post = await db
  .select()
  .from(posts)
  .where(eq(posts.slug, 'my-post'))
  .limit(1);

// Insert
const newPost = await db
  .insert(posts)
  .values({
    slug: 'new-post',
    author: 'John Doe',
  })
  .returning();
```

## 📚 Available NPM Scripts

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Push schema changes directly (dev only)
npm run db:push

# Open Drizzle Studio (visual database explorer)
npm run db:studio

# Pull/introspect existing database schema
npm run db:introspect
```

## 🔧 Common Operations

### 1. Query Examples

See [src/lib/db/queries.ts](src/lib/db/queries.ts) for comprehensive examples including:
- SELECT with filters, joins, pagination
- INSERT with returning
- UPDATE operations
- DELETE operations
- Transactions
- Search with LIKE

### 2. Making Schema Changes

```bash
# 1. Edit schema files in src/lib/db/schema/
# 2. Generate migration
npm run db:generate

# 3. Review migration in drizzle/ folder
# 4. Apply migration
npm run db:migrate
```

### 3. Using Drizzle Studio

```bash
npm run db:studio
# Opens at https://local.drizzle.studio
```

Visual browser for your database with:
- Browse all tables
- Edit rows
- Run queries
- View relationships

## 📊 Database Schema

### Tables Overview

**Posts:**
- `posts` - Base post data (id, slug, author, coverImage, metadata)
- `post_translations` - Localized content (title, description, content)

**Campaigns:**
- `campaigns` - Campaign data (target, current amount, dates)
- `campaign_translations` - Localized campaign content
- `sub_campaigns` - Sub-campaigns linked to main campaigns
- `sub_campaign_translations` - Localized sub-campaign content

**Content:**
- `site_content` - Key-value site content
- `site_content_translations` - Localized site content
- `pages` - Static pages
- `events` - Event listings

## 🔗 Type Safety

Drizzle provides full TypeScript types:

```typescript
import { type Post, type NewPost } from '@/src/lib/db/schema';

// NewPost = insert type (without generated fields)
const newPost: NewPost = {
  slug: 'example',
  author: 'John',
};

// Post = select type (with all fields including generated)
const post: Post = await db.select()...
```

## 🛠️ Advanced Usage

### Transactions

```typescript
await db.transaction(async (tx) => {
  const [post] = await tx.insert(posts).values(data).returning();
  await tx.insert(postTranslations).values(translations);
  return post;
});
```

### Complex Joins

```typescript
const result = await db
  .select({
    postId: posts.id,
    postSlug: posts.slug,
    translationTitle: postTranslations.title,
  })
  .from(posts)
  .leftJoin(postTranslations, eq(posts.id, postTranslations.postId))
  .where(eq(postTranslations.locale, 'en'));
```

### Raw SQL (when needed)

```typescript
import { sql } from 'drizzle-orm';

const result = await db.execute(
  sql`SELECT * FROM posts WHERE slug = ${slug}`
);
```

## 🧪 Testing Connection

Visit: http://localhost:3001/api/test-db

Returns:
- Connection status
- PostgreSQL version
- Table counts using Drizzle queries
- Active connections

## 📖 Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Operators](https://orm.drizzle.team/docs/operators)
- [Drizzle Examples](https://github.com/drizzle-team/drizzle-orm/tree/main/examples)

## 🔍 Tips

1. **Use Drizzle Studio** for quick data inspection: `npm run db:studio`
2. **Prefer `db.push`** in development for rapid iteration (skips migrations)
3. **Use migrations** in production for version control
4. **Check generated SQL** in console logs (enabled by default)
5. **Import operators** from `drizzle-orm`: `eq`, `and`, `or`, `like`, `gt`, etc.

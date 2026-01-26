import { db } from "@/src/lib/db";
import { 
  pageBuilder,
  type PageBuilder,
  type NewPageBuilder
} from "@/src/lib/db/schema/page-builder";
import { eq, and, or, like, desc, asc, sql, count, SQL, isNull, isNotNull } from "drizzle-orm";

// ============================================================================
// TYPES
// ============================================================================

export interface PageWithTranslations extends PageBuilder {
  translations?: PageBuilder[];
}

export interface PageRecord {
  id: string;
  slug: string;
  path: string;
  parentId: string | null;
  title: string;
  content: {
    type: 'blocks' | 'markdown' | 'html';
    data: unknown;
  } | null;
  metadata: {
    description?: string;
    image?: string;
    keywords?: string[];
    customFields?: Record<string, unknown>;
  } | null;
  seoTitle: string | null;
  seoDescription: string | null;
  featuredImage: string | null;
  layout: string | null;
  showInMenu: boolean;
  menuOrder: string | null;
  author: string | null;
  authorName: string | null;
  isActive: boolean;
  isFeatured: boolean;
  status: string;
  language: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isTranslation: boolean;
}

export interface PageQueryFilters {
  status?: 'draft' | 'published' | 'archived';
  language?: string;
  search?: string;
  showInMenu?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface PagePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'menuOrder';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPageResult {
  pages: PageRecord[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert database record to PageRecord
 */
function normalizePageFromDb(dbRecord: PageBuilder): PageRecord {
  return {
    id: dbRecord.id,
    slug: dbRecord.slug,
    path: dbRecord.path,
    parentId: dbRecord.parentId,
    title: dbRecord.title,
    content: dbRecord.content,
    metadata: dbRecord.metadata,
    seoTitle: dbRecord.seoTitle,
    seoDescription: dbRecord.seoDescription,
    featuredImage: dbRecord.featuredImage,
    layout: dbRecord.layout,
    showInMenu: dbRecord.showInMenu,
    menuOrder: dbRecord.menuOrder,
    author: dbRecord.author,
    authorName: dbRecord.authorName,
    isActive: dbRecord.isActive,
    isFeatured: dbRecord.isFeatured,
    status: dbRecord.status,
    language: dbRecord.language,
    publishedAt: dbRecord.publishedAt,
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
    isTranslation: dbRecord.parentId !== null,
  };
}

/**
 * Get page with all its translations
 */
export async function getPageWithTranslations(
  pageId: string
): Promise<PageWithTranslations | null> {
  // Get the primary page
  const [primaryPage] = await db
    .select()
    .from(pageBuilder)
    .where(eq(pageBuilder.id, pageId))
    .limit(1);

  if (!primaryPage) return null;

  // Get all translations for this page
  const translations = await db
    .select()
    .from(pageBuilder)
    .where(eq(pageBuilder.parentId, pageId));

  return {
    ...primaryPage,
    translations,
  };
}

/**
 * Get translations for a specific page
 */
export async function getPageTranslations(
  pageId: string
): Promise<PageBuilder[]> {
  return db
    .select()
    .from(pageBuilder)
    .where(eq(pageBuilder.parentId, pageId));
}

/**
 * Build WHERE clause from filters for primary pages
 */
function buildPageWhereClause(filters: PageQueryFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.language) {
    conditions.push(eq(pageBuilder.language, filters.language));
  }

  if (filters.status) {
    conditions.push(eq(pageBuilder.status, filters.status));
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(pageBuilder.isActive, filters.isActive));
  }

  if (filters.isFeatured !== undefined) {
    conditions.push(eq(pageBuilder.isFeatured, filters.isFeatured));
  }

  if (filters.showInMenu !== undefined) {
    conditions.push(eq(pageBuilder.showInMenu, filters.showInMenu));
  }

  if (filters.search) {
    conditions.push(
      or(
        like(pageBuilder.title, `%${filters.search}%`),
        like(pageBuilder.path, `%${filters.search}%`)
      )!
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Get ORDER BY clause from pagination options
 */
function buildPageOrderByClause(options: PagePaginationOptions): SQL {
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  const columnMap = {
    createdAt: pageBuilder.createdAt,
    publishedAt: pageBuilder.publishedAt,
    title: pageBuilder.title,
    menuOrder: pageBuilder.menuOrder,
  };

  const sortColumn = columnMap[sortBy];
  return sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);
}

// ============================================================================
// READ QUERY FUNCTIONS
// ============================================================================

/**
 * List pages with pagination and filtering
 * Works with parent-child structure in single table
 */
export async function listPagesPaginated(
  filters: PageQueryFilters = {},
  paginationOptions: PagePaginationOptions = {}
): Promise<PaginatedPageResult> {
  const currentPage = paginationOptions.page || 1;
  const pageSize = paginationOptions.limit || 50;
  const offset = (currentPage - 1) * pageSize;

  const orderByClause = buildPageOrderByClause(paginationOptions);

  // Build conditions based on filters
  const conditions: SQL[] = [];
  
  if (filters.language) {
    conditions.push(eq(pageBuilder.language, filters.language));
  }
  if (filters.status) {
    conditions.push(eq(pageBuilder.status, filters.status));
  }
  if (filters.isActive !== undefined) {
    conditions.push(eq(pageBuilder.isActive, filters.isActive));
  }
  if (filters.isFeatured !== undefined) {
    conditions.push(eq(pageBuilder.isFeatured, filters.isFeatured));
  }
  if (filters.showInMenu !== undefined) {
    conditions.push(eq(pageBuilder.showInMenu, filters.showInMenu));
  }
  if (filters.search) {
    conditions.push(
      or(
        like(pageBuilder.title, `%${filters.search}%`),
        like(pageBuilder.path, `%${filters.search}%`)
      )!
    );
  }

  // Get count
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(pageBuilder)
    .where(whereClause);

  const totalItems = Number(totalCount);
  const totalPages = Math.ceil(totalItems / pageSize);

  // Get paginated results
  const results = await db
    .select()
    .from(pageBuilder)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(pageSize)
    .offset(offset);

  return {
    pages: results.map(normalizePageFromDb),
    pagination: {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
}

/**
 * Find page by path (primary pages only)
 */
export async function findPageByPath(
  pagePath: string
): Promise<PageRecord | null> {
  const [pageResult] = await db
    .select()
    .from(pageBuilder)
    .where(eq(pageBuilder.path, pagePath))
    .limit(1);

  return pageResult ? normalizePageFromDb(pageResult) : null;
}

/**
 * Find page by slug and language
 */
export async function findPageBySlugAndLanguage(
  pageSlug: string,
  pageLanguage: string
): Promise<PageRecord | null> {
  const [page] = await db
    .select()
    .from(pageBuilder)
    .where(
      and(
        eq(pageBuilder.slug, pageSlug),
        eq(pageBuilder.language, pageLanguage)
      )
    )
    .limit(1);

  return page ? normalizePageFromDb(page) : null;
}

/**
 * Get all published pages for a language
 */
export async function getPublishedPages(
  pageLanguage: string,
  pageLimit?: number
): Promise<PageRecord[]> {
  const baseQuery = db
    .select()
    .from(pageBuilder)
    .where(
      and(
        eq(pageBuilder.language, pageLanguage),
        eq(pageBuilder.status, 'published'),
        eq(pageBuilder.isActive, true)
      )
    )
    .orderBy(asc(pageBuilder.menuOrder), desc(pageBuilder.createdAt));

  const publishedResults = pageLimit 
    ? await baseQuery.limit(pageLimit)
    : await baseQuery;
    
  return publishedResults.map(normalizePageFromDb);
}

/**
 * Get all translations for a page (pages with this parentId)
 */
export async function findTranslationsForPage(
  primaryPageId: string
): Promise<PageRecord[]> {
  const translations = await db
    .select()
    .from(pageBuilder)
    .where(eq(pageBuilder.parentId, primaryPageId));

  return translations.map(normalizePageFromDb);
}

/**
 * Check if page slug exists for a specific language
 */
export async function pageSlugExists(
  pageSlug: string,
  language?: string
): Promise<boolean> {
  const conditions = language
    ? and(eq(pageBuilder.slug, pageSlug), eq(pageBuilder.language, language))
    : eq(pageBuilder.slug, pageSlug);

  const [exists] = await db
    .select({ id: pageBuilder.id })
    .from(pageBuilder)
    .where(conditions)
    .limit(1);

  return !!exists;
}

/**
 * Check if page path exists for a specific language
 */
export async function pagePathExists(
  pagePath: string,
  language?: string
): Promise<boolean> {
  const conditions = language
    ? and(eq(pageBuilder.path, pagePath), eq(pageBuilder.language, language))
    : eq(pageBuilder.path, pagePath);

  const [exists] = await db
    .select({ id: pageBuilder.id })
    .from(pageBuilder)
    .where(conditions)
    .limit(1);

  return !!exists;
}

// ============================================================================
// WRITE MUTATION FUNCTIONS
// ============================================================================

/**
 * Create a new primary page
 */
export async function createPage(
  pageData: NewPageBuilder
): Promise<PageRecord> {
  const [newPage] = await db
    .insert(pageBuilder)
    .values({
      ...pageData,
      updatedAt: new Date(),
    })
    .returning();

  return normalizePageFromDb(newPage);
}

/**
 * Create a page translation (page with parentId set)
 */
export async function createPageTranslation(
  translationData: NewPageBuilder
): Promise<PageRecord> {
  const [newTranslation] = await db
    .insert(pageBuilder)
    .values({
      ...translationData,
      updatedAt: new Date(),
    })
    .returning();

  return normalizePageFromDb(newTranslation);
}

/**
 * Update a primary page
 */
export async function updatePage(
  pageId: string,
  pageData: Partial<NewPageBuilder>
): Promise<PageRecord | null> {
  const [updatedPage] = await db
    .update(pageBuilder)
    .set({
      ...pageData,
      updatedAt: new Date(),
    })
    .where(eq(pageBuilder.id, pageId))
    .returning();

  return updatedPage ? normalizePageFromDb(updatedPage) : null;
}

/**
 * Update a page translation (same as updatePage, kept for API consistency)
 */
export async function updatePageTranslation(
  translationId: string,
  translationData: Partial<NewPageBuilder>
): Promise<PageRecord | null> {
  return updatePage(translationId, translationData);
}

/**
 * Delete a primary page and all its translations (CASCADE handles translations)
 */
export async function deletePage(pageId: string): Promise<boolean> {
  const [deletedPage] = await db
    .delete(pageBuilder)
    .where(eq(pageBuilder.id, pageId))
    .returning();

  return !!deletedPage;
}

/**
 * Delete a single page translation
 */
export async function deletePageTranslation(
  translationId: string
): Promise<boolean> {
  const [deletedTranslation] = await db
    .delete(pageBuilder)
    .where(eq(pageBuilder.id, translationId))
    .returning();

  return !!deletedTranslation;
}

/**
 * Publish a page (set status to published)
 */
export async function publishPage(pageId: string): Promise<PageRecord | null> {
  return updatePage(pageId, {
    status: 'published',
    publishedAt: new Date(),
  });
}

/**
 * Unpublish a page (set status to draft)
 */
export async function unpublishPage(
  pageId: string
): Promise<PageRecord | null> {
  return updatePage(pageId, {
    status: 'draft',
  });
}

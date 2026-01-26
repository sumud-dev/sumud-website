import { db } from "@/src/lib/db";
import { posts, postTranslations } from "@/src/lib/db/schema/posts";
import { eq } from "drizzle-orm";
import type { PostRecord } from "./posts.queries";

/**
 * Create original post (user-created article)
 */
export async function createOriginalPost(articleData: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  language: string;
  type?: string;
  status?: string;
  featuredImage?: string | null;
  categories?: string[];
  authorId?: string | null;
  authorName?: string | null;
}): Promise<PostRecord> {
  const currentTimestamp = new Date();

  const [createdPost] = await db
    .insert(posts)
    .values({
      slug: articleData.slug,
      title: articleData.title,
      excerpt: articleData.excerpt,
      content: articleData.content,
      language: articleData.language,
      type: articleData.type || 'article',
      status: articleData.status || 'draft',
      featuredImage: articleData.featuredImage || null,
      categories: articleData.categories || [],
      authorId: articleData.authorId || null,
      authorName: articleData.authorName || null,
      publishedAt: articleData.status === 'published' ? currentTimestamp : null,
      viewCount: 0,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    })
    .returning();

  return {
    id: createdPost.id,
    slug: createdPost.slug,
    title: createdPost.title,
    excerpt: createdPost.excerpt,
    content: createdPost.content,
    language: createdPost.language,
    type: createdPost.type,
    status: createdPost.status,
    featuredImage: createdPost.featuredImage,
    categories: createdPost.categories,
    authorId: createdPost.authorId,
    authorName: createdPost.authorName,
    publishedAt: createdPost.publishedAt,
    createdAt: createdPost.createdAt,
    updatedAt: createdPost.updatedAt,
    viewCount: createdPost.viewCount,
    isTranslation: false,
    parentPostId: null,
    translatedFromLanguage: null,
    translationQuality: null,
  };
}

/**
 * Create translation (AI-generated article)
 */
export async function createTranslationForPost(translationData: {
  parentPostId: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  language: string;
  translatedFromLanguage: string;
  type: string;
  status: string;
  featuredImage?: string | null;
  categories: string[];
  publishedAt?: Date | null;
}): Promise<PostRecord> {
  const currentTimestamp = new Date();

  const [createdTranslation] = await db
    .insert(postTranslations)
    .values({
      postId: translationData.parentPostId,
      slug: translationData.slug,
      title: translationData.title,
      excerpt: translationData.excerpt,
      content: translationData.content,
      language: translationData.language,
      translatedFrom: translationData.translatedFromLanguage,
      type: translationData.type,
      status: translationData.status,
      featuredImage: translationData.featuredImage || null,
      categories: translationData.categories,
      publishedAt: translationData.publishedAt || null,
      translatedAt: currentTimestamp,
      translationQuality: 'auto',
      viewCount: 0,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    })
    .returning();

  return {
    id: createdTranslation.id,
    slug: createdTranslation.slug,
    title: createdTranslation.title,
    excerpt: createdTranslation.excerpt,
    content: createdTranslation.content,
    language: createdTranslation.language,
    type: createdTranslation.type,
    status: createdTranslation.status,
    featuredImage: createdTranslation.featuredImage,
    categories: createdTranslation.categories,
    authorId: null,
    authorName: null,
    publishedAt: createdTranslation.publishedAt,
    createdAt: createdTranslation.createdAt,
    updatedAt: createdTranslation.updatedAt,
    viewCount: createdTranslation.viewCount,
    isTranslation: true,
    parentPostId: createdTranslation.postId,
    translatedFromLanguage: createdTranslation.translatedFrom,
    translationQuality: createdTranslation.translationQuality,
  };
}

/**
 * Update original post
 */
export async function updateOriginalPost(
  postId: string,
  updateData: Partial<{
    title: string;
    excerpt: string;
    content: string;
    status: string;
    language: string;
    featuredImage: string | null;
    categories: string[];
    publishedAt: Date | null;
  }>
): Promise<PostRecord | null> {
  const currentTimestamp = new Date();

  const [updatedPost] = await db
    .update(posts)
    .set({
      ...updateData,
      updatedAt: currentTimestamp,
    })
    .where(eq(posts.id, postId))
    .returning();

  if (!updatedPost) return null;

  return {
    id: updatedPost.id,
    slug: updatedPost.slug,
    title: updatedPost.title,
    excerpt: updatedPost.excerpt,
    content: updatedPost.content,
    language: updatedPost.language,
    type: updatedPost.type,
    status: updatedPost.status,
    featuredImage: updatedPost.featuredImage,
    categories: updatedPost.categories,
    authorId: updatedPost.authorId,
    authorName: updatedPost.authorName,
    publishedAt: updatedPost.publishedAt,
    createdAt: updatedPost.createdAt,
    updatedAt: updatedPost.updatedAt,
    viewCount: updatedPost.viewCount,
    isTranslation: false,
    parentPostId: null,
    translatedFromLanguage: null,
    translationQuality: null,
  };
}

/**
 * Update translation
 */
export async function updateTranslation(
  translationId: string,
  updateData: Partial<{
    title: string;
    excerpt: string;
    content: string;
    status: string;
    translationQuality: string;
  }>
): Promise<PostRecord | null> {
  const currentTimestamp = new Date();

  const [updatedTranslation] = await db
    .update(postTranslations)
    .set({
      ...updateData,
      updatedAt: currentTimestamp,
    })
    .where(eq(postTranslations.id, translationId))
    .returning();

  if (!updatedTranslation) return null;

  return {
    id: updatedTranslation.id,
    slug: updatedTranslation.slug,
    title: updatedTranslation.title,
    excerpt: updatedTranslation.excerpt,
    content: updatedTranslation.content,
    language: updatedTranslation.language,
    type: updatedTranslation.type,
    status: updatedTranslation.status,
    featuredImage: updatedTranslation.featuredImage,
    categories: updatedTranslation.categories,
    authorId: null,
    authorName: null,
    publishedAt: updatedTranslation.publishedAt,
    createdAt: updatedTranslation.createdAt,
    updatedAt: updatedTranslation.updatedAt,
    viewCount: updatedTranslation.viewCount,
    isTranslation: true,
    parentPostId: updatedTranslation.postId,
    translatedFromLanguage: updatedTranslation.translatedFrom,
    translationQuality: updatedTranslation.translationQuality,
  };
}

/**
 * Delete original post (cascade deletes translations)
 */
export async function deleteOriginalPost(postId: string): Promise<number> {
  const deletedPosts = await db
    .delete(posts)
    .where(eq(posts.id, postId))
    .returning();

  return deletedPosts.length;
}

/**
 * Delete translation only
 */
export async function deleteTranslation(translationId: string): Promise<number> {
  const deletedTranslations = await db
    .delete(postTranslations)
    .where(eq(postTranslations.id, translationId))
    .returning();

  return deletedTranslations.length;
}
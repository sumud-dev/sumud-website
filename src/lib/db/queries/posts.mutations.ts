import { db } from "@/src/lib/db";
import { posts } from "@/src/lib/db/schema/posts";
import { eq } from "drizzle-orm";
import type { 
  PostRecord, 
  CreateOriginalPostInput, 
  CreateTranslationPostInput, 
  UpdateOriginalPostInput 
} from "@/src/lib/types/article";

/**
 * Create original post (user-created article)
 */
export async function createOriginalPost(articleData: CreateOriginalPostInput): Promise<PostRecord> {
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
      parentPostId: null,
      isTranslation: false,
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
export async function createTranslationForPost(translationData: CreateTranslationPostInput): Promise<PostRecord> {
  const currentTimestamp = new Date();

  const [createdTranslation] = await db
    .insert(posts)
    .values({
      parentPostId: translationData.parentPostId,
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
      isTranslation: true,
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
    authorId: createdTranslation.authorId,
    authorName: createdTranslation.authorName,
    publishedAt: createdTranslation.publishedAt,
    createdAt: createdTranslation.createdAt,
    updatedAt: createdTranslation.updatedAt,
    viewCount: createdTranslation.viewCount,
    isTranslation: true,
    parentPostId: createdTranslation.parentPostId,
    translatedFromLanguage: createdTranslation.translatedFrom,
    translationQuality: null,
  };
}

/**
 * Update original post
 */
export async function updateOriginalPost(
  postId: string,
  updateData: UpdateOriginalPostInput
): Promise<PostRecord | null> {
  const currentTimestamp = new Date();
  
  // Fetch existing post to validate changes
  const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!existingPost) return null;
  
  // Note: slug is not included in updateData type - slugs should never change
  
  // Prevent language change on translations
  if (existingPost.isTranslation && updateData.language && updateData.language !== existingPost.language) {
    throw new Error("Cannot change language on translation posts");
  }
  
  // Prevent turning original into translation by setting parentPostId
  if (!existingPost.isTranslation && (updateData as any).parentPostId) {
    throw new Error("Cannot turn original post into translation");
  }

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
    isTranslation: updatedPost.isTranslation,
    parentPostId: updatedPost.parentPostId,
    translatedFromLanguage: updatedPost.translatedFrom,
    translationQuality: null,
  };
}

/**
 * Delete original post (cascade deletes translations)
 */
export async function deleteOriginalPost(postId: string): Promise<number> {
  // First, count the translations that will be deleted
  const translations = await db
    .select()
    .from(posts)
    .where(eq(posts.parentPostId, postId));
  
  const translationCount = translations.length;
  
  // Delete the original post (this will cascade delete all translations)
  const deletedPosts = await db
    .delete(posts)
    .where(eq(posts.id, postId))
    .returning();

  // Return total count: original post + its translations
  return deletedPosts.length + translationCount;
}

/**
 * Delete translation only
 */
export async function deleteTranslation(translationId: string): Promise<number> {
  const deletedTranslations = await db
    .delete(posts)
    .where(eq(posts.id, translationId))
    .returning();

  return deletedTranslations.length;
}
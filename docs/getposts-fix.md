export async function updatePost(
  slug: string, 
  data: {
    title?: string;
    excerpt?: string;
    content?: string;
    status?: "draft" | "published" | "archived";
    featured_image?: string | null;
    meta_description?: string | null;
    language?: string;
    autoTranslate?: boolean;
  },
  language: string = "en"
) {
  try {
    const now = new Date();
    const updateData: any = {
      updatedAt: now,
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured_image !== undefined) updateData.featuredImage = data.featured_image;

    const targetLanguage = data.language || language;

    // For Finnish: Update posts table
    // For English/Arabic: Update postTranslations table
    if (targetLanguage === "fi") {
      const [existingPost] = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

      if (existingPost) {
        await db
          .update(posts)
          .set(updateData)
          .where(eq(posts.slug, slug));
      } else {
        const [existingTranslation] = await db
          .select()
          .from(postTranslations)
          .where(
            and(
              eq(postTranslations.slug, slug),
              eq(postTranslations.language, "fi")
            )
          )
          .limit(1);

        if (existingTranslation) {
          await db
            .update(postTranslations)
            .set(updateData)
            .where(
              and(
                eq(postTranslations.slug, slug),
                eq(postTranslations.language, "fi")
              )
            );
        } else {
          return { success: false, error: "Finnish post not found" };
        }
      }
    } else {
      // For English/Arabic: Update postTranslations table
      const [existingTranslation] = await db
        .select()
        .from(postTranslations)
        .where(
          and(
            eq(postTranslations.slug, slug),
            eq(postTranslations.language, targetLanguage)
          )
        )
        .limit(1);

      if (existingTranslation) {
        await db
          .update(postTranslations)
          .set(updateData)
          .where(
            and(
              eq(postTranslations.slug, slug),
              eq(postTranslations.language, targetLanguage)
            )
          );
      } else {
        // Create new translation
        const [basePost] = await db
          .select()
          .from(posts)
          .where(eq(posts.slug, slug))
          .limit(1);

        let metadata = basePost;
        if (!metadata) {
          const [anyTranslation] = await db
            .select()
            .from(postTranslations)
            .where(eq(postTranslations.slug, slug))
            .limit(1);
          metadata = anyTranslation as any;
        }

        if (!metadata) {
          return { success: false, error: "No existing article found to update" };
        }

        await db.insert(postTranslations).values({
          postId: basePost?.id || null,
          slug,
          language: targetLanguage,
          title: data.title || metadata.title || "",
          excerpt: data.excerpt || metadata.excerpt || "",
          content: data.content || metadata.content || "",
          type: "article",
          status: data.status || metadata.status || "draft",
          featuredImage: data.featured_image !== undefined ? data.featured_image : metadata.featuredImage,
          categories: metadata.categories || [],
          authorId: metadata.authorId,
          authorName: metadata.authorName,
          publishedAt: data.status === "published" ? now : metadata.publishedAt,
          createdAt: now,
          updatedAt: now,
        });
      }

      // ✅ FIX: Check Finnish version exists for THIS specific article
      const [finnishPost] = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

      const [finnishBySlug] = await db
        .select()
        .from(postTranslations)
        .where(
          and(
            eq(postTranslations.slug, slug),  // ✅ CRITICAL: Filter by slug!
            eq(postTranslations.language, "fi")
          )
        )
        .limit(1);

      // If no Finnish version exists for THIS article, create it
      if (!finnishPost && !finnishBySlug) {
        const sourceData = {
          title: data.title || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
        };

        let finnishContent = sourceData;
        let finnishSlug = slug;
        
        if (data.autoTranslate && data.title && data.content && data.excerpt) {
          try {
            const { translations } = await translateContentToAllLocales(
              { title: data.title, content: data.content, excerpt: data.excerpt },
              targetLanguage as SupportedLocale,
              ARTICLE_TRANSLATION_CONFIG
            );
            if (translations.fi?.title) {
              finnishContent = {
                title: translations.fi.title as string,
                excerpt: translations.fi.excerpt as string,
                content: translations.fi.content as string,
              };
              finnishSlug = generateSlug(translations.fi.title as string);
            }
          } catch (e) {
            console.warn("Failed to translate to Finnish:", e);
          }
        }

        const finnishExists = await slugExistsForLanguage(finnishSlug, "fi");
        if (!finnishExists) {
          await db.insert(postTranslations).values({
            postId: null,
            slug: finnishSlug,
            language: "fi",
            title: finnishContent.title || `[FI] ${data.title}`,
            excerpt: finnishContent.excerpt || data.excerpt || "",
            content: finnishContent.content || data.content || "",
            type: "article",
            status: data.status || "draft",
            featuredImage: data.featured_image || null,
            categories: [],
            authorId: null,
            authorName: null,
            publishedAt: data.status === "published" ? now : null,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    // Handle auto-translation for other languages
    if (data.autoTranslate && data.title && data.content && data.excerpt) {
      try {
        const sourceLocale = targetLanguage as SupportedLocale;
        const contentToTranslate = {
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
        };

        const { translations, error: translationError } = await translateContentToAllLocales(
          contentToTranslate,
          sourceLocale,
          ARTICLE_TRANSLATION_CONFIG
        );

        if (translationError) {
          console.warn("Translation warning:", translationError);
        }

        const targetLocales = (["en", "fi", "ar"] as SupportedLocale[]).filter(
          (locale) => locale !== sourceLocale
        );

        for (const locale of targetLocales) {
          const translatedContent = translations[locale];
          if (!translatedContent || !translatedContent.title) {
            console.warn(`Skipping ${locale} - no translation available`);
            continue;
          }

          const translatedUpdateData = {
            updatedAt: now,
            title: translatedContent.title as string,
            content: translatedContent.content as string,
            excerpt: translatedContent.excerpt as string,
            status: data.status,
          };

          if (locale === "fi") {
            const [finnishPost] = await db
              .select()
              .from(posts)
              .where(eq(posts.slug, slug))
              .limit(1);

            if (finnishPost) {
              await db
                .update(posts)
                .set(translatedUpdateData)
                .where(eq(posts.slug, slug));
            } else {
              // ✅ FIX: Always filter by BOTH slug AND language
              const [existingBySlug] = await db
                .select()
                .from(postTranslations)
                .where(
                  and(
                    eq(postTranslations.slug, slug),  // ✅ CRITICAL: Filter by slug!
                    eq(postTranslations.language, "fi")
                  )
                )
                .limit(1);

              if (existingBySlug) {
                await db
                  .update(postTranslations)
                  .set(translatedUpdateData)
                  .where(
                    and(
                      eq(postTranslations.slug, slug),
                      eq(postTranslations.language, "fi")
                    )
                  );
              } else {
                const finnishSlug = generateSlug(translatedContent.title as string);
                const finnishExists = await slugExistsForLanguage(finnishSlug, "fi");
                
                if (!finnishExists) {
                  await db.insert(postTranslations).values({
                    postId: null,
                    slug: finnishSlug,
                    language: "fi",
                    type: "article",
                    featuredImage: data.featured_image || null,
                    categories: [],
                    authorId: null,
                    authorName: null,
                    publishedAt: data.status === "published" ? now : null,
                    createdAt: now,
                    ...translatedUpdateData,
                  });
                }
              }
            }
          } else {
            // Update English/Arabic in postTranslations
            const [existing] = await db
              .select()
              .from(postTranslations)
              .where(
                and(
                  eq(postTranslations.slug, slug),
                  eq(postTranslations.language, locale)
                )
              )
              .limit(1);

            if (existing) {
              await db
                .update(postTranslations)
                .set(translatedUpdateData)
                .where(
                  and(
                    eq(postTranslations.slug, slug),
                    eq(postTranslations.language, locale)
                  )
                );
            } else {
              const translatedSlug = generateSlug(translatedContent.title as string);
              const translationExists = await slugExistsForLanguage(translatedSlug, locale);
              
              if (!translationExists) {
                await db.insert(postTranslations).values({
                  postId: null,
                  slug: translatedSlug,
                  language: locale,
                  type: "article",
                  featuredImage: data.featured_image || null,
                  categories: [],
                  authorId: null,
                  authorName: null,
                  publishedAt: data.status === "published" ? now : null,
                  createdAt: now,
                  ...translatedUpdateData,
                });
              }
            }
          }
        }
      } catch (translationError) {
        console.error("Auto-translation failed:", translationError);
      }
    }

    revalidatePath("/[locale]/articles", "page");
    revalidatePath("/[locale]/admin/articles", "page");
    revalidatePath(`/[locale]/articles/${slug}`, "page");

    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update post" 
    };
  }
}
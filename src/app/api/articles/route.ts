import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { mapPostToArticle, type ArticlesApiResponse } from "@/src/lib/types/article";
import { createPostWithTranslation, type CreatePostData } from "@/src/actions/article.actions";
import type { Locale } from "@/src/types/Content";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get("language");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const supabase = await createClient();

    // Start building the query
    let query = supabase
      .from("posts")
      .select("*", { count: "exact" });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (language) {
      query = query.eq("language", language);
    }

    if (category) {
      // categories is a string[] column, use contains for array filtering
      query = query.contains("categories", [category]);
    }

    if (search) {
      // Search in title and excerpt
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    // Order by published_at descending (newest first)
    query = query.order("published_at", { ascending: false, nullsFirst: false });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching articles:", error);
      return NextResponse.json(
        { error: "Failed to fetch articles" },
        { status: 500 }
      );
    }

    // Map database posts to Article type
    const articles = (data || []).map(mapPostToArticle);

    const response: ArticlesApiResponse = {
      data: articles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Articles API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      slug,
      content,
      excerpt,
      status = "draft",
      featured_image,
      language = "en",
      categories = [],
      author_name,
      autoTranslate = false,
    } = body;

    // Validate required fields
    if (!title || !slug || !content || !excerpt) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, content, excerpt" },
        { status: 400 }
      );
    }

    // Validate language
    if (!["en", "ar", "fi"].includes(language)) {
      return NextResponse.json(
        { error: "Invalid language. Must be one of: en, ar, fi" },
        { status: 400 }
      );
    }

    const postData: CreatePostData = {
      title,
      slug,
      content,
      excerpt,
      status,
      featured_image,
      language: language as Locale,
      categories,
      author_name,
    };

    const result = await createPostWithTranslation(postData, autoTranslate);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create article" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: autoTranslate
        ? `Article created and translated to ${result.createdPosts.length} locale(s)`
        : "Article created successfully",
      createdPosts: result.createdPosts,
      warning: result.error, // Partial success message
    });
  } catch (error) {
    console.error("Create article API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

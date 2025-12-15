import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { mapPostToArticle, type ArticleApiResponse } from "@/src/lib/types/article";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching article:", error);
      return NextResponse.json(
        { error: "Failed to fetch article" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const article = mapPostToArticle(data);

    const response: ArticleApiResponse = {
      data: article,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Article API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listPages, readPage } from "@/src/lib/pages/file-storage";

/**
 * GET /api/pages
 * List all pages (for admin) or published pages only (for public)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const slug = searchParams.get("slug");

    // If requesting a specific page
    if (slug) {
      const page = await readPage(slug);
      if (!page) {
        return NextResponse.json(
          { success: false, error: "Page not found" },
          { status: 404 }
        );
      }

      // Check if user is authenticated for draft pages
      const { userId } = await auth();
      if (page.status === "draft" && !userId) {
        return NextResponse.json(
          { success: false, error: "Page not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: page });
    }

    // List all pages
    const pages = await listPages();

    // Filter by status if specified
    let filteredPages = pages;
    if (status) {
      filteredPages = pages.filter((p) => p.status === status);
    } else {
      // If not authenticated, only show published pages
      const { userId } = await auth();
      if (!userId) {
        filteredPages = pages.filter((p) => p.status === "published");
      }
    }

    return NextResponse.json({ success: true, data: filteredPages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getAllPages,
  getPageWithContent
} from "@/src/actions/pages.actions";

/**
 * GET /api/pages
 * List all pages (for admin) or published pages only (for public)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const slug = searchParams.get("slug");
    const language = (searchParams.get("language") || "en") as 'en' | 'fi';

    // If requesting a specific page
    if (slug) {
      // Get all pages and find by slug
      const allPages = await getAllPages();
      const page = allPages.find(p => p.slug === slug);
      
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

      // Get page content for the requested language
      const pageWithContent = await getPageWithContent(page.id, language);

      return NextResponse.json({ success: true, data: pageWithContent });
    }

    // List all pages from database
    const { userId } = await auth();
    let pages = await getAllPages();
    
    // Apply filters based on status and authentication
    if (status) {
      pages = pages.filter(p => p.status === status);
    } else if (!userId) {
      // If not authenticated, only show published pages
      pages = pages.filter(p => p.status === 'published');
    }

    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

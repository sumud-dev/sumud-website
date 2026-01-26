import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  listPagesPaginated, 
  findPageBySlugAndLanguage 
} from "@/src/lib/db/queries/pages.queries";

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
      const page = await findPageBySlugAndLanguage(slug, language);
      
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

    // List all pages from database
    const { userId } = await auth();
    const filters = status ? { status: status as 'draft' | 'published' | 'archived', isActive: true } : { isActive: true };
    
    // If not authenticated, only show published pages
    if (!userId && !status) {
      filters.status = 'published';
    }
    
    const { pages } = await listPagesPaginated(
      filters,
      { limit: 1000, sortBy: 'createdAt', sortOrder: 'desc' }
    );

    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/src/lib/supabase/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/src/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root path to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/fi", request.url));
  }

  // First, handle i18n routing
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware wants to redirect (e.g., adding locale prefix), do that first
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Then handle Supabase session
  const sessionResponse = await updateSession(request);

  // If session update returned a redirect or error, use that
  if (sessionResponse.status !== 200) {
    return sessionResponse;
  }

  // Merge cookies from session response into intl response
  const response = NextResponse.next({
    request,
    headers: intlResponse.headers,
  });

  // Copy intl response cookies
  intlResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });

  // Copy Supabase session cookies
  sessionResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/",
    "/(fi|en|ar)/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

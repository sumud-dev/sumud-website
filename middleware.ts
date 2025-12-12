import { type NextRequest } from "next/server";
import { updateSession } from "@/src/lib/supabase/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/src/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
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

  // Return the intl response with any cookies set by Supabase
  // Copy cookies from session response to intl response
  sessionResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/src/i18n/routing";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/auth", "/api/auth", "/api/sanity", "/api/supabase"];

// Routes that require authentication (add more as needed)
const PROTECTED_ROUTES = ["/admin"];

// Get the locale from the pathname
function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment && routing.locales.includes(firstSegment as typeof routing.locales[number])) {
    return firstSegment;
  }
  return null;
}

// Remove locale prefix from pathname for route matching
function getPathnameWithoutLocale(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (locale) {
    const withoutLocale = pathname.replace(`/${locale}`, "") || "/";
    return withoutLocale;
  }
  return pathname;
}

function isPublicRoute(pathname: string): boolean {
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  return PUBLIC_ROUTES.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );
}

function isProtectedRoute(pathname: string): boolean {
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  return PROTECTED_ROUTES.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  // For protected routes, redirect to login if not authenticated
  if (isProtectedRoute(pathname) && !user) {
    const url = request.nextUrl.clone();
    const locale = getLocaleFromPathname(pathname);
    // Preserve the locale in the redirect URL
    url.pathname = locale ? `/${locale}/auth/login` : "/auth/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  return supabaseResponse;
}

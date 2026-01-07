import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/src/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/:locale/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip i18n middleware for API routes
  if (req.nextUrl.pathname.startsWith('/api')) {
    return;
  }

  // Handle protected routes - Clerk will redirect to its sign-in page
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Apply i18n middleware
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

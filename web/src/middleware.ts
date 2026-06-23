import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sitemap.xml",
  "/robots.txt",
  "/problems(.*)",
  "/compilers",
  "/contests(.*)",
  "/roadmap",
  "/auth/login(.*)",
  "/auth/register(.*)",
  "/auth/forgot-password(.*)",
  "/u/(.*)",
  "/academy(.*)",
  "/systemdesign",
  "/systemdesign/learn(.*)",
  "/companies(.*)",
  "/leaderboard(.*)",
  "/report-bug",
  "/terms",
  "/privacy",
  "/api/v1/auth/webhooks/clerk", // Always public
  "/opengraph-image",
  "/(.*)/opengraph-image",
  "/monitoring",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

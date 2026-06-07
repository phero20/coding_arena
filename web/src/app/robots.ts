import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Use the environment variable if available, otherwise fallback to the production domain.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://slavecode.codes";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/settings/", // Private user settings
        "/api/",      // Next.js API routes (if any)
        "/admin/",    // Admin panels (if any)
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

# SEO Routes

The route definitions for SEO aggregation.

**File Location**: [api/src/routes/seo/seo.routes.ts](../../../api/src/routes/seo/seo.routes.ts)

## API Endpoints

### 1. Generate Sitemap
- **Method**: `GET`
- **Path**: `/api/v1/seo/sitemap`
- **Auth Required**: No (`requireAuth: false`)
- **Controller Action**: `seoController.generateSitemap`
- **Description**: Public route hit by the Next.js frontend (or bots directly) to generate the XML sitemap. Because this fetches the entire database of slugs, it is usually heavily cached on the frontend edge network.

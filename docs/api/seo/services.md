# SEO Services

The `SeoService` acts as a cross-module data aggregator to build the sitemap.

**File Location**: [api/src/services/seo/seo.service.ts](../../../api/src/services/seo/seo.service.ts)

## Responsibilities

1. **Cross-Repository Injection**: The service injects `ProblemRepository`, `ContestRepository` (via Drizzle/Postgres), and `CompanyRepository` into its constructor.
2. **`generateSitemapUrls`**: 
   - Uses `Promise.all` to fetch all public slugs across the three main entity types concurrently.
   - For `problems`, it fetches the `slug` and `updatedAt`.
   - For `contests`, it fetches the unique `slug`.
   - For `companies`, it fetches the specific company `slug`.
   - Returns a structured object that the frontend `sitemap.ts` file can easily consume to render valid XML.

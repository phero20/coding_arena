# SEO Controllers

The `SeoController` routes the incoming HTTP request to the `SeoService`.

**File Location**: [api/src/controllers/seo/seo.controller.ts](../../../api/src/controllers/seo/seo.controller.ts)

## Actions

1. **`generateSitemap`**
   - **Validation**: None.
   - **Action**: Awaits the Promise from `seoService.generateSitemapUrls()`.
   - **Response Structure**: Wraps the resulting object containing arrays of `problems`, `contests`, and `companies` into the standard `ApiResponse.success()`.

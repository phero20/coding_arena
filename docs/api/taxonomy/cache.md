# Taxonomy Cache Layer

The `TaxonomyCache` uses the Decorator Pattern to wrap the `TaxonomyService` and aggressively cache the tag list.

**File Location**: [api/src/cache/taxonomy/taxonomy.cache.ts](../../../api/src/cache/taxonomy/taxonomy.cache.ts)

## Caching Strategy

Because tags are fetched on almost every page load (to populate sidebars and filter dropdowns), caching is strictly enforced.

- **`getAllTags`**: Caches the entire JSON array.
  - **Key**: `taxonomy:tags:all`
  - **TTL**: 86400 seconds (24 hours).
- **`getTagBySlug`**:
  - **Key**: `taxonomy:tags:{slug}`
  - **TTL**: 86400 seconds (24 hours).

## Cache Invalidation

When an admin updates the tagging structure:
- **`createTag` / `updateTag` / `deleteTag`**: The cache decorator automatically executes a wildcard flush (`redis.del('taxonomy:tags:*')`). This ensures all dropdowns globally update the next time they are fetched.

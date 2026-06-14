# Taxonomy Services

The `TaxonomyService` handles the business logic surrounding category generation.

**File Location**: [api/src/services/taxonomy/taxonomy.service.ts](../../../api/src/services/taxonomy/taxonomy.service.ts)

## Responsibilities

- Provides basic validation to ensure duplicate `slugs` aren't created by admins.
- Exists primarily to be wrapped by the `TaxonomyCache` decorator, keeping the business logic agnostic to the heavy Redis caching happening around it.

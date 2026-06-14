# Taxonomy Repositories

The `TaxonomyRepository` handles MongoDB Mongoose operations for the `Tag` collection.

**File Location**: [api/src/repositories/taxonomy/taxonomy.repository.ts](../../../api/src/repositories/taxonomy/taxonomy.repository.ts)

## Responsibilities

1. **`findAll`**: Fetches the master list of all tags, usually sorted alphabetically by name.
2. **`findBySlug`**: Performs an exact match on the `slug` string.
3. **`create` / `update` / `delete`**: Standard Mongoose mutators for maintaining the global taxonomy graph.

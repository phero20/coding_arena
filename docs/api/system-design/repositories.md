# System Design Repositories

The `SystemDesignRepository` handles MongoDB Mongoose operations for the `SystemDesign` collection.

**File Location**: [api/src/repositories/system-design/system-design.repository.ts](../../../api/src/repositories/system-design/system-design.repository.ts)

## Responsibilities

1. **`findMany`**: Handles grid queries. Uses the `$in` operator to match `tags`, exact matches for `difficulty`, and applies `.skip()` and `.limit()` for pagination.
2. **`findBySlug`**: Fetches the document using the unique `slug` field rather than the MongoDB `_id`.
3. **`create` / `delete`**: Standard Mongoose mutators.

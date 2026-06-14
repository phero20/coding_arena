# Taxonomy Controllers

The `TaxonomyController` extracts HTTP parameters for tag administration and retrieval.

**File Location**: [api/src/controllers/taxonomy/taxonomy.controller.ts](../../../api/src/controllers/taxonomy/taxonomy.controller.ts)

## Actions

1. **`getAllTags`**
   - **Validation**: None.
   - **Action**: Awaits `taxonomyService.getAllTags()`.

2. **`getTagBySlug`**
   - **Validation**: Extracts `slug` from path.
   - **Action**: Looks up the document and returns a 404 if not found.

3. **`createTag`**
   - **Validation**: Extracts `name` and `slug` from body.
   - **Action**: Passes data to the service layer.

4. **`updateTag`**
   - **Validation**: Extracts `id` from path, `name` and `slug` from body.
   - **Action**: Passes data to the service layer.

5. **`deleteTag`**
   - **Validation**: Extracts `id` from path.
   - **Action**: Passes data to the service layer.

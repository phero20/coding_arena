# System Design Controllers

The `SystemDesignController` is responsible for extracting the URL queries and JSON bodies before passing them to the service layer.

**File Location**: [api/src/controllers/system-design/system-design.controller.ts](../../../api/src/controllers/system-design/system-design.controller.ts)

## Actions

1. **`getAll`**
   - **Validation**: Extracts `limit`, `skip`, `difficulty`, and `tags` from the HTTP query parameters.
   - **Action**: Passes them to the `SystemDesignService` and standardizes the response.

2. **`getBySlug`**
   - **Validation**: Extracts the `slug` param.
   - **Action**: Looks up the document and returns a 404 if not found.

3. **`create` / `delete`**
   - Basic pass-through administrative functions.

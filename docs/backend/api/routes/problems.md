# API Reference: Problems

The Problems API provides access to the library of coding challenges. All routes are prefixed with `/api/v1`.

## 📚 Problem Retrieval

### `GET /problems`
Fetches a paginated list of all available problems.
*   **Auth Required**: No
*   **Query Params**:
    *   `page`: `number` (Default: 1)
    *   `limit`: `number` (Default: 50)
*   **Response**: 
    ```json
    {
      "problems": [Problem],
      "total": number
    }
    ```

### `GET /problems/:slug`
Fetches a detailed problem definition by its URL slug.
*   **Auth Required**: No
*   **Params**: `slug` (String, e.g., `two-sum`)

### `GET /problems/id/:problem_id`
Fetches a problem by its internal MongoDB `problem_id`.
*   **Auth Required**: No

### `GET /problems/topic/:topic`
Fetches problems associated with a specific topic or tag.
*   **Auth Required**: No
*   **Query Params**: Pagination supported (`page`, `limit`).

---

## 🛠 Administration

### `POST /problems`
Creates or updates a problem definition.
*   **Auth Required**: Yes (Admin Role Required)
*   **Body (`json`)**:
    ```json
    {
      "title": "string",
      "problem_id": "string",
      "difficulty": "Easy | Medium | Hard",
      "description": "Markdown text",
      "function_signature": {
        "name": "string",
        "return_type": "string",
        "params": [{ "name": "string", "type": "string" }]
      }
    }
    ```

# API Reference: Taxonomy

The Taxonomy API manages the hierarchical organization of problems into Topics, Patterns, and Categories.

## 🌳 Hierarchy Discovery

### `GET /taxonomy/tree`
Retrieves the entire recursive category tree.
*   **Auth Required**: No
*   **Response**: A nested JSON structure representing the Topic -> Pattern -> Sub-pattern hierarchy.

### `GET /taxonomy/:slug`
Fetches the details of a specific category, including all mapped problems.
*   **Auth Required**: No
*   **Params**: `slug` (e.g., `sliding-window`).

### `GET /taxonomy/detail/:id`
Alternative to slug-based lookup; fetches a category by its UUID.
*   **Auth Required**: No

---

## 🛠 Mapping & Management

### `POST /taxonomy/categories`
Creates a new node in the taxonomy tree.
*   **Auth Required**: Yes (Admin Only)
*   **Body**: 
    ```json
    {
      "name": "string",
      "slug": "string",
      "parentId": "uuid (optional)",
      "description": "string",
      "order": number
    }
    ```

### `POST /taxonomy/map`
Maps a specific MongoDB Problem to a Postgres Category.
*   **Auth Required**: Yes (Admin Only)

### `POST /taxonomy/map/batch`
Maps multiple problems to a single category in a single request.
*   **Auth Required**: Yes (Admin Only)

### `DELETE /taxonomy/map/:categoryId/:problemId`
Removes the association between a problem and a category.
*   **Auth Required**: Yes (Admin Only)

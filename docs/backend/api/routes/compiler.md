# API Reference: Compiler

The Compiler API provides direct, low-level access to the Judge0 execution engine and language metadata.

## 🛠 Execution & Metadata

### `GET /compiler/languages`
Fetches a list of all programming languages supported by the environment.
*   **Auth Required**: No
*   **Response**: Array of language objects including `id`, `name`, and `is_archived`.

### `POST /compiler/execute`
Executes raw code without problem-specific context. Used for a "Scratchpad" or "Playground" feature.
*   **Auth Required**: No
*   **Rate Limit**: 5 requests per minute
*   **Body (`json`)**:
    ```json
    {
      "language_id": number,
      "source_code": "string",
      "stdin": "string (optional)"
    }
    ```
*   **Response**: Returns the raw execution result from Judge0.

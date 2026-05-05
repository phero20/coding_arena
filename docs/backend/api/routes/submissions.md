# API Reference: Submissions

The Submissions API manages the execution and persistence of user-submitted code. All routes are prefixed with `/api/v1`.

## 🚀 Code Execution

### `POST /submissions/run`
Executes code against sample test cases. This data is ephemeral and used for development feedback.
*   **Auth Required**: Yes
*   **Rate Limit**: 10 requests per minute
*   **Body (`json`)**:
    ```json
    {
      "problemId": "string (required)",
      "languageId": "string (required, e.g., '62' for Java)",
      "sourceCode": "string (required)"
    }
    ```

### `POST /submissions/submit`
Performs a formal evaluation against all test cases (Public + Hidden).
*   **Auth Required**: Yes
*   **Rate Limit**: 5 requests per minute
*   **Body (`json`)**:
    ```json
    {
      "problemId": "string (required)",
      "languageId": "string (required)",
      "sourceCode": "string (required)",
      "arenaMatchId": "string (optional)"
    }
    ```
    *   *Note: Providing `arenaMatchId` will associate this submission with an ongoing Arena Match for scoring.*

---

## 🔍 Retrieval

### `GET /submissions/:submissionId`
Fetches the status and results of a specific submission.
*   **Auth Required**: No

### `GET /submissions/recent`
Fetches a list of the most recent submissions across the platform.
*   **Auth Required**: No
*   **Query Params**: Pagination supported (`limit`).

### `GET /submissions/problem/:problemId`
Fetches all submissions made by the current user for a specific problem.
*   **Auth Required**: Yes

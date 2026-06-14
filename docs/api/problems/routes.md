# Problems Routes

The Problems module exposes endpoints via three separate route files to keep concerns strictly separated.

**File Location**: [api/src/routes/problems/](../../../api/src/routes/problems/)

## 1. `problem.routes.ts`

Handles the core lifecycle of a coding challenge.

- **GET `/api/v1/problems`**: Public grid fetch (with pagination/filters).
- **GET `/api/v1/problems/slug/:slug`**: Public fetch of a specific problem.
- **POST `/api/v1/problems`**: **Admin Only** route to create a problem.
- **PATCH `/api/v1/problems/:id`**: **Admin Only** route to update metadata.
- **DELETE `/api/v1/problems/:id`**: **Admin Only** route to soft-delete a problem.

## 2. `problem-test.routes.ts`

Handles the deeply nested test cases associated with a problem.

- **GET `/api/v1/problems/:problemId/tests`**: Public route to fetch *only* public sample test cases.
- **POST `/api/v1/problems/:problemId/tests`**: **Admin Only** route to upload new hidden/public test cases.
- **PUT `/api/v1/problems/:problemId/tests/cases/:testCaseId`**: **Admin Only** route to edit a specific case.
- **DELETE `/api/v1/problems/:problemId/tests/cases/:testCaseId`**: **Admin Only** route to remove a test case.

## 3. `ai-problem.routes.ts`

Handles the automated AI generation workflows. All these routes are heavily restricted.

- **POST `/api/v1/ai/problems/generate`**: **Admin Only** route. Triggers the Groq LLM to generate a problem based on a text prompt.
- **POST `/api/v1/ai/problems/generate/tests`**: **Admin Only** route. Triggers the LLM to generate robust edge-case tests for an existing problem.
- **POST `/api/v1/ai/problems/canonicalize`**: **Admin Only** route. Uses the LLM to parse raw pasted text into strict JSON test case arrays.
- **POST `/api/v1/ai/problems/add-solution`**: **Admin Only** route. Triggers AWS Bedrock (Claude) to solve a given problem and attach the solution to the database.

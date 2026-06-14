# Problems Repositories

The repositories handle all MongoDB operations using Mongoose. Crucially, the problems and their test cases are stored in separate collections.

**File Location**: [api/src/repositories/problems/](../../../api/src/repositories/problems/)

## 1. `problem.repository.ts`

Manages the `Problem` collection (`problems`).

### Responsibilities:
- **Grid Queries (`findMany`)**: Handles complex Mongoose queries to filter problems by `difficulty`, match any `tags` using `$in`, and supports pagination using `skip` and `limit`.
- **Slug Lookups**: Fetches a single problem by its SEO-friendly `slug` rather than its `_id`.

## 2. `problem-test.repository.ts`

Manages the `ProblemTest` collection (`problem_tests`).

### Why separate collections?
Test cases are massive arrays of JSON objects. If they were embedded inside the main `Problem` document, fetching the grid of 100 problems would accidentally pull down megabytes of hidden test case data!

By separating them:
1. Grid queries remain lightning fast.
2. It's impossible to accidentally leak hidden test cases to the frontend because the test cases aren't even queried unless explicitly requested.

### Operations:
- Stores tests strictly grouped by `type`: `"public"` (samples shown on the UI) vs `"hidden"` (used by the background Judge worker).

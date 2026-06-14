# Submissions Repositories

The `SubmissionRepository` handles MongoDB Mongoose operations for the user submissions.

**File Location**: [api/src/repositories/submissions/submission.repository.ts](../../../api/src/repositories/submissions/submission.repository.ts)

## Responsibilities

1. **`create`**: Inserts a new submission in the `PENDING` state. Used by the API.
2. **`updateStatus`**: Updates the submission with the final `status`, `memory`, `time`, and `testCasesPassed` when evaluation completes. Used by the background Worker.
3. **`findByToken`**: Fast lookup by `_id` used by the frontend polling mechanism.
4. **`findUserSubmissions`**: Paginated grid query to fetch a user's submission history, often filtered by `problemId` or `status`.

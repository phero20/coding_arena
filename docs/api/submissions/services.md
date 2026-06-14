# Submissions Services

Because Running and Submitting code are fundamentally different operational pipelines, they are split into two distinct services.

**File Location**: [api/src/services/submissions/](../../../api/src/services/submissions/)

## 1. `execution.service.ts` ("Run Code")

This service provides a fast feedback loop for the user.
- **Workflow**: 
  1. Instantiates `DriverJudgeExecutionService`.
  2. Fetches ONLY the public sample test cases.
  3. Awaits the Judge0 execution inline (synchronously).
  4. Never saves the code to the database.
- **Goal**: Speed. The user gets instant feedback on syntax errors or sample test failures.

## 2. `submission.service.ts` ("Submit")

This is the heavy-lifting pipeline.
- **Workflow**:
  1. Validates the problem exists.
  2. **Persists to DB**: Creates a `Submission` document in MongoDB with a `PENDING` status.
  3. **Queue Push**: Pushes a job containing the `submissionId` onto the `BullMQ` queue.
  4. Returns the `token` (the MongoDB `_id`) to the user immediately.
- **Goal**: Scalability. Thousands of users can hit "Submit" simultaneously. The API servers respond instantly, while the dedicated Worker nodes pull from the queue and evaluate them against 100+ hidden test cases at their own pace.

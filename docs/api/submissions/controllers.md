# Submissions Controllers

The `SubmissionController` acts as the traffic cop, routing the validated user code to the appropriate service pipeline.

**File Location**: [api/src/controllers/submissions/submission.controller.ts](../../../api/src/controllers/submissions/submission.controller.ts)

## Actions

1. **`executeCode`**
   - **Validation**: Extracts `sourceCode`, `languageId`, and `problemId` from the body.
   - **Action**: Awaits the synchronous response from `executionService.execute()`. Returns the results of the sample test cases instantly.

2. **`submitCode`**
   - **Validation**: Extracts `sourceCode`, `languageId`, and `problemId`.
   - **Action**: Passes the payload to `submissionService.submit()`. This does NOT return the evaluation result. It returns a `token` (Job ID) so the frontend can begin polling.

3. **`pollSubmission`**
   - **Validation**: Extracts the `token` from the URL parameters.
   - **Action**: Looks up the token in MongoDB. If the `status` is still `PENDING`, it returns a 202 Accepted. If completed, it returns the final verdict.

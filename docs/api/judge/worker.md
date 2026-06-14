# Background Worker (BullMQ)

The Submission Worker handles the asynchronous processing of code evaluation jobs off the main thread.

**File Location**: [api/src/workers/submission/](../../../api/src/workers/submission/)

## 1. `processor.ts`

The Processor acts as the master orchestrator for a single background job. When BullMQ pops a `SubmissionEvaluationJob` from the queue, `processSubmissionJob()` takes over.

### Responsibilities:
- **Tracing & Observability**: Generates a `traceId` and creates a child logger. Starts a clock timer (`requestStartTime`).
- **Evaluation Delegation**: Passes the raw source code and language ID to the `evaluator.ts`.
- **Database Update**: Once evaluation finishes, calculates the exact `executionTime` and calls `submissionRepository.updateSubmissionStatus()` to save the terminal status and test case breakdown.
- **Stats Propagation**: Asynchronously fires `statsSubmissionService.handleSubmissionUpdate()` to update the user's heatmaps, success rates, and PostgreSQL stats.
- **Arena Match Integration**: If `jobData.arenaMatchId` exists, it forwards the evaluation to `arenaMatchService.handleMatchSubmission()`. This ensures that live Arena lobbies instantly react to passing/failing submissions.
- **Metrics**: Uses `metrics.recordVerdict()` and logs health reports every 10 jobs.
- **Retry Logic**: If the evaluation fails due to an external network error, the job will retry. If it exhausts all `maxAttempts` (default: 3), the worker forces a `SYSTEM_ERROR` update on the database to prevent infinite hanging.

---

## 2. `evaluator.ts`

The Evaluator is a specialized data aggregator. Its sole job is to prepare the payload *before* sending it to the Judge execution service.

### Responsibilities:
1. **Test Case Hydration**: Queries the `problemTestRepository` to fetch *both* `public` and `hidden` test cases for the problem.
2. **Indexing**: Flattens the test cases into a single sequential `TestCase` array with proper indexes.
3. **Execution Routing**: 
   - If the language is natively supported by the sandbox, it routes to `driverJudgeExecutionService.evaluate()`.
   - If the language is exotic or not supported by the sandbox, it falls back to the experimental `aiJudgeCache.runSamples()`.
4. **Standardization**: Maps the complex output from the services into a standardized `SubmissionEvaluationResult` that the processor can easily digest.

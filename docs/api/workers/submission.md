# Submission Worker

The **Submission Worker** is the largest and most complex background process in the application. It acts as the backbone for the entire Code Execution pipeline.

**File Location**: [api/src/workers/submission/](../../../api/src/workers/submission/)

## Architecture

This worker handles the heavy lifting when a user hits "Submit Code". Because evaluating arbitrary code against 100+ hidden test cases can take seconds, it must be completely decoupled from the HTTP API.

### 1. `submission.worker.ts`
The entrypoint. It binds the BullMQ `Worker` to the Redis queue, attaches the custom `processor.ts` function, and hooks up the real-time Socket.io bindings from `events.ts`.

### 2. `processor.ts`
The master controller of the submission lifecycle. When a job is pulled off the queue, it executes this precise sequence:
1. **Delegates to Evaluator**: Passes the raw code to `evaluator.ts`.
2. **MongoDB Update**: Saves the final execution results, memory/time stats, and compilation outputs to the MongoDB `Submission` document.
3. **PostgreSQL Stats Update**: Fires off an async request to `statsSubmissionService.handleSubmissionUpdate()` to update the user's global heatmap and "Solved" counts.
4. **Arena Match Scoring**: If the submission belonged to a multiplayer Arena match (`jobData.arenaMatchId`), it delegates to the `ArenaMatchService` to update scores and broadcast strikes to other players in real-time.
5. **Metrics**: Logs health metrics to Prometheus/Datadog dashboards.

### 3. `evaluator.ts`
The execution abstraction layer. 
- It fetches the **public AND hidden** test cases from the database.
- **Driver Judge**: If the language is standard (e.g., Python, C++, Java), it sends the payload to the secure execution engine.
- **AI Judge Fallback**: If the language is unsupported or strictly text-based (e.g., SQL, Bash), it falls back to the `AiJudgeCache` to have Amazon Bedrock (DeepSeek/Claude) statically analyze the syntax and validate the output.

### 4. `events.ts`
The real-time bridge. It listens to BullMQ events (`completed`, `failed`, `active`) and broadcasts them over Socket.io directly to the frontend. This is how the UI transitions from `PENDING` -> `RUNNING` -> `ACCEPTED` without requiring the user to refresh the page.

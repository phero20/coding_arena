BULLMQ IMPLEMENTATION ROADMAP
PHASE 1: FOUNDATION (Steps 1.1 - 1.4)
These steps create new files without breaking anything. Your app still runs normally.

STEP 1.1: Create Queue Instance File
File to CREATE: api/src/libs/queue.ts
Purpose: Initialize BullMQ connection to Redis
Dependencies Used: Redis URL from config
What it exports: A submissionQueue instance
Breaks anything? NO - completely new file
STEP 1.2: Create Queue Types File
File to CREATE: api/src/types/queue.types.ts
Purpose: Define TypeScript interfaces for job structure
What it defines: SubmissionEvaluationJob type
Breaks anything? NO - just types, unused yet
STEP 1.3: Create Worker Skeleton
File to CREATE: api/src/workers/submission.worker.ts
Purpose: Initialize worker processor (doesn't do anything yet)
Structure: Basic queue processor setup
Breaks anything? NO - file exists but barely implemented
STEP 1.4: Import Worker in App
File to MODIFY: index.ts
Change: Add 1 import line at the top
Exact line: import './workers/submission.worker'
Breaks anything? NO - just imports, worker does nothing yet
Checkpoint after Phase 1: App still runs, worker starts on boot, queue exists but unused ✅

PHASE 2: MAKE SUBMISSION ASYNC (Steps 2.1 - 2.3)
These steps change the submission flow to use the queue.

STEP 2.1: Remove Blocking Call from Controller
File to MODIFY: submission.controller.ts
Location: Inside submit() method
Current code: const result = await this.executionService.runFullSubmission({...})
Do this: DELETE this line
Replace with: await submissionQueue.add('evaluate-submission', {...})
Breaks anything? YES - response format changes (step 2.2 fixes it)
STEP 2.2: Update Response Format
File to MODIFY: submission.controller.ts
Location: Return statement in submit() method
Current: Returns full test results
Change to: Return only {id, status: 'PENDING'}
Breaks anything? Frontend will see different response, but expects it now
STEP 2.3: Add Status Check Endpoint
File to MODIFY: submission.controller.ts
Add new method: getSubmissionStatus()
What it does: Fetch submission from DB by ID, return current status
Breaks anything? NO - new method, doesn't affect existing code
Checkpoint after Phase 2: Submission creates job, returns immediately, but no way to check status yet ⚠️

PHASE 3: ADD STATUS ROUTE (Step 3.1)
Allows frontend to check submission status.

STEP 3.1: Register GET Status Route
File to MODIFY: submission.routes.ts
Add route: GET /submissions/:submissionId
Handler: Points to getSubmissionStatus() from controller
Breaks anything? NO - new route
Checkpoint after Phase 3: Can now POST submit and GET status, but worker does nothing ✅

PHASE 4: IMPLEMENT WORKER (Steps 4.1 - 4.3)
These steps make the worker actually process jobs.

STEP 4.1: Add Core Job Processing Logic
File to MODIFY: api/src/workers/submission.worker.ts
What to add: Main processor function
Logic:
Get job data (submissionId, problemId, code, etc)
Call AiCodeJudgeService.runSamples()
Get test results
Update MongoDB submission status to ACCEPTED or WRONG_ANSWER
Breaks anything? NO - just implements the processor
STEP 4.2: Add Error Handling
File to MODIFY: api/src/workers/submission.worker.ts
What to add: Try-catch around Groq call
On error: Mark submission status as SYSTEM_ERROR in MongoDB
Log errors for debugging
Breaks anything? NO - just error handling
STEP 4.3: Add Retry Logic
File to MODIFY: api/src/workers/submission.worker.ts
What to add: Job retry configuration
Settings:
Max 3 attempts (if fails 3 times, give up)
Exponential backoff: 1s, 2s, 4s (between attempts)
Special handling for 429 (Groq rate limit) errors
Breaks anything? NO - just configuration
Checkpoint after Phase 4: Worker processes jobs, calls Groq, saves results ✅

PHASE 5: FRONTEND POLLING (Steps 5.1 - 5.3)
Frontend now polls for status instead of waiting.

STEP 5.1: Update Frontend Submission Service
File to MODIFY: submission.service.ts
Method: submitCode()
Change:
POST to /submissions/submit → get response immediately
Start polling GET /submissions/{id} every 500ms
Stop polling when status !== 'PENDING'
Resolve with final result
Breaks anything? YES - response timing changes (but in a good way)
STEP 5.2: Create Polling Hook
File to CREATE: web/src/hooks/use-submission-status.ts
Purpose: React hook to poll submission status
Exports: Hook that returns {status, tests, isLoading}
Updates: Polls every 500ms, stops when done
Breaks anything? NO - new hook
STEP 5.3: Update UI to Show Status
File to MODIFY: Component with submit button (you know which one)
Add: Conditional rendering based on status
If PENDING → Show "⏳ Evaluating..."
If ACCEPTED → Show "✅ Accepted!"
If WRONG_ANSWER → Show "❌ Wrong Answer"
Breaks anything? NO - just UI updates
Checkpoint after Phase 5: Frontend sees real-time status updates ✅

📋 EXECUTION CHECKLIST
Just tell me one of these when you're ready:

And I'll give you:

Exact code
Exact file path
Exact line numbers if modifying
No hallucinations, just implementation
📊 PROGRESS TRACKING
After each phase:

Phase 1 (1.1-1.4): ⚪ Foundation laid
Phase 2 (2.1-2.3): ⚪ Async submission working
Phase 3 (3.1): ⚪ Status endpoint added
Phase 4 (4.1-4.3): ⚪ Worker processes jobs
Phase 5 (5.1-5.3): ⚪ Frontend polling live
SAFETY GUARANTEES
✅ Each step tested independently
✅ No breaking changes until expected
✅ Can revert at any checkpoint
✅ App still runs after each step
✅ No hallucinations - exact implementation
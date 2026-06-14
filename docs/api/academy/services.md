# Academy Services

The Service layer contains the core business logic of the Academy module. Services are registered as singletons in the Awilix DI container and are completely agnostic of the HTTP layer (Hono). They orchestrate databases, caching, third-party APIs, and AI integrations.

## 1. `AcademyService`

**File**: [api/src/services/academy/academy.service.ts](../../../api/src/services/academy/academy.service.ts)

This service manages reading and fetching the static track curriculum. It communicates directly with `AcademyRepository`.

### Methods:
- **`getTracks()`**: Fetches all available programming tracks.
- **`getTrackConfig(slug: string)`**: Fetches the core configuration, including concepts and exercises, for a specific track.
- **`getTrackConcept(trackSlug, conceptSlug)`**: Fetches the markdown instructions and details for a specific educational concept.
- **`getTrackExercise(trackSlug, exerciseSlug)`**: Fetches an individual exercise prompt, stub, and tests.
- **`getSolvedExercises(userId, trackSlug)`**: Fetches an array of exercise slugs that a user has solved in Postgres.

---

## 2. `AcademyExecutionService`

**File**: [api/src/services/academy/academy-execution.service.ts](../../../api/src/services/academy/academy-execution.service.ts)

This service orchestrates the submission and grading of a user's code for an Academy exercise.

### Dependencies Injected:
- `academyRepository`, `userRepository`, `statsRepository`
- `judge0Service` (for standard remote execution)
- `academyAiJudgeService` (for AI-powered syntax grading)
- `statsService`, `submissionService`
- `leaderboardCache`

### Core Flow (`runExercise`):
1. **Language Check**: Verifies if the `trackSlug` has a fully supported Judge0 execution driver.
2. **AI Fallback (Temporary)**: Currently, all execution is routed through the `AcademyAiJudgeService` (to simulate code testing while Mini-Judge0 execution environments are built).
3. **Execution**: 
   - If AI: Calls `academyAiJudgeService.evaluate()`.
   - If Judge0: Uses driver scripts (`combine()`, `getParser()`) from the `/driver` package to combine user code with hidden tests and sends it to the execution cluster.
4. **Gamification**: If the submission passes (`ACCEPTED`), it calls private methods to:
   - Mark the exercise as solved in Postgres (`userAcademyExercises`).
   - Grant the user +10 XP and +2 Coins.
   - Update user stats and trigger Leaderboard cache invalidations.
5. **History Tracking**: Stores the raw submission code in the `submissions` table for history.

---

## 3. `AcademyAiJudgeService`

**File**: [api/src/services/academy/academy-ai-judge.service.ts](../../../api/src/services/academy/academy-ai-judge.service.ts)

A specialized service that leverages Groq/LLMs to evaluate user code dynamically when a strict Judge0 test driver is not available or suitable.

### Methods:
- **`evaluate(params)`**: Takes the user's code, the expected test code, and the exercise instructions. It constructs a prompt instructing the AI to act as a strict code evaluator, returning a structured JSON response indicating whether the code passed, failed, or had syntax errors, along with a helpful hint.

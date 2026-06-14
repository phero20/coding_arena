# Academy Routes

The Academy routes define the API surface for the frontend to interact with the Academy module. These are registered in `academy.routes.ts` using the **Hono** framework.

**File Location**: [api/src/routes/academy/academy.routes.ts](../../../api/src/routes/academy/academy.routes.ts)

## Dependencies Injected

The route registration function `registerAcademyRoutes` expects the following dependencies from the Awilix DI container:
- `academyController`: Handles data fetching.
- `academyExecutionController`: Handles code execution.
- `authMiddleware`: Secures protected routes via Clerk.
- `rateLimitMiddleware`: Protects expensive endpoints (like code execution) from abuse via Redis.

---

## API Endpoints

### 1. Get All Tracks
- **Method**: `GET`
- **Path**: `/api/v1/academy/tracks`
- **Auth Required**: No
- **Controller Action**: `academyController.getTracks`
- **Description**: Fetches a summary list of all available language tracks (e.g., Python, TypeScript, C++).

### 2. Get Track Configuration
- **Method**: `GET`
- **Path**: `/api/v1/academy/tracks/:slug`
- **Auth Required**: No
- **Controller Action**: `academyController.getTrackConfig`
- **Description**: Fetches the detailed configuration of a specific track, including its concepts, exercises, and syllabus.

### 3. Get Solved Exercises
- **Method**: `GET`
- **Path**: `/api/v1/academy/tracks/:trackSlug/solved`
- **Auth Required**: **Yes**
- **Controller Action**: `academyController.getSolvedExercises`
- **Description**: Fetches an array of exercise slugs that the currently authenticated user has successfully solved within the specified track.
- **Note**: Placed before generic dynamic routes to prevent `solved` from being parsed as a `conceptSlug`.

### 4. Get Track Concept
- **Method**: `GET`
- **Path**: `/api/v1/academy/tracks/:trackSlug/concepts/:conceptSlug`
- **Auth Required**: No
- **Controller Action**: `academyController.getTrackConcept`
- **Description**: Fetches the markdown and instructional content for a specific programming concept within a track.

### 5. Get Track Exercise
- **Method**: `GET`
- **Path**: `/api/v1/academy/tracks/:trackSlug/exercises/:exerciseSlug`
- **Auth Required**: No
- **Controller Action**: `academyController.getTrackExercise`
- **Description**: Fetches the details for a specific coding exercise, including the description, boilerplate code, and testing instructions.

### 6. Run Exercise (Code Execution)
- **Method**: `POST`
- **Path**: `/api/v1/academy/tracks/:trackSlug/exercises/:exerciseSlug/run`
- **Auth Required**: **Yes**
- **Rate Limit**: Max 10 requests per minute per user (`rl:academy_run`).
- **Validation**: Strict JSON validation using Zod (`RunAcademyExerciseSchema`).
- **Controller Action**: `academyExecutionController.runExercise`
- **Description**: Submits user code for remote execution and verification against the exercise's hidden test cases using Judge0.

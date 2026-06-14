# Academy Controllers

The controllers act as the bridge between the Hono HTTP routes and the core business logic (Services). They extend a shared `BaseController`, which handles standard request/response formatting, and resolve their dependencies directly from the Awilix `ICradle`.

## 1. `AcademyController`

**File**: [api/src/controllers/academy/academy.controller.ts](../../../api/src/controllers/academy/academy.controller.ts)

This controller is purely responsible for handling `GET` requests related to Academy curriculum data. It extracts parameters from the request path and delegates them to the `AcademyService`.

### Actions:
- **`getTracks`**: Calls `academyService.getTracks()`.
- **`getTrackConfig`**: Extracts `req.params.slug` and calls `academyService.getTrackConfig()`.
- **`getTrackConcept`**: Extracts `trackSlug` and `conceptSlug` from `req.params`.
- **`getTrackExercise`**: Extracts `trackSlug` and `exerciseSlug` from `req.params`.
- **`getSolvedExercises`**: Uses the authenticated `req.user?.id` (populated by auth middleware) to fetch the user's solved exercises for a track.

---

## 2. `AcademyExecutionController`

**File**: [api/src/controllers/academy/academy-execution.controller.ts](../../../api/src/controllers/academy/academy-execution.controller.ts)

This controller handles the dynamic execution of Academy code payloads.

### Payloads:
It relies on a Zod schema `RunAcademyExerciseSchema` to validate the incoming `POST` body:
```typescript
const RunAcademyExerciseSchema = z.object({
  userCode: z.string().min(1, "User code is required"),
  testCode: z.string().min(1, "Test code is required"),
});
```

### Actions:
- **`runExercise`**:
  1. Validates that the user is authenticated (`req.user?.id`).
  2. Extracts `trackSlug` and `exerciseSlug` from the URL.
  3. Extracts `userCode` and `testCode` from the validated JSON body.
  4. Delegates all extracted parameters to `academyExecutionService.runExercise()`.
  5. Catches and logs execution failures using the `createLogger` utility.

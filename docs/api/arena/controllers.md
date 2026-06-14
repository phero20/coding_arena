# Arena Controllers

The Arena controller acts as the bridge between the Hono HTTP routes and the complex matchmaking business logic. It extends `BaseController` and resolves its dependencies directly from the Awilix `ICradle`.

## `ArenaController`

**File**: [api/src/controllers/arena/arena.controller.ts](../../../api/src/controllers/arena/arena.controller.ts)

This controller is responsible for extracting parameters, handling pagination logic, and standardizing error handling for all Arena REST requests.

### Injected Services:
- `arenaService`: Handles room creation and generic lobby state.
- `arenaMatchService`: Handles detailed match history and post-match data.

### Actions:

1. **`getUserHistory`**
   - Extracts `userId` from params and `limit`/`offset` from the query string.
   - Defaults to `limit: 10, offset: 0` if not provided.
   - Delegates to `arenaMatchService.getMatchHistory`.

2. **`createRoom`**
   - Delegates the validated JSON body and the `req.clerkUserId` (from Auth Middleware) to `arenaService.createRoom`.

3. **`updateRoomProblem`**
   - Extracts and standardizes `roomId` (uppercasing it) from the URL.
   - Delegates to `arenaService.updateRoomProblem`.

4. **`startMatch`**
   - Extracts `roomId`.
   - Delegates to `arenaService.startMatch`, passing along the `req.requestId` to allow for distributed tracing.

5. **`getMatchStatus` & `getRoom`**
   - Simple fetch operations passing ID parameters directly to `arenaService`.

6. **`getMatchDetail`**
   - Delegates to `arenaMatchService.getMatchDetail` to retrieve heavy, post-match JSON reports.

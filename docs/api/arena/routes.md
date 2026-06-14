# Arena Routes

The Arena routes expose the REST API endpoints used by the frontend to initialize and manage multiplayer rooms before the WebSocket connection takes over.

**File Location**: [api/src/routes/arena/arena.routes.ts](../../../api/src/routes/arena/arena.routes.ts)

## Dependencies Injected

The route registration function `registerArenaRoutes` expects:
- `arenaController`: Handles the HTTP logic.
- `authMiddleware`: Secures all Arena REST endpoints (only authenticated users can create or join rooms).
- `rateLimitMiddleware`: Protects match creation endpoints from spam.

---

## API Endpoints

### 1. Create Room
- **Method**: `POST`
- **Path**: `/api/v1/arena/create`
- **Auth Required**: **Yes**
- **Rate Limit**: Max 5 requests per minute (`rl:arena_create`).
- **Validation**: Zod `createRoomSchema` (Validates mode, visibility, player limits).
- **Controller Action**: `arenaController.createRoom`
- **Description**: Creates a new multiplayer room and adds the creator as the first participant.

### 2. Get Room Details
- **Method**: `GET`
- **Path**: `/api/v1/arena/:roomId`
- **Auth Required**: **Yes**
- **Validation**: Zod `RoomIdParamSchema`.
- **Controller Action**: `arenaController.getRoom`
- **Description**: Fetches the current state of a room (participants, selected problem, host).

### 3. Update Room Problem
- **Method**: `PUT`
- **Path**: `/api/v1/arena/:roomId/problem`
- **Auth Required**: **Yes**
- **Validation**: Zod `updateRoomProblemSchema`.
- **Controller Action**: `arenaController.updateRoomProblem`
- **Description**: Allows the room host to select or change the coding problem assigned to the room before the match starts.

### 4. Start Match
- **Method**: `POST`
- **Path**: `/api/v1/arena/:roomId/start`
- **Auth Required**: **Yes**
- **Rate Limit**: Max 5 requests per minute (`rl:arena_start`).
- **Controller Action**: `arenaController.startMatch`
- **Description**: Transitions the room from a waiting lobby into an active match. This signals the Go Hub to begin accepting WebSockets.

### 5. Get Match Status
- **Method**: `GET`
- **Path**: `/api/v1/arena/match/:matchId/status`
- **Auth Required**: No (Publicly viewable)
- **Controller Action**: `arenaController.getMatchStatus`
- **Description**: Fetches the real-time status of an ongoing or completed match.

### 6. Get Match Details
- **Method**: `GET`
- **Path**: `/api/v1/arena/match/:matchId/details`
- **Auth Required**: No
- **Controller Action**: `arenaController.getMatchDetail`
- **Description**: Fetches the post-match summary, including winner, participants, and final code submissions.

### 7. Get User History
- **Method**: `GET`
- **Path**: `/api/v1/arena/u/:userId/history`
- **Auth Required**: No
- **Controller Action**: `arenaController.getUserHistory`
- **Description**: Fetches a paginated list of past matches a specific user has participated in for their profile page.

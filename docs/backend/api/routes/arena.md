# API Reference: Arena

The Arena API handles real-time competitive rooms, matchmaking, and player synchronization. All routes are prefixed with `/api/v1`.

## 🚪 Room Management

### `POST /arena/create`
Creates a new competitive room.
*   **Auth Required**: Yes
*   **Body (`json`)**:
    ```json
    {
      "problemId": "string (optional)",
      "problemSlug": "string (optional)",
      "difficulty": "Easy | Medium | Hard (optional)",
      "language": "string (optional)"
    }
    ```
*   **Response**: `201 Created` with the `ArenaRoom` object.

### `GET /arena/:roomId`
Fetches the current state of a room.
*   **Auth Required**: Yes
*   **Params**: `roomId` (String)

### `PUT /arena/:roomId/problem`
Updates the problem assigned to the room.
*   **Auth Required**: Yes (Host Only)
*   **Body (`json`)**:
    ```json
    {
      "problemId": "string (required)",
      "problemSlug": "string (required)",
      "difficulty": "string (optional)",
      "language": "string (optional)"
    }
    ```

---

## ⚔️ Match Control

### `POST /arena/:roomId/start`
Starts a match for all players currently in the room.
*   **Auth Required**: Yes (Host Only)
*   **Action**: 
    1.  Creates a permanent `ArenaMatch` record in MongoDB.
    2.  Resets player states in Redis.
    3.  Broadcasts `MATCH_STARTED` event via Go Hub.

### `GET /arena/match/:matchId/status`
Fetches the live status of an ongoing match.
*   **Auth Required**: No (Publicly viewable)

### `GET /arena/match/:matchId/details`
Fetches the final results and submissions of a completed match.
*   **Auth Required**: No

---

## 📜 User History

### `GET /arena/u/:userId/history`
Fetches the past match history for a specific user.
*   **Auth Required**: No

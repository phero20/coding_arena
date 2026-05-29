# Go Hub: WebSocket Protocol

The Arena Hub uses a bi-directional JSON-based protocol over WebSockets. All messages follow a consistent `{ "type": string, "payload": any }` structure.

## 📡 Connection Handshake

*   **Endpoint**: `ws://[HOST]:8080/ws/:roomId`
*   **Authentication**: The connection must include a valid Clerk JWT. The server locally verifies this using the provided PEM Public Key.
*   **Initial Sync**: Upon successful connection, the server immediately sends a `PLAYER_JOINED` message containing the full current state of the room.

## ⬆️ Client-to-Server (Incoming)

These messages are sent from the browser to the Go Hub.

| Message Type | Payload Structure | Description |
| :--- | :--- | :--- |
| `PROGRESS_UPDATE` | `{ "testsPassed": int, "totalTests": int }` | Updates the player's live score and test count. |
| `START_MATCH` | `{}` | Requests the match to start (Host only). |
| `LEAVE_ROOM` | `{}` | Signals an explicit leave from the lobby or match. |
| `UPDATE_MATCH_DURATION` | `{ "duration": int }` | Updates the match timer in minutes (Host only). |
| `KICK_PLAYER` | `{ "targetUserId": "string" }` | Removes a specific player from the lobby (Host only). |
| `ABORT_MATCH` | `{}` | Immediately terminates a live match (Host only). |

## ⬇️ Server-to-Client (Outgoing)

These messages are broadcast by the Hub to all clients in a room.

| Message Type | Description |
| :--- | :--- |
| `PLAYER_JOINED` | Broadcast when a new player joins or reconnects. |
| `PLAYER_LEFT` | Broadcast when a player explicitly leaves or disconnects. |
| `MATCH_STARTED` | Signals the transition from Lobby to Live competition. |
| `LEADERBOARD_UPDATE` | Triggered by Redis Pub/Sub when scores change. |
| `PROBLEM_CHANGED` | Broadcast when the room's problem is updated via the API. |
| `YOU_ARE_KICKED` | Sent directly to a player when they are removed by the host. |
| `ERROR` | Sent when an action fails (e.g., "Room Full"). |

## 💓 Keep-Alive Logic

*   **Ping/Pong**: The server sends a Ping every 54 seconds. The client must respond with a Pong within 60 seconds, or the connection is terminated and the player is marked as `isOffline`.
*   **Max Message Size**: 512KB (To safely handle large code progress updates).

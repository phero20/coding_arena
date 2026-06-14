# React Hooks: Arena

The `arena/` directory contains highly specialized hooks that manage the complex, real-time state of multiplayer matches.

## WebSockets Core
- **`use-arena-socket-connection.ts`**: Manages the underlying connection to the Go WebSocket server (`ws://...`). Handles automatic reconnection logic with exponential backoff if the server drops.
- **`use-arena-socket.ts`**: A higher-level abstraction that allows components to send messages (e.g., `{ type: "START_MATCH" }`) and subscribe to incoming payloads (e.g., `LEADERBOARD_UPDATE`).

## Game State Management
- **`use-arena-room.ts`**: Fetches and maintains the absolute state of the current room (players, host, settings) synced via WebSockets.
- **`use-arena-lobby.ts`**: Manages pre-match actions (toggling "Ready" status, selecting a language, waiting for the host).
- **`use-match-countdown.ts`**: Handles the `3... 2... 1...` synchronization timer before players are allowed to type code.
- **`use-arena-actions.ts`**: Provides methods to kick players, abort the match, or leave the room explicitly.
- **`use-join-arena-form.ts`**: Validates form inputs when a user tries to join a room via an invite code.

## Results & Leaderboards
- **`use-match-ranking.ts`**: Listens to real-time `LEADERBOARD_UPDATE` WebSocket events and animates the player avatars moving up and down the leaderboard as they pass test cases.
- **`use-match-results.ts`**: Calculates and displays the final score screen, highlighting rank, speed, and accuracy metrics.

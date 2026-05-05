# Frontend Architecture: Real-time Logic (WebSockets)

Real-time synchronization with the **Go Arena Hub** is the most complex part of the frontend. It is managed by a combination of custom hooks and a central Zustand store.

## 🔗 The Connection Lifecycle (`useArenaSocket`)

The `useArenaSocket` hook handles the low-level connection:

1.  **Handshake**: Upon entering an `/arena` route, the hook initiates a connection to `ws://[HOST]:8080/ws/[roomId]`.
2.  **Auth**: It automatically attaches the Clerk JWT session token.
3.  **State Management**: It manages `isConnecting`, `isConnected`, and `error` states.
4.  **Auto-Reconnect**: Implements exponential backoff for dropped connections.

## ⚡ Event Processing (`ArenaEventProcessor`)

When a message is received from the Go Hub, it is passed to the `ArenaEventProcessor` service:

*   **Type Mapping**: The processor maps message types (e.g., `LEADERBOARD_UPDATE`) to specific Zustand actions.
*   **Action Dispatch**:
    *   `MATCH_STARTED`: Updates room status and triggers the match countdown.
    *   `PLAYER_JOINED`: Adds the new player to the `players` map in `useArenaStore`.
    *   `PROGRESS_UPDATE`: Updates the specific player's test case count and calculates their rank.
    *   `MATCH_OVER`: Stops the timer and opens the "Results" modal.

## 🎚 The Arena Store (`useArenaStore`)

This is the **Source of Truth** for the current match.
*   **State**: Includes `room`, `players`, `matchStatus`, and `timeRemaining`.
*   **Actions**:
    *   `setRoom(data)`: Hydrates the store with initial API data.
    *   `updatePlayer(userId, data)`: Partially updates a player's score or offline status.
    *   `reset()`: Clears the match state when the user leaves the arena.

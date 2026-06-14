# `ArenaMatch` MongoDB Collection

**Purpose:**
Stores the state and history of multiplayer coding arena matches. Because matches have dynamic arrays of players and frequently updating sub-documents (verdicts, scores), MongoDB is used instead of Postgres.

## Fields

- **`_id`**: Internal MongoDB ObjectId.
- **`roomId`** (`String`, Unique): The public ID of the multiplayer room.
- **`hostId`** (`String`): The `userId` of the player who created the match.
- **`problemId`** (`String`): The ID of the coding problem being solved.
- **`problemTitle`** / **`problemSlug`** / **`difficulty`**: Cached problem metadata.
- **`language`** (`String`): The required programming language for the match.
- **`status`** (`String`): Current state of the match (`'WAITING'`, `'PLAYING'`, `'COMPLETED'`).
- **`startedAt`** / **`endedAt`** (`Date`): Match lifecycle timestamps.
- **`players`** (`Array`): An array of `ArenaPlayerResultSchema` sub-documents.
- **`expiresAt`** (`Date`): Used for TTL (Time-To-Live) indexing. Automatically set to 30 days in the future to eventually purge old matches.

### `ArenaPlayerResultSchema` (Sub-document)
- **`userId`** / **`username`** / **`avatarUrl`**: Player identity.
- **`finalRank`** (`Number`): The placement the player achieved (1st, 2nd, etc).
- **`verdict`** (`String`): The result of their code execution (e.g., `'ACCEPTED'`, `'TLE'`).
- **`score`** (`Number`): The calculated score based on speed and accuracy.
- **`testsPassed`** / **`totalTests`** (`Number`): Execution metrics.
- **`submittedAt`** / **`timeTaken`**: Speed metrics used for tie-breakers.

# `ArenaSubmission` MongoDB Collection

**Purpose:**
A fast log table linking individual code submissions to specific multiplayer arena matches. It allows the system to trace exactly which code evaluations belong to which multiplayer session.

## Fields

- **`matchId`** (`String`): The ID of the arena match.
- **`userId`** (`String`): The ID of the player who submitted the code.
- **`submissionId`** (`String`): The ID of the underlying code submission (from the `Submission` collection).
- **`status`** (`String`): The evaluation result (`'ACCEPTED'`, `'WRONG_ANSWER'`, etc.).
- **`testsPassed`** (`Number`): How many test cases passed.
- **`totalTests`** (`Number`): Total test cases evaluated against.

*Note: Includes a compound index on `{ matchId: 1, userId: 1 }` to quickly look up a player's history in a specific match.*

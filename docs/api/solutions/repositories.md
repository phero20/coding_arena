# Solutions Repositories

The `SolutionRepository` handles MongoDB Mongoose operations for community solutions.

**File Location**: [api/src/repositories/solutions/solution.repository.ts](../../../api/src/repositories/solutions/solution.repository.ts)

## Responsibilities

1. **`getSolutionsByProblemAndLanguage`**: Performs heavy grid queries using Mongoose. It applies standard pagination (`skip`/`limit`) but also supports dynamic sorting algorithms (e.g., sorting by `upvotes` descending or `createdAt` descending).
2. **`voteSolution`**: Executes an atomic `$inc` (increment/decrement) and `$addToSet` / `$pull` operation on the `upvotedBy` / `downvotedBy` arrays. Doing this atomically directly on the database ensures that if 1,000 users upvote a solution at the exact same millisecond, no votes are lost to race conditions.

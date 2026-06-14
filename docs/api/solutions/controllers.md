# Solutions Controllers

The `SolutionController` handles the extraction of Zod-validated payloads and URL queries for the community solution board.

**File Location**: [api/src/controllers/solutions/solution.controller.ts](../../../api/src/controllers/solutions/solution.controller.ts)

## Actions

1. **`createSolution`**
   - **Validation**: Extracts the `CreateSolutionInput` payload from the body.
   - **Action**: Injects the authenticated `req.user.clerkId` as the `authorId` to ensure users cannot forge solutions under another user's name.

2. **`getSolutions`**
   - **Validation**: Extracts `problemId`, `languageId`, `skip`, `limit`, and `sortBy` from the query string.
   - **Action**: Passes these parameters to the `SolutionService` to fetch the paginated grid.

3. **`voteSolution`**
   - **Validation**: Extracts the `VoteSolutionInput` (containing the `voteType`: `UPVOTE` | `DOWNVOTE`) from the body.
   - **Action**: Injects `req.user.clerkId` to track who cast the vote.

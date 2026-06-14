# Solutions Services

The `SolutionService` contains the core business logic, including the implementation of the voting system.

**File Location**: [api/src/services/solutions/solution.service.ts](../../../api/src/services/solutions/solution.service.ts)

## Responsibilities

1. **Voting Logic (`voteSolution`)**:
   - This method handles the complex toggling logic for Reddit-style voting.
   - When a user casts an `UPVOTE`, the service checks if they have already upvoted. If they have, it removes the upvote (acting as an "un-upvote"). 
   - If they previously `DOWNVOTE`d, it removes the downvote and adds the upvote in a single atomic transaction.
   - This ensures the `upvotes` and `downvotes` integer counters on the document remain perfectly accurate.

2. **CRUD Operations**:
   - Standard pass-through methods (`createSolution`, `getSolutions`, `getSolutionById`) that connect the controller to the repository layer.

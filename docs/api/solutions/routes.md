# Solutions Routes

The routing layer for the community solutions board.

**File Location**: [api/src/routes/solutions/solution.routes.ts](../../../api/src/routes/solutions/solution.routes.ts)

## API Endpoints

### 1. Create Solution
- **Method**: `POST`
- **Path**: `/api/v1/solutions`
- **Auth Required**: Yes (`requireAuth: true`)
- **Controller Action**: `solutionController.createSolution`

### 2. Get Solutions Grid
- **Method**: `GET`
- **Path**: `/api/v1/solutions`
- **Auth Required**: No (`requireAuth: false`)
- **Controller Action**: `solutionController.getSolutions`
- **Description**: Fetches the paginated list of solutions for a specific `problemId` and `languageId`. Supports sorting (e.g., by `upvotes` or `createdAt`).

### 3. Get Single Solution
- **Method**: `GET`
- **Path**: `/api/v1/solutions/:id`
- **Auth Required**: No (`requireAuth: false`)
- **Controller Action**: `solutionController.getSolutionById`

### 4. Vote on Solution
- **Method**: `POST`
- **Path**: `/api/v1/solutions/:id/vote`
- **Auth Required**: Yes (`requireAuth: true`)
- **Controller Action**: `solutionController.voteSolution`
- **Description**: Toggles an upvote or downvote for a specific solution.

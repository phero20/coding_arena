# Contest Routes

The Contest routes provide read-only access to the synced contests for the frontend, as well as a private manual trigger for backend scripts to run the sync engine.

**File Location**: [api/src/routes/contest/contest.routes.ts](../../../api/src/routes/contest/contest.routes.ts)

## Dependencies Injected

The route registration function `registerContestRoutes` expects:
- `contestController`: Handles the HTTP logic.

---

## API Endpoints

### 1. Get Upcoming Contests
- **Method**: `GET`
- **Path**: `/api/v1/contests/`
- **Controller Action**: `contestController.getUpcomingContests`
- **Description**: The primary endpoint used by the frontend. It fetches all upcoming contests (usually the next 15 days), prioritizing the Redis Cache for instant load times.

### 2. External / Proxy Debug (Legacy)
- **Method**: `GET`
- **Path**: `/api/v1/contests/external`
- **Controller Action**: `contestController.getExternalContests`
- **Description**: A debugging proxy endpoint that hits the CLIST API directly without using the database. Useful for verifying API keys or checking upstream data structures.

### 3. Trigger Manual Sync
- **Method**: `POST`
- **Path**: `/api/v1/contests/sync`
- **Controller Action**: `contestController.syncContests`
- **Description**: Triggers the `syncExternalContests` method. *Note: In production, this logic is usually handled by a background cron job rather than an HTTP trigger.*

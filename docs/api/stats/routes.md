# Stats Routes

The routes definition for fetching user statistics and leaderboards.

**File Location**: [api/src/routes/stats/stats.routes.ts](../../../api/src/routes/stats/stats.routes.ts)

## API Endpoints

### 1. Sync LeetCode Profile
- **Method**: `POST`
- **Path**: `/api/v1/stats/sync-leetcode`
- **Auth Required**: Yes (`requireAuth: true`)
- **Description**: Triggers a background sync of the authenticated user's LeetCode profile to update their local stats.

### 2. Get Global Leaderboard
- **Method**: `GET`
- **Path**: `/api/v1/stats/leaderboard`
- **Auth Required**: No (`requireAuth: false`)
- **Description**: Fetches the top-ranked users on the platform. Supports pagination (`limit`, `skip`).

### 3. Get User Stats
- **Method**: `GET`
- **Path**: `/api/v1/stats/:username`
- **Auth Required**: No (`requireAuth: false`)
- **Description**: Public route to fetch a specific user's total solved counts, reputation, and global rank.

### 4. Get User Heatmap
- **Method**: `GET`
- **Path**: `/api/v1/stats/:username/heatmap`
- **Auth Required**: No (`requireAuth: false`)
- **Description**: Fetches the GitHub-style contribution calendar data (daily submission counts) for the user.

### 5. Get User Progress
- **Method**: `GET`
- **Path**: `/api/v1/stats/:username/progress`
- **Auth Required**: No (`requireAuth: false`)
- **Description**: Returns recent accepted submissions for the user's profile activity feed.

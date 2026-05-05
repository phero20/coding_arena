# API Reference: Contests

The Contests API manages external contest synchronization and listing from third-party platforms (LeetCode, Codeforces, etc.).

## 🏆 Contest Listing

### `GET /contests`
Fetches a list of upcoming contests, prioritized and cached in Redis.
*   **Auth Required**: No
*   **Response**: Array of `Contest` objects including `title`, `platform`, `startTime`, and `href`.

### `GET /contests/external`
A proxy/debug endpoint that fetches raw contest data directly from external providers (e.g., CLIST).
*   **Auth Required**: No

---

## 🔄 Synchronization

### `POST /contests/sync`
Manually triggers a synchronization job to fetch the latest contests from external APIs and update the local database/cache.
*   **Auth Required**: No (Typically called by an internal CRON job).

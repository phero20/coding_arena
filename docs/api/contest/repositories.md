# Contest Repository

The Contest Repository manages interactions with the `contests` table in PostgreSQL using **Drizzle ORM**. It acts as the permanent, searchable system of record.

**File**: [api/src/repositories/contest/contest.repository.ts](../../../api/src/repositories/contest/contest.repository.ts)

## Schema Overview
The underlying `schema.contests` table defined in `api/src/db/schema.ts` relies on `clistId` as a unique identifier. This is critical for synchronizing with the external API without creating duplicates.

## Repository Methods

### 1. `upsert(contest: NewContest)`
The core function used during data ingestion.
- Uses Drizzle's `.onConflictDoUpdate()` mapping to the `target: schema.contests.clistId`.
- **Insert**: If the `clistId` does not exist in our database, it inserts the new contest.
- **Update**: If the `clistId` already exists, it updates the mutable fields (title, description, start/end times, status) and updates the `updatedAt` timestamp.
- Returns the full `Contest` object.

### 2. `findUpcoming(limit, maxDate)`
The fallback method used when the Redis Cache is empty.
- Builds a dynamic query array `conditions`.
- Forces `schema.contests.startTime` to be `>=` the current clock time.
- Optionally applies a `maxDate` constraint (`<= maxDate`) to limit how far into the future the query looks (e.g., 15 days).
- Sorts chronologically `orderBy(schema.contests.startTime)`.

### 3. `deleteOld(before: Date)`
A cleanup method designed to purge historical contests from the database once they are no longer relevant, preventing table bloat.
- Executes `DELETE FROM contests WHERE endTime < [before]`.

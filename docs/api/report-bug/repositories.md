# Report Bug Repository

The `ReportBugRepository` handles all MongoDB operations using Mongoose for the `ReportBug` collection.

**File Location**: [api/src/repositories/report-bug/report-bug.repository.ts](../../../api/src/repositories/report-bug/report-bug.repository.ts)

## Responsibilities

1. **`create`**: Inserts a new bug report document into the `ReportBug` collection.
2. **`findMany`**: Queries the `ReportBug` collection with `skip` and `limit` options, sorting the results by `createdAt` in descending order so the newest reports appear first.

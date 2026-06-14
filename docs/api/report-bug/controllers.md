# Report Bug Controllers

The `ReportBugController` handles parsing the incoming HTTP request and routing it to the `ReportBugService`.

**File Location**: [api/src/controllers/report-bug/report-bug.controller.ts](../../../api/src/controllers/report-bug/report-bug.controller.ts)

## Actions

1. **`createReport`**
   - **Validation**: Extracts the typed `body` from `req`.
   - **Action**: Injects the authenticated `req.user.clerkId` into the payload and passes it to `reportBugService.createReport()`. Returns a standardized `ApiResponse.success()`.

2. **`getReports`**
   - **Validation**: Extracts `limit` and `skip` query parameters, falling back to defaults (`10` and `0` respectively).
   - **Action**: Passes the pagination options to `reportBugService.getReports()` and returns the array of reports.

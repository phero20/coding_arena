# Report Bug Routes

The routes definition for bug reporting endpoints.

**File Location**: [api/src/routes/report-bug/report-bug.routes.ts](../../../api/src/routes/report-bug/report-bug.routes.ts)

## API Endpoints

### 1. Create a Report
- **Method**: `POST`
- **Path**: `/api/v1/report-bug`
- **Auth Required**: Yes (`requireAuth: true`)
- **Controller Action**: `reportBugController.createReport`
- **Description**: Allows an authenticated user to submit a bug report.

### 2. Get All Reports
- **Method**: `GET`
- **Path**: `/api/v1/report-bug`
- **Auth Required**: Yes (`requireAuth: true`) 
- **Controller Action**: `reportBugController.getReports`
- **Description**: Admin route to fetch all submitted bug reports, with support for pagination (`limit`, `skip`).

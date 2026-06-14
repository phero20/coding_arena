# Report Bug Services

The `ReportBugService` contains the core business logic for handling user-submitted bug reports.

**File Location**: [api/src/services/report-bug/report-bug.service.ts](../../../api/src/services/report-bug/report-bug.service.ts)

## Responsibilities

1. **`createReport`**: Validates the input data against a Zod schema (`createBugReportSchema`) to ensure all required fields are present and properly formatted before passing the payload to the repository layer for insertion. It uses the `clock` utility to automatically append the `createdAt` timestamp.
2. **`getReports`**: A simple pass-through method that delegates the paginated retrieval request directly to the underlying repository.

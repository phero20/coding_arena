# Problems Controllers

The controllers in the Problems module act as the traffic cops, routing Zod-validated payloads to either the standard `ProblemService` or the highly complex AI orchestration services.

**File Location**: [api/src/controllers/problems/](../../../api/src/controllers/problems/)

## 1. `problem.controller.ts`

Delegates core CRUD operations. Extracts pagination limits (`limit`, `skip`) and filters (`difficulty`, `tags`) from the URL query strings before passing them to the caching service layer.

## 2. `problem-test.controller.ts`

Handles test case operations. Crucially, its `getTests` endpoint does not require the controller to manually strip hidden test cases; it delegates this to the service layer to ensure business logic remains encapsulated.

## 3. `ai-problem.controller.ts`

Acts as the gateway for the AI Generation Engine.
Because generating a problem via Groq or solving a problem via Claude can take several seconds, this controller is designed to await these long-running Promises and return the deeply structured JSON AI outputs directly to the admin frontend.

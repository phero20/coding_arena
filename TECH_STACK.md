Backend Architecture & Standards
This document outlines the architectural patterns, coding standards, and directory structures for the Coding Arena backend. All development must strictly adhere to these rules to ensure modularity, maintainability, and enterprise-grade performance.

🏗️ Core Architecture: The Modular Layered Pattern
We follow a Clean Architecture approach with strict separation of concerns. Each layer has a specific responsibility and depends only on the layers below it.

1. Route Layer (/api/src/routes)
Responsibility: Defines API endpoints, HTTP methods, and attaches middleware.
Rules:
No business logic.
Must use validator middleware for payload validation.
Must use auth middleware for protected routes.
Routes should be grouped logically (e.g., arena.routes.ts, problem.routes.ts).
2. Controller Layer (/api/src/controllers)
Responsibility: The interface between HTTP and the Service layer.
Rules:
Thin Controllers: Only handle parameter extraction, body parsing, and response formatting.
Error Handling: Must rely on the BaseController and global error handlers. Never use try-catch blocks for business errors; throw AppError instead.
Dependency Injection: Services are injected via the ICradle.
Inheritance: All controllers must extend BaseController.
3. Service Layer (/api/src/services)
Responsibility: The "Brain" of the application. Contains all business logic, rules, and calculations.
Rules:
Protocol Agnostic: Services must not know about HTTP, request objects, or sessions.
Atomic Operations: One service method should represent one atomic business action.
Validation: Must use Zod schemas to validate input details via validateServiceInput.
Coordination: Services coordinate between multiple repositories and external libs (e.g., Judge0).
4. Repository Layer (/api/src/repositories)
Responsibility: The gateway to the database (MongoDB).
Rules:
Clean Data Access: Only contains DB queries (Mongoose models). No business logic.
Domain Mapping: Must use toDomain or toDomainArray to map DB documents to clean TypeScript types.
Aggregation Power: Complex joins and calculations are handled here via MongoDB aggregation pipelines to prevent N+1 query problems.
Wait for Session: Must support transactions by accepting options?: RepositoryOptions which includes a session.
5. Cache Layer (/api/src/cache)
Responsibility: High-performance optimization using the Decorator Pattern.
Rules:
Proxy Pattern: Cache classes implement the same interface as their respective services.
Aside Strategy: Check Redis first; on miss, call the "Raw" service and cache the result.
Safe Execution: Wrap cache logic in try-catch to ensure the application continues running even if Redis is down (fallback to DB).
🛠️ Coding Standards & Best Practices
💉 Dependency Injection (DI)
We use Awilix for DI. Components are registered in api/src/libs/di.
Always use the ICradle type for identifying dependencies.
Components are strictly decoupled, making them highly testable.
⚠️ Error Handling
Global Error Middleware: All errors are caught by a central handler.
AppError Class: Use AppError.from(ERRORS.CATEGORY.CODE) for operational errors.
Constants: Never hardcode error messages. All codes are defined in api/src/constants/errors.ts.
⚡ Performance & N+1 Prevention
Never loop and query: If you find yourself doing Array.map(async item => ...) for a DB call, you are creating an N+1 problem.
Aggregation Pipelines: Use $lookup and $group in repositories to fetch complex data structures in a single round-trip.
🧪 Validation
Double-Layer Validation:
Middleware: Validates incoming HTTP requests (400 Bad Request).
Service-Level: Validates internal method calls (ensures data integrity regardless of the source).
📁 Directory Structure Summary
Folder	Purpose
src/controllers	HTTP Request/Response handlers.
src/services	Business logic and coordination.
src/repositories	Database access and domain mapping.
src/cache	Performance decorators for services.
src/mongo/models	Mongoose schema definitions.
src/libs	Core libraries (Redis, DI, AI, Logging).
src/workers	Background processing (BullMQ).
src/validators	Zod schemas for request/service validation.
src/types	Centralized TypeScript interfaces and types.
📝 Example Flow: Running Code
Route: POST /api/v1/compiler/run calls validator then Controller.
Controller: Extracts code and language, calls CompilerService.execute.
Service: Validates input, selects WandboxService (lib), calls external API.
Response: Returns standardized result to the user.
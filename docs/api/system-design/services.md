# System Design Services

The `SystemDesignService` contains the primary business logic.

**File Location**: [api/src/services/system-design/system-design.service.ts](../../../api/src/services/system-design/system-design.service.ts)

## Responsibilities

This is a very lightweight service module that essentially acts as a clean bridge between the controller and the caching decorator. It ensures that inputs are structurally sound before hitting the database, but does not contain complex business logic because system design problems do not require execution or dynamic test cases.

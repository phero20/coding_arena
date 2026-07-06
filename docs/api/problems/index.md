# Problems Module Overview

The **Problems Module** is one of the largest and most complex domains in the `coding_arena` backend. It manages the lifecycle of coding challenges, from basic CRUD operations and test case storage to automated AI generation.

## Architecture

This module is split into three primary logical flows:

1. **Standard CRUD (`problem.*`)**: Handles the retrieval, creation, and updating of coding problems. Uses Redis caching for high-traffic grid queries.
2. **Test Case Management (`problem-test.*`)**: Manages the secret input/output pairs that validate user code. Strictly segregated from the main problem documents to prevent accidental leaking of hidden test cases to the frontend.
3. **AI Generation Engine (`ai-problem.*` & `testcase-*.ts`)**: Utilizes LLMs via One API Gateway to automatically generate new coding problems from text prompts, automatically solve them, and automatically generate edge-case test validations.

## Directory Structure

```text
api/src/
├── controllers/problems/
│   ├── ai-problem.controller.ts           # AI Generation HTTP handlers
│   ├── problem-test.controller.ts         # Test Case HTTP handlers
│   └── problem.controller.ts              # Core Problem HTTP handlers
├── routes/problems/
│   ├── ai-problem.routes.ts               # AI Routes
│   ├── problem-test.routes.ts             # Test Case Routes
│   └── problem.routes.ts                  # Core Problem Routes
├── services/problems/
│   ├── ai-addsolve.service.ts             # Anthropic Claude logic
│   ├── ai-problem.service.ts              # AI problem generation logic
│   ├── testcase-generator.service.ts      # LLM Test Case generation
│   ├── problem.service.ts                 # Standard business logic
│   └── problem-test.service.ts            # Test Case validation logic
├── repositories/problems/
│   ├── problem.repository.ts              # Problem MongoDB Operations
│   └── problem-test.repository.ts         # Test Case MongoDB Operations
└── cache/problems/
    ├── problem.cache.ts                   # Core Problem Redis Cache
    └── problem-test.cache.ts              # Test Case Redis Cache
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints and Auth
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): Standard logic & AI Generation Engines
- [Repositories](./repositories.md): MongoDB Persistence Strategy
- [Cache](./cache.md): Redis Caching Decorators

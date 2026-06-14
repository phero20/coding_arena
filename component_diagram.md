# Component Diagram

This document illustrates the high-level Component Architecture of the SlaveCode platform. A Component Diagram shows how large, distinct software modules interact with each other through defined interfaces or APIs.

Unlike a Class Diagram (which focuses on internal code structure), this diagram treats entire subsystems as black boxes and focuses on the "wiring" between them.

```mermaid
flowchart TB
    %% Styling
    classDef component fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef external fill:#1a202c,stroke:#e2e8f0,stroke-width:2px,stroke-dasharray: 5 5,color:#fff;
    classDef database fill:#2c5282,stroke:#4299e1,stroke-width:2px,color:#fff;
    
    %% Client Tier
    subgraph Client ["Client Tier"]
        UI["«Component»\nReact UI Frontend\n(Next.js App Router)"]:::component
    end

    %% Auth Tier
    subgraph Identity ["Identity & Access Management"]
        Auth["«External Component»\nClerk Auth System"]:::external
    end

    %% Core Backend Tier
    subgraph Backend ["Core API Tier"]
        APIGateway["«Component»\nHono API Router\n(REST Interface)"]:::component
        
        subgraph Subsystems ["Domain Subsystems"]
            ProblemMgmt["«Component»\nProblem & Taxonomy Engine"]:::component
            SocialMgmt["«Component»\nSocial & Stats Engine"]:::component
            SysDesignMgmt["«Component»\nSystem Design Engine"]:::component
        end
        
        BullMQ["«Component»\nJob Queue Manager\n(BullMQ)"]:::component
    end

    %% Realtime Tier
    subgraph Realtime ["Real-time Tier"]
        GoArena["«Component»\nGolang Multiplayer Hub\n(WebSocket Manager)"]:::component
    end

    %% Execution & AI Tier
    subgraph Execution ["Execution & AI Tier"]
        AIProvider["«External Component»\nLLM Orchestrator\n(Bedrock / Gemini / Groq)"]:::external
        Judge0["«External Component»\nJudge0 API\n(Primary Code Execution)"]:::external
        Wandbox["«External Component»\nWandbox API\n(Fallback Sandbox)"]:::external
    end

    %% Data Tier
    subgraph Data ["Persistence Tier"]
        PG[("«Database»\nPostgreSQL\n(Relational Data)")]:::database
        Mongo[("«Database»\nMongoDB\n(Document Storage)")]:::database
        Redis[("«Database»\nRedis\n(Cache & PubSub)")]:::database
    end

    %% --- Wiring & Interfaces ---

    %% Client Interactions
    UI -- "REST / JSON" --> APIGateway
    UI -- "WebSockets" --> GoArena
    UI -- "OAuth / JWT" --> Auth

    %% Auth Webhooks
    Auth -- "User Sync Webhook" --> APIGateway

    %% API Routing
    APIGateway --> ProblemMgmt
    APIGateway --> SocialMgmt
    APIGateway --> SysDesignMgmt
    APIGateway -- "Enqueues Async Jobs" --> BullMQ

    %% Subsystem DB Dependencies
    ProblemMgmt -- "Problems & Tests" --> Mongo
    SocialMgmt -- "Profiles & Leaderboard" --> PG
    SysDesignMgmt -- "Saved Diagrams" --> Mongo

    %% Subsystem to AI
    SysDesignMgmt -- "Prompts (Tutor / Graph Generation)" --> AIProvider
    ProblemMgmt -- "Auto-Solve Generation" --> AIProvider

    %% BullMQ Workers
    BullMQ -- "Evaluate Code" --> Judge0
    BullMQ -- "Fallback Compilation" --> Wandbox
    BullMQ -- "Audit AI Verdicts" --> AIProvider

    %% Real-time Wiring
    GoArena -- "Atomic Lua Scripts" --> Redis
    BullMQ -- "Publishes Match Results" --> Redis
    Redis -- "PubSub Updates" --> GoArena
    
    %% Cross-communication (Optional)
    APIGateway -- "Caches Responses" --> Redis

```

---

## Component Breakdown

1. **React UI Frontend**: The monolithic client-side application. It acts as the primary consumer of all other components.
2. **Clerk Auth System**: An external Identity Provider (IdP). It issues JWTs to the Client and pushes user lifecycle events (creation, deletion) to the Backend via webhooks.
3. **Hono API Router**: The main entry point for all stateless REST requests. It routes traffic to specific Domain Subsystems.
4. **Domain Subsystems**:
   - **Problem & Taxonomy Engine**: Manages reading/writing curriculum data.
   - **Social & Stats Engine**: Calculates ELO, leaderboards, streaks, and user relationships.
   - **System Design Engine**: Manages Excalidraw JSON schemas and interacts with AI for layout resolution.
5. **Job Queue Manager (BullMQ)**: A critical component that decouples slow tasks (code compilation) from the fast API response cycle.
6. **Execution APIs (Judge0 & Wandbox)**: External sandboxed environments that securely compile and run untrusted user code against hidden test cases.
7. **LLM Orchestrator**: The abstraction layer over Amazon Bedrock, Gemini, and Groq used for AI-judging, chat tutoring, and diagram generation.
8. **Golang Multiplayer Hub**: A standalone, highly-concurrent engine dedicated solely to managing live WebSocket traffic for the Arena mode.
9. **Databases**: Postgres (structured social data), Mongo (large JSON documents/test cases), and Redis (pub/sub state and caching).

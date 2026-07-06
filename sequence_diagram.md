# System Sequence Diagrams

This document outlines the step-by-step dynamic behavior of the most complex workflows in the SlaveCode backend. 

Unlike Structural Diagrams (which show *what* exists), Sequence Diagrams show *how* data moves over time between the Client, API, Background Workers, and External Services.

---

## 1. Asynchronous Code Submission Flow

This sequence diagrams the entire lifecycle of a user clicking "Submit" on a coding problem. Because compiling untrusted code takes time, the API uses an **Asynchronous Job Queue (BullMQ)** pattern.

```mermaid
sequenceDiagram
    autonumber
    
    actor User as Client (Next.js)
    participant API as Hono API Gateway
    participant SubSvc as Submission Service
    participant Mongo as MongoDB
    participant BullMQ as Redis (BullMQ)
    participant Worker as Submission Worker
    participant ExecSvc as Execution Service
    participant Judge0 as Judge0 Engine
    participant OneAPI as One API Gateway
    participant Postgres as PostgreSQL

    %% 1. Initial Submission Phase (Synchronous)
    User->>API: POST /submissions/submit (sourceCode, languageId, problemId)
    API->>SubSvc: createSubmission(input)
    SubSvc->>Mongo: Insert new Submission { status: "PENDING" }
    Mongo-->>SubSvc: Return submissionId
    SubSvc-->>API: Return submissionId
    API->>BullMQ: Enqueue Job (submissionId)
    API-->>User: 202 Accepted { submissionId }

    %% Client starts polling
    loop Polling (Every 2 seconds)
        User->>API: GET /submissions/{id}/status
        API->>SubSvc: getSubmissionById()
        SubSvc->>Mongo: findById()
        Mongo-->>API: Return Current Status
        API-->>User: { status: "PENDING" | "RUNNING" | ... }
    end

    %% 2. Background Execution Phase (Asynchronous)
    BullMQ--)Worker: Dequeue Job (submissionId)
    activate Worker
    Worker->>SubSvc: updateSubmissionStatus("RUNNING")
    
    Worker->>ExecSvc: runFullSubmission(sourceCode)
    ExecSvc->>Mongo: Fetch Public & Hidden Test Cases
    Mongo-->>ExecSvc: Return [TestCases]
    
    ExecSvc->>Judge0: Batch Evaluate (sourceCode, tests)
    activate Judge0
    Note over Judge0: Compiles code in Docker Sandbox
    Judge0-->>ExecSvc: Return stdout, stderr, time, memory
    deactivate Judge0

    %% AI Audit (Conditional)
    alt Driver Verdict is Suspicious (e.g. Partial Match)
        ExecSvc->>OneAPI: Audit Output using LLM (Gemini,Gpt,Groq,Deepseek and more)
        OneAPI-->>ExecSvc: Return Audited Status (e.g. ACCEPTED or WRONG_ANSWER)
    end
    
    ExecSvc-->>Worker: Return ExecutionResults (overallStatus)

    %% 3. Finalization Phase
    Worker->>SubSvc: updateSubmissionStatus(overallStatus, ExecutionResults)
    SubSvc->>Mongo: Save Final Details
    
    %% Async Analytics update
    par Async Stats Sync
        SubSvc->>Postgres: (StatsSubmissionService) Update totalSolved, streaks
        SubSvc->>BullMQ: Publish "Leaderboard Updated" Event
    end

    deactivate Worker

    %% Next poll from client
    User->>API: GET /submissions/{id}/status
    API-->>User: 200 OK { status: "ACCEPTED", time: 42ms, ... }

```

---

## 2. Arena Multiplayer Real-Time Flow

This sequence diagrams the lifecycle of an Arena match. It relies heavily on WebSockets and Redis PubSub to sync state instantly across multiple players.

```mermaid
sequenceDiagram
    autonumber
    
    actor P1 as Player 1
    actor P2 as Player 2
    participant GoHub as Golang WebSocket Hub
    participant Redis as Redis Pub/Sub
    participant MatchSvc as MatchBroadcaster (Node)

    %% Matchmaking Phase
    P1->>GoHub: wss:// Connect & Join Queue
    P2->>GoHub: wss:// Connect & Join Queue
    Note over GoHub, Redis: Go evaluates matchmaking atomic Lua script
    GoHub->>Redis: Create Arena Room & Match State
    
    %% Match Start
    GoHub-->>P1: Broadcast: Match Started (Problem Info)
    GoHub-->>P2: Broadcast: Match Started (Problem Info)

    %% Gameplay Loop
    P1->>GoHub: Submit Code (WS Payload)
    GoHub->>Redis: Publish Submission Event
    
    %% Background Worker Intercepts
    Redis--)MatchSvc: Listen: Match Submission Created
    Note over MatchSvc: Node Worker processes submission via Judge0 (like above)
    MatchSvc->>Redis: Publish: Submission Verdict (P1 = ACCEPTED)
    
    %% Realtime Fan-out
    Redis--)GoHub: Listen: Match Score Update
    GoHub-->>P1: Broadcast: Scoreboard Update
    GoHub-->>P2: Broadcast: Scoreboard Update
    
    %% Match Finish
    alt Time Expires OR Score Limit Reached
        MatchSvc->>Redis: Publish: Match Ended
        Redis--)GoHub: Broadcast Match End
        GoHub-->>P1: Final Results & Rating Delta
        GoHub-->>P2: Final Results & Rating Delta
    end

```

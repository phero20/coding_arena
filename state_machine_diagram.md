# State Machine Diagrams

This document contains **State Machine Diagrams** that illustrate the lifecycle of key objects in the SlaveCode backend. 

State diagrams show all the possible states an object can be in (like a database record), and the exact events or triggers that cause it to transition from one state to another.

---

## 1. Code Submission Lifecycle

This is the most critical state machine in the system. When a user submits code, it transitions through several stages of asynchronous evaluation before reaching a terminal status.

```mermaid
stateDiagram-v2
    %% Styling
    classDef terminal fill:#2d3748,color:white,font-weight:bold,stroke:#4a5568,stroke-width:2px
    classDef success fill:#276749,color:white,font-weight:bold,stroke:#48bb78,stroke-width:2px
    classDef error fill:#9b2c2c,color:white,font-weight:bold,stroke:#f56565,stroke-width:2px
    classDef warn fill:#744210,color:white,font-weight:bold,stroke:#d69e2e,stroke-width:2px

    [*] --> PENDING : User submits code
    
    PENDING --> RUNNING : Worker dequeues job
    
    state "Evaluation Phase" as Eval {
        RUNNING --> Judge0
        RUNNING --> AI_Audit
        
        Judge0 --> ACCEPTED : All test cases pass
        Judge0 --> WRONG_ANSWER : Output mismatch
        Judge0 --> TLE : Timeout Exceeded
        Judge0 --> RUNTIME_ERROR : Process crashed / Segfault
        Judge0 --> COMPILATION_ERROR : Syntax Error
        Judge0 --> SYSTEM_ERROR : Sandbox Failed
        
        %% Fallback / AI Override Phase
        WRONG_ANSWER --> AI_Audit : High Suspicion Score
        AI_Audit --> ACCEPTED : AI Overrides (Valid logic, trivial formatting issue)
        AI_Audit --> WRONG_ANSWER : AI Confirms Failure
    }

    ACCEPTED --> [*]
    WRONG_ANSWER --> [*]
    TLE --> [*]
    RUNTIME_ERROR --> [*]
    COMPILATION_ERROR --> [*]
    SYSTEM_ERROR --> [*]

    %% Apply Classes
    class ACCEPTED success
    class WRONG_ANSWER,TLE,RUNTIME_ERROR,COMPILATION_ERROR,SYSTEM_ERROR error
    class PENDING,RUNNING warn
```

---

## 2. Arena Multiplayer Match Lifecycle

An Arena match is a real-time state machine managed primarily by the Golang WebSocket Hub and Redis, before being finalized in MongoDB.

```mermaid
stateDiagram-v2
    %% Styling
    classDef terminal fill:#2d3748,color:white,font-weight:bold,stroke:#4a5568,stroke-width:2px
    classDef success fill:#276749,color:white,font-weight:bold,stroke:#48bb78,stroke-width:2px
    classDef warn fill:#744210,color:white,font-weight:bold,stroke:#d69e2e,stroke-width:2px

    [*] --> WAITING : Host Creates Room
    
    state "Pre-Game Phase" as PreGame {
        WAITING --> WAITING : Players Join (Up to 50 max)
        WAITING --> LOBBY : Host optionally transitions
        LOBBY --> WAITING : Host optionally transitions
        
        %% Host Actions
        WAITING --> KICKED : Host kicks player
        LOBBY --> KICKED : Host kicks player
    }
    
    PreGame --> PLAYING : Host starts match (Must have ≥ 2 players)
    
    state "Match In Progress" as InProgress {
        PLAYING --> PLAYING : Players Code & Submit
        PLAYING --> PLAYING : Real-time Progress Updates (Tests Passed/Score)
    }

    InProgress --> FINISHED : Match Timer Expires (Default 20 mins)
    InProgress --> FINISHED : Host Aborts the Match
    
    FINISHED --> [*]
    KICKED --> [*]

    %% Apply Classes
    class FINISHED success
    class WAITING,LOBBY,PLAYING warn
```


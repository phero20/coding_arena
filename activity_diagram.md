# Activity Diagrams

This document contains **Activity Diagrams** (Flowcharts) that map out the branching logic (`if/else` decisions), loops, and parallel processes inside the SlaveCode backend. 

Activity diagrams are particularly useful for understanding the exact decision trees of background workers.

---

## 1. Submission Evaluation & AI Audit Flow

This flowchart diagrams the intricate decision-making process inside `ExecutionService` and `DriverJudgeExecutionService`. It highlights the fallback mechanisms and the "AI Audit" feature, which uses an LLM to double-check strict test case failures.

```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#2c5282,stroke:#4299e1,stroke-width:2px,color:#fff,rx:20px;
    classDef process fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#fff;
    classDef decision fill:#744210,stroke:#d69e2e,stroke-width:2px,color:#fff;
    classDef db fill:#276749,stroke:#48bb78,stroke-width:2px,color:#fff;

    Start(["Job Picked from BullMQ"]):::startEnd --> FetchTests["Fetch Public & Hidden Tests"]:::process
    FetchTests --> FetchMongo[("MongoDB")]:::db
    
    FetchMongo --> LangCheck{"Is Language Supported\nby Judge0/Wandbox?"}:::decision
    
    %% AI Code Judge Path
    LangCheck -- No --> RunAIJudge["Run via AiCodeJudgeService\n(One API Gemini,Gpt,Groq,Deepseek and more)"]:::process
    RunAIJudge --> SaveResult
    
    %% Standard Execution Path
    LangCheck -- Yes --> BatchRun["Batch Submit to Judge0"]:::process
    BatchRun --> Poll["Poll Judge0 for Results"]:::process
    
    Poll --> ExecStatusCheck{"Execution Error\n(Compile Error, TLE, etc)?"}:::decision
    
    ExecStatusCheck -- Yes --> SetError["Set Status to ERROR / TLE"]:::process
    SetError --> SaveResult
    
    ExecStatusCheck -- No --> CheckOutput{"Compare stdout to\nExpected Output"}:::decision
    
    CheckOutput -- Exact Match --> SetAccepted["Set Status to ACCEPTED"]:::process
    SetAccepted --> SaveResult
    
    CheckOutput -- Mismatch --> SuspicionCheck{"Calculate Suspicion Score\n(Are they extremely similar?)"}:::decision
    
    %% AI Audit Trigger
    SuspicionCheck -- High Suspicion --> AIAudit["Trigger AI Verdict Audit"]:::process
    SuspicionCheck -- Low Suspicion --> SetWA["Set Status to WRONG_ANSWER"]:::process
    SetWA --> SaveResult
    
    AIAudit --> AIAgreeCheck{"Does AI believe\nthe code is correct?"}:::decision
    
    AIAgreeCheck -- Yes (Override) --> SetAccepted
    AIAgreeCheck -- No (Agree with Driver) --> SetWA
    
    %% Finalization
    SaveResult["Compile Final Execution Result"]:::process --> UpdateDB["Update Submission in MongoDB"]:::process
    UpdateDB --> ArenaCheck{"Is this an\nArena Match?"}:::decision
    
    %% Parallel Finalization
    ArenaCheck -- Yes --> PubRedis["Publish Event to Redis Pub/Sub"]:::process
    ArenaCheck -- No --> UpdatePG[("Update PostgreSQL\nUser Stats")]:::db
    
    PubRedis --> End(["Worker Job Complete"]):::startEnd
    UpdatePG --> End
```

---

## 2. Taxonomy & Curriculum Unlocking Flow

This diagram shows the branching logic for a user navigating the Curriculum/Taxonomy tree. It demonstrates how the system checks prerequisites and determines if a problem or category is locked or unlocked.

```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#2c5282,stroke:#4299e1,stroke-width:2px,color:#fff,rx:20px;
    classDef process fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#fff;
    classDef decision fill:#744210,stroke:#d69e2e,stroke-width:2px,color:#fff;
    classDef db fill:#276749,stroke:#48bb78,stroke-width:2px,color:#fff;

    Start(["User requests Roadmap/Category view"]):::startEnd --> FetchCat["Fetch Category Tree"]:::process
    FetchCat --> FetchPG[("PostgreSQL")]:::db
    
    FetchPG --> HasParent{"Does Category\nhave a Parent?"}:::decision
    
    HasParent -- No (Root Level) --> CheckTotal{"Are there any\ncompleted problems?"}:::decision
    CheckTotal -- Yes --> MarkUnlocked["Mark Unlocked"]:::process
    CheckTotal -- No --> MarkUnlocked
    
    HasParent -- Yes --> FetchParentProgress["Fetch Progress of Parent Category"]:::process
    FetchParentProgress --> CheckThreshold{"Is Parent Category\n > 75% Complete?"}:::decision
    
    CheckThreshold -- No --> MarkLocked["Mark Category as LOCKED"]:::process
    CheckThreshold -- Yes --> CheckPremium{"Is Category Premium?"}:::decision
    
    CheckPremium -- No --> MarkUnlocked
    CheckPremium -- Yes --> CheckUserTier{"Is User PRO?"}:::decision
    
    CheckUserTier -- Yes --> MarkUnlocked
    CheckUserTier -- No --> MarkLocked
    
    MarkUnlocked --> CalcProgress["Calculate completion % of current Category"]:::process
    CalcProgress --> End(["Return UI State"]):::startEnd
    MarkLocked --> End

```

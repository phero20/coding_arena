# Use Case Diagram

This document contains the **Use Case Diagram**, which defines exactly what different types of actors (users) can do within the SlaveCode system. 

It maps out the permissions and capabilities of Guests, Registered Players, PRO Players, and Admins.

```mermaid
flowchart LR
    %% Define Actors
    Guest(["👤 Guest (Unauthenticated)"])
    Player(["🎮 User (Authenticated)"])

    %% System Boundary
    subgraph System ["SlaveCode Platform"]
        direction TB
        
        %% Guest Actions (Matched to middleware.ts)
        UC1(["View Problems & Solutions (/problems)"])
        UC2(["Use Compiler Playground (/compilers)"])
        UC3(["View Contests (/contests)"])
        UC4(["View Roadmap & Academy (/roadmap, /academy)"])
        UC5(["View User Profiles (/u/)"])
        UC6(["View System Design Learn (/systemdesign)"])
        UC7(["View Companies & Leaderboards"])
        UC8(["Submit Bug Reports (/report-bug)"])
        UC9(["Login / Sign Up via Clerk"])

        %% Player Actions (Protected Routes / API)
        UC10(["Solve & Submit Code (Backend API Protected)"])
        UC11(["Join & Host Arena Matches (/arena)"])
        UC12(["Create System Design Diagrams (Workspaces)"])
        UC13(["Chat with AI about Diagrams"])
        UC14(["Post Solutions & Upvote/Downvote"])
        UC15(["Follow Other Users"])
    end

    %% Map Guest
    Guest -.-> UC1
    Guest -.-> UC2
    Guest -.-> UC3
    Guest -.-> UC4
    Guest -.-> UC5
    Guest -.-> UC6
    Guest -.-> UC7
    Guest -.-> UC8
    Guest -.-> UC9

    %% Inherit Player from Guest
    Player --> Guest

    %% Map Player
    Player ---> UC10
    Player ---> UC11
    Player ---> UC12
    Player ---> UC13
    Player ---> UC14
    Player ---> UC15

    %% Styling
    classDef actor fill:#2d3748,color:#fff,stroke:#4a5568,stroke-width:2px,font-weight:bold
    classDef usecase fill:#2b6cb0,color:#fff,stroke:#4299e1,stroke-width:1px,rx:20px
    classDef boundary fill:#1a202c,color:#cbd5e0,stroke:#718096,stroke-width:2px,stroke-dasharray: 5 5

    class Guest,Player actor
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13,UC14,UC15 usecase
    class System boundary
```

## Role Permissions
- **Guest (Unauthenticated)**: Has wide read-access across the platform matching `middleware.ts`. Guests can browse Problems, Solutions, Contests, Roadmaps, Academy Tracks, User Profiles, Leaderboards, and even use the generic Compiler Playground and submit Bug Reports.
- **User (Authenticated)**: Inherits all Guest permissions, plus has full read/write access to protected core loops: Submitting problem evaluations to the backend, entering Multiplayer Arena matches, saving System Design diagram workspaces, and utilizing Social features (Following, Posting Solutions).

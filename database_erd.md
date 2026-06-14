# Database Entity-Relationship Diagrams (ERD)

This document provides a highly accurate ERD generated directly from the deep analysis of the codebase schemas. It is split into our two primary databases: PostgreSQL (Relational) and MongoDB (Document).

## PostgreSQL (Drizzle ORM)

The Postgres database acts as the single source of truth for users, social connections, stats, leaderboards, and structured hierarchy.

```mermaid
erDiagram
    %% Tables
    users {
        uuid id PK
        text clerkId
        text username
        text fullName
        text email
        text avatarUrl
        text status
        text role
        text githubUsername
        text linkedinUsername
        text leetcodeUsername
        timestamp createdAt
        timestamp updatedAt
    }
    user_stats {
        uuid userId PK,FK
        bigint totalPoints
        bigint arenaPoints
        integer totalSolved
        integer easySolved
        integer mediumSolved
        integer hardSolved
        integer arenaGames
        integer currentStreak
        integer bestStreak
        date lastSolveDate
        jsonb languageCounts
    }
    user_activity {
        uuid userId PK,FK
        date date PK
        integer pointsEarned
        integer arenaPointsEarned
        integer submissions
        integer matches
    }
    user_solved_problems {
        uuid userId PK,FK
        text problemId PK "References Mongo"
        timestamp solvedAt
    }
    user_solved_languages {
        uuid userId PK,FK
        text problemId PK
        text languageId PK
        timestamp solvedAt
    }
    user_academy_exercises {
        uuid userId PK,FK
        text trackSlug PK
        text exerciseSlug PK
        timestamp solvedAt
    }
    follows {
        uuid followerId PK,FK
        uuid followingId PK,FK
        timestamp createdAt
    }
    contests {
        uuid id PK
        integer clistId
        text title
        text description
        text platform
        timestamp startTime
        timestamp endTime
        integer duration
        text href
        integer resourceId
        text icon
        text status
        timestamp createdAt
        timestamp updatedAt
    }
    categories {
        uuid id PK
        uuid parentId FK
        text name
        text slug
        text description
        integer order
        timestamp createdAt
    }
    category_problems {
        uuid categoryId PK,FK
        text problemId PK
        integer order
    }
    solutions {
        uuid id PK
        uuid userId FK
        text problemId "References Mongo"
        text problemTitle
        text problemSlug
        text title
        text content
        text language
        integer upvotes
        integer downvotes
        timestamp createdAt
        timestamp updatedAt
    }
    solution_votes {
        uuid userId PK,FK
        uuid solutionId PK,FK
        integer voteType
        timestamp createdAt
    }
    workspaces {
        uuid id PK
        uuid userId FK
        text name
        boolean isDefault
        timestamp createdAt
        timestamp updatedAt
    }
    diagrams {
        uuid id PK
        uuid workspaceId FK
        text title
        jsonb documentState
        timestamp createdAt
        timestamp updatedAt
    }
    chat_threads {
        uuid id PK
        uuid diagramId FK
        text title
        timestamp createdAt
        timestamp updatedAt
    }
    chat_messages {
        uuid id PK
        uuid threadId FK
        text role
        text content
        timestamp createdAt
    }
    bug_reports {
        uuid id PK
        text title
        text description
        text type
        jsonb images
        text status
        timestamp createdAt
        timestamp updatedAt
    }

    %% Relationships
    users ||--o| user_stats : "has"
    users ||--o{ user_activity : "logs"
    users ||--o{ user_solved_problems : "solves"
    users ||--o{ user_solved_languages : "uses"
    users ||--o{ user_academy_exercises : "completes"
    users ||--o{ follows : "follower_id"
    users ||--o{ follows : "following_id"
    users ||--o{ solutions : "writes"
    users ||--o{ solution_votes : "casts"
    users ||--o{ workspaces : "owns"
    
    solutions ||--o{ solution_votes : "receives"
    workspaces ||--o{ diagrams : "contains"
    diagrams ||--o{ chat_threads : "has"
    chat_threads ||--o{ chat_messages : "contains"
    categories ||--o| categories : "parent_id"
    categories ||--o{ category_problems : "categorizes"
```

## MongoDB (Mongoose)

MongoDB handles unstructured, heavy, or heavily nested data. Since MongoDB is schema-less by nature, this diagram represents the Mongoose application-level schema validations.

```mermaid
erDiagram
    Problem {
        String title
        String problem_id "Unique"
        String difficulty
        String problem_slug "Unique"
        Array topics
        String description
        Array examples
        Array constraints
        Array follow_ups
        Array hints
        Object code_snippets
        String problem_type "function|class"
        Object function_signature
        Object class_signature
        Object judging_policy
        String solutions
        Boolean is_premium
        Date createdAt
        Date updatedAt
    }
    ProblemTest {
        String problem_id "Index"
        String type "public|hidden|stress"
        Array cases "Array of TestCases"
        Date createdAt
        Date updatedAt
    }
    Submission {
        String problemId "Index"
        String problemTitle
        String userId "Index"
        String languageId
        String sourceCode
        String status "PENDING|ACCEPTED|etc"
        Number time
        Number memory
        Mixed details
        Date createdAt
        Date updatedAt
    }
    ArenaRoom {
        String room_id "Unique"
        String status
        Array users
        Array problems
        Date created_at
        Date expires_at
    }
    ArenaMatch {
        String match_id "Unique"
        String room_id "Index"
        String status
        Array players
        Array problems
        Object scoreboard
        Date started_at
        Date finished_at
    }
    ArenaSubmission {
        String submission_id
        String match_id
        String user_id
        String problem_id
        String status
        Date submitted_at
    }
    Company {
        String name
        String slug "Unique"
        Array problem_ids
    }
    SystemDesignTopic {
        String topic_id "Unique"
        String slug "Unique"
        String title
        Number order
        String content
        Date createdAt
        Date updatedAt
    }
    AcademyTrack {
        String slug "Unique (Track ID)"
        Mixed data "JSON Config"
        Date createdAt
        Date updatedAt
    }
    AcademyConfig {
        String slug "Unique (Track ID)"
        Mixed data "JSON Config"
        Date createdAt
        Date updatedAt
    }
    AcademyConcept {
        String trackSlug "Index"
        String conceptSlug "Index"
        Mixed data "JSON Config"
        Date createdAt
        Date updatedAt
    }
    AcademyExercise {
        String trackSlug "Index"
        String exerciseSlug "Index"
        Mixed data "JSON Config"
        Date createdAt
        Date updatedAt
    }

    Problem ||--o| ProblemTest : "problem_id"
    Problem ||--o{ Submission : "problemId"
    Problem ||--o{ ArenaRoom : "problems"
    ArenaRoom ||--o{ ArenaMatch : "room_id"
    ArenaMatch ||--o{ ArenaSubmission : "match_id"
    Company ||--o{ Problem : "problem_ids"
    AcademyTrack ||--o| AcademyConfig : "slug"
    AcademyTrack ||--o{ AcademyConcept : "trackSlug"
    AcademyTrack ||--o{ AcademyExercise : "trackSlug"
```

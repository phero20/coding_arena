# Comprehensive Class Diagrams (In-Depth)

Because the SlaveCode backend contains over 70 interconnected classes, rendering a single diagram would be unreadable. 

Instead, this document provides an **in-depth Object-Oriented analysis**, broken down by the major domain boundaries of the Hono API. Every class listed here matches the exact implementation in the `api/src/` codebase, including their private dependencies and public methods.

---

## Problem, Taxonomy & AI Generation Domain

```mermaid
classDiagram
    class AiProblemController {
        -aiProblemService
        -aiAddSolveService
        -problemService
        -problemTestService
        -testcaseGeneratorService
        +super()
    }
    class ProblemTestController {
        -problemTestService
        +super()
    }
    class ProblemController {
        -problemService
        -problemValidatorService
        +super()
    }
    class AiAddSolveService {
        -problemRepo
        -bedrockClient
    }
    class AiProblemService {
        -llm
    }
    class ProblemTestService {
        -problemTestRepository
    }
    class ProblemValidatorService {
        -problemRepository
    }
    class ProblemService {
        -problemRepository
    }
    class TestcaseGeneratorService {
        -llm
    }
    class ProblemTestRepository {
        +super()
    }
    class ProblemRepository {
        +super()
    }
    class TaxonomyController {
        -taxonomyService
        +super()
    }
    class TaxonomyService {
        -taxonomyRepo
        -problemRepo
    }
    class TaxonomyRepository {
        +findAllCategories()
    }
    class CompanyController {
        -companyService
        +super()
    }
    class CompanyService {
        -companyRepository
        -problemRepository
    }
    class CompanyRepository {
        +super()
    }

    %% Relationships
    ProblemController --> ProblemService
    ProblemController --> ProblemValidatorService
    AiProblemController --> AiProblemService
    AiProblemController --> AiAddSolveService
    ProblemTestController --> ProblemTestService
    ProblemTestController --> TestcaseGeneratorService
    TaxonomyController --> TaxonomyService
    CompanyController --> CompanyService
    ProblemService --> ProblemRepository
    ProblemTestService --> ProblemTestRepository
    TaxonomyService --> TaxonomyRepository
    CompanyService --> CompanyRepository
    AiAddSolveService --> ProblemRepository
    AiProblemService --> ProblemRepository
```

---

## Submission & Execution Domain

```mermaid
classDiagram
    class SubmissionController {
        -submissionService
        -executionService
        -submissionQueue
        -matchValidatorService
        -problemValidatorService
        -clock
        -userRepository
        +super()
    }
    class ExecutionService {
        -problemTestService
        -aiCodeJudgeService
        -driverJudgeExecutionService
    }
    class SubmissionService {
        -submissionRepository
        -arenaMatchRepository
        -arenaRepository
        -arenaSubmissionRepository
        -statsSubmissionService
        -clock
    }
    class SubmissionRepository {
        -clock
        +super()
    }
    class AiCodeJudgeService {
        -unifiedLlmService
        -problemService
    }
    class AiVerdictAuditService {
        -llm
        -problemService
    }
    class DriverJudgeExecutionService {
        -judge0Service
        -problemRepository
        -problemTestRepository
        -aiVerdictAuditService
    }
    class Judge0Service {
        -ensureConfigured()
    }
    class WandboxService {
        +getCompilers()
    }
    class CompilerController {
        -compilerService
        +super()
    }
    class CompilerService {
        -wandboxService
    }

    %% Relationships
    SubmissionController --> SubmissionService
    CompilerController --> CompilerService
    SubmissionService --> ExecutionService
    SubmissionService --> SubmissionRepository
    SubmissionService --> StatsSubmissionService
    ExecutionService --> DriverJudgeExecutionService
    ExecutionService --> AiCodeJudgeService
    DriverJudgeExecutionService --> WandboxService
    DriverJudgeExecutionService --> Judge0Service
    AiCodeJudgeService --> AiVerdictAuditService
```

---

## Users, Stats, Auth & Leaderboard Domain

```mermaid
classDiagram
    class FollowController {
        -followService
        +super()
    }
    class ProfileController {
        -userRepository
        -statsService
        +super()
    }
    class UserController {
        -userService
        +super()
    }
    class FollowService {
        -followRepository
        -userRepository
        -statsService
    }
    class UserService {
        -userRepository
    }
    class FollowRepository {
        +follow()
    }
    class UserRepository {
        -clock
    }
    class StatsController {
        -statsService
        +super()
    }
    class LeetCodeService {
        -baseUrl
    }
    class StatsSubmissionService {
        -statsRepository
        -problemRepository
        -userRepository
        -statsService
        -taxonomyService
        -leaderboardCache
    }
    class StatsService {
        -statsRepository
        -userRepository
        -followRepository
        -leetcodeService
    }
    class StatsRepository {
        -clock
    }
    class AuthController {
        +super()
    }
    class ClerkWebhookController {
        -authService
        +super()
    }
    class AuthService {
        -userRepository
        -clerkClient
        -clock
        -statsService
    }

    %% Relationships
    UserController --> UserService
    ProfileController --> UserService
    AuthController --> AuthService
    ClerkWebhookController --> AuthService
    ClerkWebhookController --> UserService
    StatsController --> StatsService
    StatsController --> LeetCodeService
    UserService --> UserRepository
    StatsService --> StatsRepository
    AuthService --> UserRepository
```

---

## Arena Multiplayer Domain

```mermaid
classDiagram
    class ArenaController {
        -arenaService
        -arenaMatchService
        +super()
    }
    class ArenaMatchService {
        -arenaMatchRepository
        -arenaSubmissionRepository
        -arenaRepository
        -matchDomainEngine
        -matchBroadcaster
        -statsSubmissionService
        -clock
    }
    class ArenaService {
        -arenaRepository
        -userRepository
        -arenaMatchRepository
        -arenaSubmissionRepository
        -clock
    }
    class MatchBroadcasterService {
        +notifyLeaderboardUpdate()
    }
    class MatchDomainEngine {
        +calculateScore()
    }
    class MatchValidatorService {
        -arenaMatchRepository
        -arenaRepository
    }
    class ArenaMatchRepository {
        -clock
        +super()
    }
    class ArenaSubmissionRepository {
        +super()
    }
    class ArenaRepository {
        +createRoom()
    }

    %% Relationships
    ArenaController --> ArenaService
    ArenaController --> ArenaMatchService
    ArenaMatchService --> MatchValidatorService
    ArenaMatchService --> MatchDomainEngine
    ArenaMatchService --> MatchBroadcasterService
    ArenaService --> ArenaRepository
    ArenaMatchService --> ArenaMatchRepository
    ArenaMatchService --> ArenaSubmissionRepository
```

---

## System Design & AI Chat Domain

```mermaid
classDiagram
    class SystemDesignController {
        -systemDesignService
        +super()
    }
    class SystemDesignService {
        -systemDesignRepository
    }
    class SystemDesignRepository {
        +super()
    }
    class ChatController {
        -chatService
        +super()
    }
    class ChatService {
        -chatRepository
        -workspaceService
        -groqDiagramService
    }
    class ChatRepository {
        +createThread()
    }
    class WorkspaceController {
        -workspaceService
        +super()
    }
    class WorkspaceService {
        -workspaceRepository
    }
    class WorkspaceRepository {
        +createWorkspace()
    }
    class DiagramResolverService {
        -techAliases
    }
    class GeminiLlmService {
        -clock
        -apiKeys
        -genAIs
        -circuitBreakers
    }
    class GroqDiagramService {
        -unifiedLlmService
        -diagramResolverService
    }
    class GroqLlmService {
        -clock
        -apiKeys
        -baseUrl
    }
    class UnifiedLlmService {
        -groqLlmService
        -geminiLlmService
    }

    %% Relationships
    SystemDesignController --> SystemDesignService
    WorkspaceController --> WorkspaceService
    ChatController --> ChatService
    ChatService --> UnifiedLlmService
    ChatService --> ChatRepository
    UnifiedLlmService --> GeminiLlmService
    UnifiedLlmService --> GroqLlmService
    GroqDiagramService --> DiagramResolverService
    SystemDesignService --> SystemDesignRepository
    WorkspaceService --> WorkspaceRepository
```

---

## Academy & Learning Domain

```mermaid
classDiagram
    class AcademyExecutionController {
        -academyExecutionService
        +super()
    }
    class AcademyController {
        -academyService
        +super()
    }
    class AcademyAiJudgeService {
        -unifiedLlmService
    }
    class AcademyExecutionService {
        -academyRepository
        -judge0Service
        -academyAiJudgeService
        -userRepository
        -statsRepository
        -leaderboardCache
        -statsService
        -submissionService
    }
    class AcademyService {
        -academyRepository
    }
    class AcademyRepository {
        +getTracks()
    }

    %% Relationships
    AcademyController --> AcademyService
    AcademyExecutionController --> AcademyExecutionService
    AcademyExecutionService --> AcademyAiJudgeService
    AcademyService --> AcademyRepository
```

---

## Solutions, Social & Misc Domain

```mermaid
classDiagram
    class SolutionController {
        -solutionService
        +super()
    }
    class SolutionService {
        -solutionRepository
        -problemRepository
        -userRepository
    }
    class SolutionRepository {
        -clock
    }
    class ContestController {
        -contestService
        +super()
    }
    class ClistService {
        +getContests()
    }
    class ContestService {
        -clistService
        -contestRepository
        -contestCache
    }
    class ContestRepository {
        -clock
    }
    class ReportBugController {
        -reportBugService
        +super()
    }
    class ReportBugService {
        -reportBugRepository
        -cloudinaryService
    }
    class ReportBugRepository {
        +createReport()
    }
    class SeoController {
        -seoService
        +super()
    }
    class SeoService {
        -seoRepository
    }
    class SeoRepository {
        +getProblemsForSitemap()
    }
    class SystemClockService {
        +now()
    }
    class CloudinaryService {
    }

    %% Relationships
    SolutionController --> SolutionService
    FollowController --> FollowService
    ContestController --> ContestService
    ContestService --> ClistService
    ReportBugController --> ReportBugService
    ReportBugService --> CloudinaryService
    SeoController --> SeoService
    SolutionService --> SolutionRepository
    FollowService --> FollowRepository
    ContestService --> ContestRepository
    ReportBugService --> ReportBugRepository
    SeoService --> SeoRepository
```

---


# Graph Report - .  (2026-07-06)

## Corpus Check
- Large corpus: 13029 files · ~71,49,794 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 4765 nodes · 9732 edges · 367 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: imports: 3202 · contains: 2589 · imports_from: 2322 · method: 1084 · calls: 340 · inherits: 72 · implements: 69 · re_exports: 38 · references: 16


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 13029 · Candidates: 14660
- Excluded: 0 untracked · 684591 ignored · 108 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `6023747`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `Button` - 149 edges
2. `ICradle` - 119 edges
3. `cn()` - 106 edges
4. `Card` - 100 edges
5. `createLogger()` - 72 edges
6. `CardContent` - 62 edges
7. `Input` - 58 edges
8. `Badge()` - 57 edges
9. `AppError` - 57 edges
10. `TableRow` - 43 edges

## Surprising Connections (you probably didn't know these)
- `build_list()` --calls--> `ListNode`  [EXTRACTED]
  driver/languages/python/parts/data_structures.py → driver/languages/typescript/parts/data_structures.ts
- `build_tree()` --calls--> `TreeNode`  [EXTRACTED]
  driver/languages/python/parts/data_structures.py → driver/languages/typescript/parts/data_structures.ts
- `decode_string()` --calls--> `base64_decode()`  [EXTRACTED]
  driver/languages/python/parts/scanner.py → driver/languages/cpp/parts/scanner.cpp

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (37): ArenaAdminService, IArenaAdminService, logger, MatchStartResult, CreateArenaSubmissionInput, logger, ErrorDefinition, ERRORS (+29 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (61): AcademyRepository, IAcademyRepository, AuthUserPayload, logger, IChatRepository, ContestAdminRepository, IContestAdminRepository, logger (+53 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (59): AcademyConceptsChart(), AcademyConceptsChartProps, AcademyDifficultyChart(), AcademyDifficultyChartProps, DifficultyData, AcademyExercisesChart(), AcademyExercisesChartProps, AcademySection() (+51 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (49): logger, logger, RunExerciseParams, TEST_SUPPORTED_LANGUAGES, logger, logger, LlmJsonResponse, logger (+41 more)

### Community 4 - "Community 4"
Cohesion: 0.03
Nodes (54): AcademyConceptModel, AcademyConceptSchema, AcademyConfigModel, AcademyConfigSchema, AcademyExerciseModel, AcademyExerciseSchema, AcademyTrackModel, AcademyTrackSchema (+46 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (51): UserAcademyExercisesEditorProps, UserActivityEditorProps, CompaniesToolbarProps, CompanyEditorProps, ContestEditorProps, CreateDiagramDialog(), CreateDiagramDialogProps, CreateWorkspaceDialog() (+43 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (48): combineBash(), combineC(), combineCpp(), collectUsings(), combineCSharp(), FRAMEWORK_ATTR_PATTERNS, FRAMEWORK_USING_PATTERNS, stripFrameworkDirectives() (+40 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (31): CacheTableProps, SolutionListProps, LeaderboardRow(), LeaderboardTable(), LeaderboardTableProps, ProblemRow(), CategoryDetails(), CategoryDetailsProps (+23 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (27): Props, AcademyHomeSection(), MOCK_TRACKS, MOCK_PRACTICE_CARDS, RoadmapPracticeHomeSection(), tones, ArenaLogo(), HostArenaCard() (+19 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (37): STATUS_CONFIG, DynamicHighlighter, ArenaCard(), ArenaLobbyCard(), CompilerCard(), PracticeModeCard(), BentoCard(), CardHeader() (+29 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (42): UserAcademyExercisesEditor(), UserAcademyExercisesViewer(), UserActivityEditor(), UserActivityViewer(), Props, AiImplementation, AiSolution, OfficialSolution() (+34 more)

### Community 11 - "Community 11"
Cohesion: 0.05
Nodes (41): CacheKeyDetailsModalProps, workspaceMarkdownComponents, DescriptionPanel, difficultyColor, SubmissionHistory(), difficultyBg, difficultyColor, ChatCopilotPanel() (+33 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (36): academyTracksMeta, ConceptEditor(), ConceptEditorProps, ConceptsTable(), ConceptsTableProps, ConceptViewer(), ConceptViewerProps, ConfigEditor() (+28 more)

### Community 13 - "Community 13"
Cohesion: 0.06
Nodes (35): Props, ArenaHomeEditorSection(), SyntaxHighlighter, ARENA_PARTICIPANTS, ArenaHomeSection(), SyntaxHighlighter, SolutionDetailProps, SolutionMarkdown() (+27 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (35): UserAcademyExercisesViewerProps, UserActivityViewerProps, CacheList(), CacheListProps, TreeNode, CompanyListProps, Props, ContestListProps (+27 more)

### Community 15 - "Community 15"
Cohesion: 0.04
Nodes (20): AuthInitializer(), Providers(), apiClient, requestQueue, setTokenGetter(), ArenaSocketProvider(), AuthInitializer(), UpdateProfilePayload (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.07
Nodes (37): useArenaPagination(), useSolutionPagination(), LeaderboardClient(), LeaderboardClientProps, ArenaHistoryTab(), ArenaHistoryTabProps, ArenaMatchDetail(), ProfileLayout() (+29 more)

### Community 17 - "Community 17"
Cohesion: 0.06
Nodes (33): MatchResults(), useMatchResults(), LearnDesktopSidebar(), LearnMobileHeader(), useRoadmapData(), ArenaResultsPageProps, LEARNING_PATH, nodeTypes (+25 more)

### Community 18 - "Community 18"
Cohesion: 0.05
Nodes (18): size, size, size, size, size, size, OGLayout(), size (+10 more)

### Community 19 - "Community 19"
Cohesion: 0.05
Nodes (18): useCurrentUser(), UseCurrentUserResult, UpsertProblemTestsPayload, SocialUser, ApiResponse, BackendUser, CreateSolutionInput, FunctionParameter (+10 more)

### Community 20 - "Community 20"
Cohesion: 0.06
Nodes (39): useArenaSocketConnection(), useMatchRanking(), UseMatchResultsProps, ArenaSocketContext, ArenaSocketContextType, ArenaEvaluation, ArenaState, useArenaStore (+31 more)

### Community 21 - "Community 21"
Cohesion: 0.06
Nodes (25): logger, vmShutdownWorker, CloudinaryService, ICloudinaryService, corsConfig(), config, EnvConfig, NodeEnv (+17 more)

### Community 22 - "Community 22"
Cohesion: 0.07
Nodes (27): ArenaLobby(), useArenaTransitions(), useCreateArena(), useJoinArena(), useLeaveArena(), useUpdateArenaProblem(), useArenaLobby(), useArenaRoom() (+19 more)

### Community 23 - "Community 23"
Cohesion: 0.07
Nodes (33): AiCodeJudgeService, AiRunSamplesInput, AiRunSamplesOutput, AiRunSamplesResult, AiTestVerdict, IAiJudgeService, verdictToStatusId, AiProblemService (+25 more)

### Community 24 - "Community 24"
Cohesion: 0.14
Nodes (23): DiagramPageProps, navItems, NavLinks(), UserSearchProps, cn(), TracksToolbarProps, Checkbox, Command (+15 more)

### Community 25 - "Community 25"
Cohesion: 0.08
Nodes (17): ContestCard(), ContestCardProps, ContestFilters(), PLATFORMS, ContestHero(), ContestHeroProps, TRANSITION, ContestList() (+9 more)

### Community 26 - "Community 26"
Cohesion: 0.10
Nodes (21): ArenaPlayerCard, PreviewFile, useReportBugForm(), ProblemViewerProps, AppearanceSection(), THEMES, EditorSection(), SettingsTabs() (+13 more)

### Community 27 - "Community 27"
Cohesion: 0.20
Nodes (18): PARTS_DIR, JUDGE0_LANGUAGE_IDS, MARKERS, DriverOptions, ExecutionPackage, MethodSignature, TestCase, assert() (+10 more)

### Community 28 - "Community 28"
Cohesion: 0.09
Nodes (19): controllersRegistry, logger, SUPPORTED_LANGUAGE_IDS, logger, logger, SubmissionEvaluator, TestCase, ExecutionService (+11 more)

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (17): flattenInput(), flattenValue(), Codec, boxIfPrimitive(), javaType(), normalize(), parsePrimitive(), parseType() (+9 more)

### Community 30 - "Community 30"
Cohesion: 0.13
Nodes (19): AcademyConsolePanel(), AcademyConsolePanelProps, AcademyEditorPanel(), AcademyEditorPanelProps, AcademyWorkspaceProps, DynamicEditor, LanguageSelector(), ConsolePanel() (+11 more)

### Community 31 - "Community 31"
Cohesion: 0.13
Nodes (1): Scanner

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (14): CompilerConsole(), CompilerEditor(), CompilerWorkspace(), compilersMeta, COMPILER_LANGUAGES, CompilerLangConfig, getLangConfig(), BaseWorkspace() (+6 more)

### Community 33 - "Community 33"
Cohesion: 0.13
Nodes (17): SystemDesignAbout(), SystemDesignIcon(), HexagonBaseProps, HexApiGatewayIcon(), HexCacheIcon(), HexCdnIcon(), HexDatabaseIcon(), HexLoadBalancerIcon() (+9 more)

### Community 34 - "Community 34"
Cohesion: 0.14
Nodes (18): LEETCODE_TOTALS, BadgeShowcase(), BadgeShowcaseProps, GritGraph(), LeetCodeContestCard(), LeetCodeContestCardProps, LeetCodeSolveBreakdown(), LeetCodeSolveBreakdownProps (+10 more)

### Community 35 - "Community 35"
Cohesion: 0.07
Nodes (2): BaseController, UserAdminController

### Community 36 - "Community 36"
Cohesion: 0.10
Nodes (18): fontMono, fontSans, fontSerif, geistMono, geistSans, metadata, ThemeProvider(), globalMetadata (+10 more)

### Community 37 - "Community 37"
Cohesion: 0.08
Nodes (1): UserAdminService

### Community 38 - "Community 38"
Cohesion: 0.11
Nodes (13): StatusTheme, ExecutionStatus, ExecutionTestResult, ExecutionVerdict, RunSubmissionPayload, RunSubmissionResponse, Submission, SubmitCodeResponse (+5 more)

### Community 39 - "Community 39"
Cohesion: 0.11
Nodes (1): UserAdminRepository

### Community 40 - "Community 40"
Cohesion: 0.14
Nodes (3): base64_decode(), decode_string(), is_base64()

### Community 41 - "Community 41"
Cohesion: 0.19
Nodes (17): buildEdgeShapes(), buildGroupShapes(), LAYER_COLORS, handleUpdate(), _redrawGroupsAndResize(), computeGroupBounds(), runDagre(), collectDescendants() (+9 more)

### Community 42 - "Community 42"
Cohesion: 0.14
Nodes (18): PREBUILT_TEMPLATES, PrebuiltTemplate, GlobalSearchResultsPanel(), GlobalSearchResultsPanelProps, SHAPE_ICONS, TemplatesPanel(), TemplatesPanelProps, SEARCHABLE_DEVICES (+10 more)

### Community 43 - "Community 43"
Cohesion: 0.15
Nodes (13): ChatStoreState, CanvasActions, CanvasGraph, CanvasState, ChatMessage, ChatThread, CreateChatMessageInput, CreateChatThreadInput (+5 more)

### Community 44 - "Community 44"
Cohesion: 0.13
Nodes (15): UseRunAcademyExerciseParams, hashSeed(), PracticeProblemCard(), PracticeProblemCardContent(), PracticeProblemsSection(), TrackExercises, UsePracticeSorterOptions, SlugAboutPracticePreview() (+7 more)

### Community 45 - "Community 45"
Cohesion: 0.11
Nodes (8): build_doubly_list(), build_graph(), build_nary_tree(), build_random_list(), DoublyLinkedListNode, Node, ListNode, TreeNode

### Community 46 - "Community 46"
Cohesion: 0.10
Nodes (3): AcademyAdminRepository, AcademyStats, IAcademyAdminRepository

### Community 47 - "Community 47"
Cohesion: 0.10
Nodes (2): AcademyAdminService, IAcademyAdminService

### Community 48 - "Community 48"
Cohesion: 0.10
Nodes (2): AcademyAdminController, BaseController

### Community 49 - "Community 49"
Cohesion: 0.13
Nodes (11): CompaniesHeader(), CompaniesHeaderProps, svgColors, CompaniesToolbar(), CompaniesClient(), CompaniesClientProps, CompaniesHomeSection(), gridCompanies (+3 more)

### Community 50 - "Community 50"
Cohesion: 0.15
Nodes (11): buildCanvasGraph(), buildEdgeShapes(), buildGroupShapes(), collectDescendants(), computeGroupBounds(), estimateTextHeight(), estimateTextWidth(), extractSemanticId() (+3 more)

### Community 51 - "Community 51"
Cohesion: 0.14
Nodes (9): AuthContext, ContextVariableMap, AppEnv, ControllerRequest, ValidatedContext, AuthorizationMiddleware, logger, RateLimitMiddleware (+1 more)

### Community 52 - "Community 52"
Cohesion: 0.17
Nodes (2): IWorkspaceService, WorkspaceCache

### Community 53 - "Community 53"
Cohesion: 0.19
Nodes (2): IWorkspaceService, WorkspaceService

### Community 54 - "Community 54"
Cohesion: 0.13
Nodes (9): generateTrackMetadata(), components, LearnMarkdown(), LearnMarkdownProps, TrackDetailsSkeleton(), getConfig, PageProps, Props (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.15
Nodes (8): MatchTimer(), SlidingNumber(), SlidingNumberProps, TRANSITION, useMatchCountdown(), NavbarActions(), useIsMounted(), PracticeStopwatch()

### Community 56 - "Community 56"
Cohesion: 0.17
Nodes (12): DIAGRAM_ASSETS, DIAGRAM_CATEGORIES, DiagramAsset, logger, generateDiagramFromCode(), calculateScore(), CLOUD_SYNONYMS, getAssetAcronymInitials() (+4 more)

### Community 57 - "Community 57"
Cohesion: 0.19
Nodes (6): CreateDiagramInput, CreateWorkspaceInput, Diagram, UpdateDiagramInput, UpdateWorkspaceInput, Workspace

### Community 58 - "Community 58"
Cohesion: 0.16
Nodes (6): CompanyLogoWithFallback(), Props, generateCompanyMetadata(), ProblemTable(), PageProps, problemsHubMeta

### Community 59 - "Community 59"
Cohesion: 0.20
Nodes (10): DriverParseResult, ExecutionVerdict, extractErrorText(), mapStatusId(), parseDriverResult(), parseResultLine(), RawJudge0Result, TestCaseResult (+2 more)

### Community 60 - "Community 60"
Cohesion: 0.20
Nodes (3): compare(), DeepComparator, serialize()

### Community 61 - "Community 61"
Cohesion: 0.20
Nodes (13): configDir, delay(), __dirname, exerciseBaseUrl(), fetchExerciseContent(), fetchText(), fileExists(), __filename (+5 more)

### Community 62 - "Community 62"
Cohesion: 0.13
Nodes (14): CanvasFrame, canvasFrameSchema, CanvasGraph, canvasGraphSchema, CreateChatMessageInput, createChatMessageSchema, CreateChatThreadInput, createChatThreadSchema (+6 more)

### Community 63 - "Community 63"
Cohesion: 0.19
Nodes (7): generateExerciseMetadata(), getCachedTrackExercise, AcademyWorkspace(), ExerciseData(), getExercise(), Props, WorkspaceSkeleton()

### Community 64 - "Community 64"
Cohesion: 0.15
Nodes (11): AiDiagramService, IAiDiagramService, LLMCanvasAction, LLMCanvasActionCreate, LLMCanvasActionNone, LLMCanvasActionUpdate, LLMCanvasGroup, LLMNewEdge (+3 more)

### Community 65 - "Community 65"
Cohesion: 0.21
Nodes (8): calculateScore(), CLOUD_SYNONYMS, DiagramResolverService, getAssetAcronymInitials(), getTokens(), IDiagramResolverService, PROVIDER_WORDS, STOP_WORDS

### Community 66 - "Community 66"
Cohesion: 0.14
Nodes (2): ArenaMatchRepository, MongoBaseRepository

### Community 67 - "Community 67"
Cohesion: 0.18
Nodes (1): ArenaRepository

### Community 68 - "Community 68"
Cohesion: 0.15
Nodes (8): customShapeUtils, DiagramCanvas(), DiagramCanvasProps, BaseBoxShapeUtil, DeviceShapeProps, DeviceShapeUtil, IDeviceShape, SidebarPanel()

### Community 69 - "Community 69"
Cohesion: 0.14
Nodes (13): ClassSignature, CodeSnippets, CreateOrUpdateProblemInput, DriverReadyFunctionSignature, Example, FunctionParameter, FunctionSignature, JudgingPolicy (+5 more)

### Community 70 - "Community 70"
Cohesion: 0.14
Nodes (2): TrackConceptResponse, TracksResponse

### Community 71 - "Community 71"
Cohesion: 0.15
Nodes (1): ArenaRepository

### Community 72 - "Community 72"
Cohesion: 0.16
Nodes (2): ISolutionRepository, SolutionRepository

### Community 73 - "Community 73"
Cohesion: 0.14
Nodes (3): ISystemDesignAdminRepository, MongoBaseRepository, SystemDesignAdminRepository

### Community 74 - "Community 74"
Cohesion: 0.14
Nodes (2): BaseController, WorkspaceController

### Community 75 - "Community 75"
Cohesion: 0.14
Nodes (2): IWorkspaceRepository, WorkspaceRepository

### Community 76 - "Community 76"
Cohesion: 0.19
Nodes (8): useReportBugAdmin(), metadata, ReportBugClient(), ReportBugEditor(), ReportBugForm(), ReportBugList(), ReportBugViewer(), ReportBugViewerProps

### Community 77 - "Community 77"
Cohesion: 0.23
Nodes (8): ProblemWorkspace(), getProblem(), ProblemData(), Props, generateProblemMetadata(), getCachedProblem, usePracticeWorkspace(), UsePracticeWorkspaceProps

### Community 78 - "Community 78"
Cohesion: 0.21
Nodes (8): SlugAboutContent(), Feature, POSITIONS, SlugAboutFeatures(), SlugAboutTab(), SlugHeader(), Props, TrackOverviewTabs()

### Community 79 - "Community 79"
Cohesion: 0.15
Nodes (2): BaseController, SystemDesignAdminController

### Community 80 - "Community 80"
Cohesion: 0.15
Nodes (2): ISystemDesignAdminService, SystemDesignAdminService

### Community 81 - "Community 81"
Cohesion: 0.21
Nodes (2): ITaxonomyService, TaxonomyCache

### Community 82 - "Community 82"
Cohesion: 0.15
Nodes (2): ITaxonomyRepository, TaxonomyRepository

### Community 83 - "Community 83"
Cohesion: 0.15
Nodes (12): createUserAcademyExerciseAdminSchema, createUserActivityAdminSchema, createUserAdminSchema, createUserSolvedLanguageAdminSchema, createUserSolvedProblemAdminSchema, createUserStatsAdminSchema, deleteUserAcademyExerciseAdminSchema, deleteUserSolvedLanguageAdminSchema (+4 more)

### Community 84 - "Community 84"
Cohesion: 0.17
Nodes (11): IdParamSchema, MatchIdParamSchema, ObjectIdSchema, PaginationQuerySchema, ProblemIdParamSchema, ProblemIdUnderscoreParamSchema, RecentSubmissionsQuerySchema, RoomIdParamSchema (+3 more)

### Community 85 - "Community 85"
Cohesion: 0.27
Nodes (11): categories, category_problems, contests, follows, public.categories, public.users, user_activity, user_solved_languages (+3 more)

### Community 86 - "Community 86"
Cohesion: 0.24
Nodes (11): configDir, delay(), __dirname, extractIconUrl(), fetchWithRetry(), __filename, main(), outputRootDir (+3 more)

### Community 87 - "Community 87"
Cohesion: 0.24
Nodes (11): configDir, delay(), __dirname, extractIconUrl(), fetchWithRetry(), __filename, main(), outputRootDir (+3 more)

### Community 88 - "Community 88"
Cohesion: 0.17
Nodes (1): ArenaService

### Community 89 - "Community 89"
Cohesion: 0.17
Nodes (1): WorkspaceService

### Community 90 - "Community 90"
Cohesion: 0.32
Nodes (2): ISolutionService, SolutionCache

### Community 91 - "Community 91"
Cohesion: 0.17
Nodes (2): IStatsRepository, StatsRepository

### Community 92 - "Community 92"
Cohesion: 0.17
Nodes (2): BaseController, TaxonomyAdminController

### Community 93 - "Community 93"
Cohesion: 0.17
Nodes (2): ITaxonomyAdminService, TaxonomyAdminService

### Community 94 - "Community 94"
Cohesion: 0.17
Nodes (2): IUserRepository, UserRepository

### Community 95 - "Community 95"
Cohesion: 0.20
Nodes (3): CompanyAdminRepository, ICompanyAdminRepository, MongoBaseRepository

### Community 96 - "Community 96"
Cohesion: 0.24
Nodes (7): SolutionEditorHeader(), SolutionEditorHeaderProps, SolutionEditorStyles(), useSolutionMdeOptions(), SimpleMDE, SolutionEditor(), SolutionEditorProps

### Community 97 - "Community 97"
Cohesion: 0.22
Nodes (4): ConnectionMetrics, Message, RedisUpdate, RegisterRoomRequest

### Community 98 - "Community 98"
Cohesion: 0.31
Nodes (7): GraphView(), GraphViewProps, SlugLearnTab(), TimelineView(), useCurriculumLayout(), SlugAboutGraphPreview(), TrackConfigResponse

### Community 99 - "Community 99"
Cohesion: 0.24
Nodes (1): FastScanner

### Community 100 - "Community 100"
Cohesion: 0.18
Nodes (2): BaseController, ProblemAdminController

### Community 101 - "Community 101"
Cohesion: 0.18
Nodes (2): IProblemAdminService, ProblemAdminService

### Community 102 - "Community 102"
Cohesion: 0.18
Nodes (3): IProblemRepository, MongoBaseRepository, ProblemRepository

### Community 103 - "Community 103"
Cohesion: 0.20
Nodes (2): ISolutionService, SolutionService

### Community 104 - "Community 104"
Cohesion: 0.22
Nodes (2): ISubmissionService, SubmissionCache

### Community 105 - "Community 105"
Cohesion: 0.20
Nodes (10): BatchMapProblemPayload, Category, CategoryDetail, CategoryTreeNode, CreateCategoryPayload, IdParams, MapParams, MapProblemPayload (+2 more)

### Community 106 - "Community 106"
Cohesion: 0.22
Nodes (3): AcademyService, IAcademyService, logger

### Community 107 - "Community 107"
Cohesion: 0.20
Nodes (7): GenerateJsonOptions, LlmStep, logger, ORDER1, ORDER2, UnifiedJsonResponse, UnifiedLlmService

### Community 108 - "Community 108"
Cohesion: 0.20
Nodes (2): ArenaController, BaseController

### Community 109 - "Community 109"
Cohesion: 0.38
Nodes (2): ChatService, IChatService

### Community 110 - "Community 110"
Cohesion: 0.24
Nodes (7): CompanyClient(), CompanyEditor(), CompanyList(), CompanyViewer(), CompanyViewerProps, useCompanyAdmin(), useCompanyStats()

### Community 111 - "Community 111"
Cohesion: 0.33
Nodes (2): BaseTypeMapper, JavaTypeMapper

### Community 112 - "Community 112"
Cohesion: 0.20
Nodes (9): ClassSignatureSchema, CodeSnippetsSchema, ExampleSchema, FunctionParameterSchema, FunctionSignatureSchema, JudgingPolicySchema, MethodSignatureSchema, ProblemDocument (+1 more)

### Community 113 - "Community 113"
Cohesion: 0.27
Nodes (5): BugReport, reportBugAdminService, ReportBugService, BugReport, ReportBugPayload

### Community 114 - "Community 114"
Cohesion: 0.36
Nodes (8): escapeString(), serialize(), serializeDoublyList(), serializeGraph(), serializeList(), serializeNaryTree(), serializeRandomList(), serializeTree()

### Community 115 - "Community 115"
Cohesion: 0.20
Nodes (3): IProblemAdminRepository, MongoBaseRepository, ProblemAdminRepository

### Community 116 - "Community 116"
Cohesion: 0.22
Nodes (2): IProblemService, ProblemService

### Community 117 - "Community 117"
Cohesion: 0.24
Nodes (7): ProfileSettingsTab(), ProfileSettingsTabProps, ProfileFormValues, useProfileSettingsForm(), UseProfileSettingsFormProps, ProfileSection(), ProfileSettingsSkeleton()

### Community 118 - "Community 118"
Cohesion: 0.20
Nodes (2): ISeoServiceDeps, SeoService

### Community 119 - "Community 119"
Cohesion: 0.22
Nodes (5): BaseBoxShapeUtil, CodeBlockShapeProps, CodeBlockShapeUtil, getHighlightedHtml(), ICodeBlockShape

### Community 120 - "Community 120"
Cohesion: 0.20
Nodes (4): BaseBoxShapeUtil, ISystemDesignShape, SystemDesignShapeProps, SystemDesignShapeUtil

### Community 121 - "Community 121"
Cohesion: 0.24
Nodes (8): useChatStore, DiagramStoreState, useDiagramStore, handleCreate(), useChat(), LLMCanvasAction, LLMCanvasActionCreate, LLMCanvasActionUpdate

### Community 122 - "Community 122"
Cohesion: 0.22
Nodes (4): ISubmissionRepository, MongoBaseRepository, SubmissionRepository, UpdateSubmissionStatusInput

### Community 123 - "Community 123"
Cohesion: 0.20
Nodes (2): ISubmissionService, SubmissionService

### Community 124 - "Community 124"
Cohesion: 0.22
Nodes (4): CacheAdminService, CacheKeyDetails, CacheKeyItem, ICacheAdminService

### Community 125 - "Community 125"
Cohesion: 0.20
Nodes (2): ITaxonomyAdminRepository, TaxonomyAdminRepository

### Community 126 - "Community 126"
Cohesion: 0.22
Nodes (7): AcademyAdminRouteDependencies, CreateConceptSchema, CreateExerciseSchema, CreateTrackSchema, UpdateConceptSchema, UpdateExerciseSchema, UpdateTrackSchema

### Community 127 - "Community 127"
Cohesion: 0.36
Nodes (2): AcademyCache, IAcademyService

### Community 128 - "Community 128"
Cohesion: 0.22
Nodes (2): ArenaMatchService, IArenaMatchService

### Community 129 - "Community 129"
Cohesion: 0.31
Nodes (3): generateLobbyMetadata(), generateMatchMetadata(), generateResultsMetadata()

### Community 130 - "Community 130"
Cohesion: 0.22
Nodes (1): ChatRepository

### Community 131 - "Community 131"
Cohesion: 0.25
Nodes (2): CompanyAdminService, ICompanyAdminService

### Community 132 - "Community 132"
Cohesion: 0.22
Nodes (2): BaseController, ContestAdminController

### Community 133 - "Community 133"
Cohesion: 0.22
Nodes (2): ContestRepository, IContestRepository

### Community 134 - "Community 134"
Cohesion: 0.28
Nodes (6): ContestClient(), ContestEditor(), ContestViewer(), ContestViewerProps, useContestAdmin(), useContestStats()

### Community 135 - "Community 135"
Cohesion: 0.25
Nodes (4): generateExecutionPackage(), LRU_SIGNATURE, LRU_TEST_CASES, fixtures

### Community 136 - "Community 136"
Cohesion: 0.33
Nodes (1): DriverJudgeExecutionService

### Community 137 - "Community 137"
Cohesion: 0.22
Nodes (2): IProblemService, ProblemCache

### Community 138 - "Community 138"
Cohesion: 0.22
Nodes (2): BaseController, ProblemController

### Community 139 - "Community 139"
Cohesion: 0.25
Nodes (4): IProblemTestRepository, MongoBaseRepository, ProblemTestRepository, UpsertProblemTestInput

### Community 140 - "Community 140"
Cohesion: 0.33
Nodes (2): SystemDesignTopic, SystemDesignTopicContent

### Community 141 - "Community 141"
Cohesion: 0.33
Nodes (6): applyOptions(), findAll(), findById(), RepositoryOptions, toDomain(), toDomainArray()

### Community 142 - "Community 142"
Cohesion: 0.22
Nodes (8): companiesDirPath, files, fs, massiveData, massiveJsonPath, missingSlugs, path, slugToId

### Community 143 - "Community 143"
Cohesion: 0.22
Nodes (2): BaseController, SeoController

### Community 144 - "Community 144"
Cohesion: 0.22
Nodes (2): BaseController, SolutionController

### Community 145 - "Community 145"
Cohesion: 0.22
Nodes (1): LeaderboardCache

### Community 146 - "Community 146"
Cohesion: 0.25
Nodes (2): IStatsService, StatsService

### Community 147 - "Community 147"
Cohesion: 0.22
Nodes (8): BatchMapProblemInput, batchMapProblemSchema, CreateCategoryInput, createCategorySchema, MapProblemInput, mapProblemSchema, UpdateCategoryInput, updateCategorySchema

### Community 148 - "Community 148"
Cohesion: 0.22
Nodes (2): FollowRepository, IFollowRepository

### Community 149 - "Community 149"
Cohesion: 0.28
Nodes (2): IStatsService, UserStatsCache

### Community 150 - "Community 150"
Cohesion: 0.22
Nodes (8): CreateDiagramInput, createDiagramSchema, CreateWorkspaceInput, createWorkspaceSchema, UpdateDiagramInput, updateDiagramSchema, UpdateWorkspaceInput, updateWorkspaceSchema

### Community 151 - "Community 151"
Cohesion: 0.31
Nodes (6): initialState, MainTab, SolTab, useWorkspaceStore, WorkspaceState, useWorkspaceSync()

### Community 152 - "Community 152"
Cohesion: 0.25
Nodes (2): AcademyController, BaseController

### Community 153 - "Community 153"
Cohesion: 0.25
Nodes (5): AcademyExecutionController, BaseController, logger, RunAcademyExerciseDto, RunAcademyExerciseSchema

### Community 154 - "Community 154"
Cohesion: 0.25
Nodes (2): ArenaMatchCache, IArenaMatchService

### Community 155 - "Community 155"
Cohesion: 0.36
Nodes (1): ArenaService

### Community 156 - "Community 156"
Cohesion: 0.25
Nodes (2): ArenaSubmissionRepository, MongoBaseRepository

### Community 157 - "Community 157"
Cohesion: 0.39
Nodes (1): AuthService

### Community 158 - "Community 158"
Cohesion: 0.25
Nodes (2): BaseController, ChatController

### Community 159 - "Community 159"
Cohesion: 0.25
Nodes (2): BaseController, CompanyAdminController

### Community 160 - "Community 160"
Cohesion: 0.29
Nodes (3): CompanyRepository, ICompanyRepository, MongoBaseRepository

### Community 161 - "Community 161"
Cohesion: 0.25
Nodes (2): ContestAdminService, IContestAdminService

### Community 163 - "Community 163"
Cohesion: 0.32
Nodes (1): MetricsCollector

### Community 164 - "Community 164"
Cohesion: 0.32
Nodes (6): useTracksFilter(), AcademyTracksClient(), AcademyTracksClientProps, TrackCard(), TracksToolbar(), Track

### Community 165 - "Community 165"
Cohesion: 0.29
Nodes (6): useSystemDesignAdmin(), SystemDesignClient(), TopicEditor(), TopicList(), TopicViewer(), TopicViewerProps

### Community 166 - "Community 166"
Cohesion: 0.25
Nodes (6): ConceptExercise, ConceptView(), ConceptViewProps, markdownComponents, ReferenceLink, ConceptViewSkeleton()

### Community 167 - "Community 167"
Cohesion: 0.39
Nodes (2): IndexedDBHelper, useDiagramAutoSave()

### Community 168 - "Community 168"
Cohesion: 0.25
Nodes (7): ArenaMatch, ArenaMatchDocument, ArenaMatchSchema, ArenaMatchStatus, ArenaPlayerResult, ArenaPlayerResultSchema, ArenaSubmissionVerdict

### Community 169 - "Community 169"
Cohesion: 0.29
Nodes (3): build_list(), buildList(), ListNode

### Community 170 - "Community 170"
Cohesion: 0.29
Nodes (3): build_tree(), buildTree(), TreeNode

### Community 172 - "Community 172"
Cohesion: 0.25
Nodes (1): SEO_QUERY_KEYS

### Community 173 - "Community 173"
Cohesion: 0.32
Nodes (1): ReportBugAdminService

### Community 174 - "Community 174"
Cohesion: 0.39
Nodes (2): BaseTypeMapper, RustTypeMapper

### Community 175 - "Community 175"
Cohesion: 0.25
Nodes (2): BaseController, SubmissionController

### Community 176 - "Community 176"
Cohesion: 0.29
Nodes (3): ISystemDesignRepository, MongoBaseRepository, SystemDesignRepository

### Community 177 - "Community 177"
Cohesion: 0.32
Nodes (3): systemDesignHubMeta, systemDesignLearnMeta, systemDesignWorkspaceMeta

### Community 178 - "Community 178"
Cohesion: 0.25
Nodes (2): ITaxonomyService, TaxonomyService

### Community 179 - "Community 179"
Cohesion: 0.36
Nodes (6): Alert, AlertDescription, AlertTitle, alertVariants, ApiError(), ApiErrorProps

### Community 180 - "Community 180"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 181 - "Community 181"
Cohesion: 0.25
Nodes (2): FollowService, IFollowService

### Community 182 - "Community 182"
Cohesion: 0.33
Nodes (4): UserClient(), UserEditor(), UserList(), UserViewer()

### Community 183 - "Community 183"
Cohesion: 0.29
Nodes (6): CreateRoomInput, createRoomSchema, matchIdParamsSchema, roomIdParamsSchema, UpdateRoomProblemInput, updateRoomProblemSchema

### Community 184 - "Community 184"
Cohesion: 0.43
Nodes (2): BaseTypeMapper, CTypeMapper

### Community 185 - "Community 185"
Cohesion: 0.29
Nodes (2): AzureProvider, ICloudProvider

### Community 186 - "Community 186"
Cohesion: 0.33
Nodes (2): CompanyService, ICompanyService

### Community 187 - "Community 187"
Cohesion: 0.48
Nodes (2): BaseTypeMapper, CppTypeMapper

### Community 188 - "Community 188"
Cohesion: 0.48
Nodes (2): BaseTypeMapper, CSharpTypeMapper

### Community 189 - "Community 189"
Cohesion: 0.33
Nodes (2): BaseTypeMapper, GoTypeMapper

### Community 190 - "Community 190"
Cohesion: 0.33
Nodes (5): buildDefaultElements(), DEFAULT_APP_STATE, Excalidraw, formatInput(), ScratchpadProps

### Community 192 - "Community 192"
Cohesion: 0.29
Nodes (1): Comparator

### Community 193 - "Community 193"
Cohesion: 0.33
Nodes (2): IProblemTestService, ProblemTestService

### Community 195 - "Community 195"
Cohesion: 0.29
Nodes (5): __dirname, DRY_RUN, exercisesDir, __filename, repoRoot

### Community 196 - "Community 196"
Cohesion: 0.29
Nodes (1): SeoRepository

### Community 197 - "Community 197"
Cohesion: 0.29
Nodes (1): ArenaEventProcessor

### Community 198 - "Community 198"
Cohesion: 0.29
Nodes (1): ArenaSocketManager

### Community 199 - "Community 199"
Cohesion: 0.43
Nodes (5): cacheService, CacheKeyDetails, CacheKeyItem, GetCacheKeysParams, GetCacheKeysResponse

### Community 200 - "Community 200"
Cohesion: 0.29
Nodes (6): PaginatedResponse, Problem, problemAdminService, ProblemStats, ProblemTest, TestCase

### Community 201 - "Community 201"
Cohesion: 0.38
Nodes (2): generateLearnMetadata(), generateWorkspaceMetadata()

### Community 202 - "Community 202"
Cohesion: 0.29
Nodes (2): BaseController, StatsController

### Community 203 - "Community 203"
Cohesion: 0.29
Nodes (6): CreateSubmissionInput, EvaluationResultData, Submission, SubmissionStatus, TestCaseResult, UpdateSubmissionInput

### Community 204 - "Community 204"
Cohesion: 0.29
Nodes (2): BaseController, CacheAdminController

### Community 205 - "Community 205"
Cohesion: 0.33
Nodes (6): buildCanvasGraph(), getActiveFrameInfo(), CanvasFrame, SemanticEdge, SemanticGroup, SemanticNode

### Community 206 - "Community 206"
Cohesion: 0.29
Nodes (2): BaseController, TaxonomyController

### Community 207 - "Community 207"
Cohesion: 0.29
Nodes (6): SitemapAcademyExercise, SitemapAcademyTrack, SitemapCompanyTag, SitemapProblem, SitemapSystemDesignLesson, SitemapUser

### Community 208 - "Community 208"
Cohesion: 0.43
Nodes (2): BaseTypeMapper, TypeScriptTypeMapper

### Community 209 - "Community 209"
Cohesion: 0.29
Nodes (2): BaseController, FollowController

### Community 210 - "Community 210"
Cohesion: 0.33
Nodes (3): AcademyAiJudgeService, AcademyExecutionResult, AiJudgeEvaluationParams

### Community 211 - "Community 211"
Cohesion: 0.53
Nodes (1): AcademyExecutionService

### Community 212 - "Community 212"
Cohesion: 0.33
Nodes (5): AiVerdictAuditInput, AiVerdictAuditResult, AuditCaseVerdict, AuditOutput, AuditVerdict

### Community 213 - "Community 213"
Cohesion: 0.33
Nodes (1): MatchDomainEngine

### Community 214 - "Community 214"
Cohesion: 0.47
Nodes (4): CacheViewer(), CacheViewerProps, formatTTL(), useCacheAdmin()

### Community 215 - "Community 215"
Cohesion: 0.40
Nodes (2): IClockService, SystemClockService

### Community 216 - "Community 216"
Cohesion: 0.33
Nodes (2): CompanyCache, ICompanyService

### Community 217 - "Community 217"
Cohesion: 0.33
Nodes (2): BaseController, CompanyController

### Community 218 - "Community 218"
Cohesion: 0.33
Nodes (5): CompilerExecutionResponse, WandboxCompiler, WandboxExecutePayload, WandboxExecuteResult, WandboxSwitch

### Community 219 - "Community 219"
Cohesion: 0.53
Nodes (2): CodecRegistry, createDefaultCodecRegistry()

### Community 220 - "Community 220"
Cohesion: 0.53
Nodes (5): CompareOptions, deepEqualByTypeString(), deepEqualTyped(), isNumber(), stableStringify()

### Community 221 - "Community 221"
Cohesion: 0.47
Nodes (5): bug_reports, chat_threads, public.diagrams, public.users, user_academy_exercises

### Community 222 - "Community 222"
Cohesion: 0.33
Nodes (2): Origin, SideRaysProps

### Community 223 - "Community 223"
Cohesion: 0.33
Nodes (5): JobFailureEvent, QueueHealthStatus, SubmissionEvaluationJob, SubmissionEvaluationResult, TestResult

### Community 224 - "Community 224"
Cohesion: 0.40
Nodes (2): BaseTypeMapper, JavaScriptTypeMapper

### Community 225 - "Community 225"
Cohesion: 0.53
Nodes (1): Judge0Service

### Community 226 - "Community 226"
Cohesion: 0.33
Nodes (5): ArenaPlayer, ArenaPlayerStatus, ArenaRoom, ArenaRoomStatus, ArenaWSMessage

### Community 227 - "Community 227"
Cohesion: 0.33
Nodes (2): AiProblemController, BaseController

### Community 228 - "Community 228"
Cohesion: 0.33
Nodes (2): IProblemTestService, ProblemTestCache

### Community 229 - "Community 229"
Cohesion: 0.33
Nodes (2): BaseController, ProblemTestController

### Community 230 - "Community 230"
Cohesion: 0.33
Nodes (3): logger, TestCaseGeneratorResult, TestcaseGeneratorService

### Community 231 - "Community 231"
Cohesion: 0.47
Nodes (2): BaseTypeMapper, PythonTypeMapper

### Community 233 - "Community 233"
Cohesion: 0.33
Nodes (1): workspaceKeys

### Community 234 - "Community 234"
Cohesion: 0.33
Nodes (1): ChatService

### Community 235 - "Community 235"
Cohesion: 0.33
Nodes (5): DifficultySchema, LeaderboardQueryInput, LeaderboardQuerySchema, UpdateStatsInput, UpdateStatsSchema

### Community 236 - "Community 236"
Cohesion: 0.33
Nodes (2): ISystemDesignService, SystemDesignCache

### Community 237 - "Community 237"
Cohesion: 0.33
Nodes (2): BaseController, SystemDesignController

### Community 238 - "Community 238"
Cohesion: 0.33
Nodes (2): ISystemDesignService, SystemDesignService

### Community 239 - "Community 239"
Cohesion: 0.33
Nodes (4): extracted, files, fs, path

### Community 240 - "Community 240"
Cohesion: 0.33
Nodes (5): content, finalContent, fs, functionContent, startIndex

### Community 241 - "Community 241"
Cohesion: 0.50
Nodes (2): GeminiLlmService, ILlmService

### Community 242 - "Community 242"
Cohesion: 0.50
Nodes (2): ILlmService, LlmService

### Community 243 - "Community 243"
Cohesion: 0.40
Nodes (4): ArenaMatchDetailed, ArenaPlayerDetailed, zArenaMatchDetailed, zArenaPlayerDetailed

### Community 244 - "Community 244"
Cohesion: 0.40
Nodes (4): ArenaPlayer, ArenaRoom, ArenaRoomStatus, ArenaWSMessage

### Community 245 - "Community 245"
Cohesion: 0.40
Nodes (1): MatchBroadcasterService

### Community 246 - "Community 246"
Cohesion: 0.50
Nodes (2): arenaHubMeta, arenaSelectMeta

### Community 247 - "Community 247"
Cohesion: 0.40
Nodes (2): BaseController, CompilerController

### Community 248 - "Community 248"
Cohesion: 0.40
Nodes (1): ContestService

### Community 249 - "Community 249"
Cohesion: 0.70
Nodes (4): public.solutions, public.users, solution_votes, solutions

### Community 250 - "Community 250"
Cohesion: 0.60
Nodes (4): diagrams, public.users, public.workspaces, workspaces

### Community 251 - "Community 251"
Cohesion: 0.60
Nodes (4): chat_messages, chat_threads, public.chat_threads, public.workspaces

### Community 252 - "Community 252"
Cohesion: 0.50
Nodes (3): LeaderboardHeader(), LeaderboardState, useLeaderboardStore

### Community 253 - "Community 253"
Cohesion: 0.70
Nodes (4): beautifyTestCaseInput(), formatValue(), looksLikeJson(), safeJsonParse()

### Community 255 - "Community 255"
Cohesion: 0.40
Nodes (4): AiGeneratedProblem, AiGeneratedTests, AiProblemOutput, ImportedProblemPayload

### Community 258 - "Community 258"
Cohesion: 0.40
Nodes (2): BaseController, ReportBugAdminController

### Community 259 - "Community 259"
Cohesion: 0.40
Nodes (1): ReportBugAdminRepository

### Community 260 - "Community 260"
Cohesion: 0.50
Nodes (2): IReportBugService, ReportBugService

### Community 261 - "Community 261"
Cohesion: 0.50
Nodes (2): LearnContentSkeleton(), LearnSidebarSkeleton()

### Community 262 - "Community 262"
Cohesion: 0.50
Nodes (1): StatsSubmissionService

### Community 263 - "Community 263"
Cohesion: 0.40
Nodes (4): RunSubmissionInput, runSubmissionSchema, SubmitSubmissionInput, submitSubmissionSchema

### Community 264 - "Community 264"
Cohesion: 0.40
Nodes (4): BulkReorderSystemDesignTopicsPayload, CreateSystemDesignTopicPayload, IdParams, UpdateSystemDesignTopicPayload

### Community 265 - "Community 265"
Cohesion: 0.40
Nodes (4): destDir, filesToCopy, fs, path

### Community 266 - "Community 266"
Cohesion: 0.40
Nodes (3): files, fs, path

### Community 267 - "Community 267"
Cohesion: 0.50
Nodes (2): ILeetCodeService, LeetCodeCache

### Community 268 - "Community 268"
Cohesion: 0.50
Nodes (2): IUserService, UserService

### Community 269 - "Community 269"
Cohesion: 0.50
Nodes (3): MatchRanker, PlayerLike, RankedPlayer

### Community 270 - "Community 270"
Cohesion: 0.50
Nodes (4): ExecutionTestResult, ExecutionVerdict, mapJudge0ToExecutionVerdict(), normalize()

### Community 271 - "Community 271"
Cohesion: 0.40
Nodes (4): CreateSolutionInput, createSolutionSchema, VoteSolutionInput, voteSolutionSchema

### Community 272 - "Community 272"
Cohesion: 0.50
Nodes (2): ILlmService, LlmCache

### Community 273 - "Community 273"
Cohesion: 0.50
Nodes (2): ArenaAdminController, BaseController

### Community 274 - "Community 274"
Cohesion: 0.67
Nodes (2): ArenaAdminRepository, IArenaAdminRepository

### Community 275 - "Community 275"
Cohesion: 0.50
Nodes (1): MatchValidatorService

### Community 276 - "Community 276"
Cohesion: 0.50
Nodes (2): AuthController, BaseController

### Community 277 - "Community 277"
Cohesion: 0.50
Nodes (2): BaseController, ClerkWebhookController

### Community 278 - "Community 278"
Cohesion: 0.50
Nodes (3): CProvider, LanguageProvider, loadTemplate()

### Community 279 - "Community 279"
Cohesion: 0.50
Nodes (1): CompilerService

### Community 280 - "Community 280"
Cohesion: 0.50
Nodes (1): ContestCache

### Community 281 - "Community 281"
Cohesion: 0.67
Nodes (1): contestsHubMeta

### Community 282 - "Community 282"
Cohesion: 0.50
Nodes (3): CppProvider, LanguageProvider, loadTemplate()

### Community 283 - "Community 283"
Cohesion: 0.67
Nodes (2): CSharpProvider, LanguageProvider

### Community 284 - "Community 284"
Cohesion: 0.67
Nodes (2): GoProvider, LanguageProvider

### Community 285 - "Community 285"
Cohesion: 0.50
Nodes (3): JavaProvider, LanguageProvider, loadTemplate()

### Community 286 - "Community 286"
Cohesion: 0.67
Nodes (2): JavaScriptProvider, LanguageProvider

### Community 287 - "Community 287"
Cohesion: 0.50
Nodes (2): AiJudgeCache, IAiJudgeService

### Community 288 - "Community 288"
Cohesion: 0.67
Nodes (1): AiVerdictAuditService

### Community 289 - "Community 289"
Cohesion: 0.50
Nodes (3): DriverJudgeInput, DriverJudgeResult, SuspicionResult

### Community 290 - "Community 290"
Cohesion: 0.67
Nodes (1): leaderboardMeta

### Community 291 - "Community 291"
Cohesion: 0.50
Nodes (1): AuthMiddleware

### Community 292 - "Community 292"
Cohesion: 0.50
Nodes (1): submissionRetryConfig

### Community 293 - "Community 293"
Cohesion: 0.67
Nodes (1): AiAddSolveService

### Community 294 - "Community 294"
Cohesion: 0.50
Nodes (2): ProblemAdminRoutesDeps, problemSearchQuerySchema

### Community 295 - "Community 295"
Cohesion: 0.50
Nodes (2): ProblemRoutesDeps, UserIdParamSchema

### Community 296 - "Community 296"
Cohesion: 0.50
Nodes (3): testCaseSchema, UpsertTestsInput, upsertTestsSchema

### Community 297 - "Community 297"
Cohesion: 0.50
Nodes (1): ProblemValidatorService

### Community 298 - "Community 298"
Cohesion: 0.50
Nodes (3): CreateProblemInput, createProblemSchema, problemSearchQuerySchema

### Community 299 - "Community 299"
Cohesion: 0.50
Nodes (2): AI_CODE_JUDGE_SYSTEM_PROMPT, AiCodeJudgeUserPromptParams

### Community 300 - "Community 300"
Cohesion: 0.50
Nodes (1): solutionKeys

### Community 302 - "Community 302"
Cohesion: 0.67
Nodes (1): reportBugMeta

### Community 303 - "Community 303"
Cohesion: 0.67
Nodes (1): roadmapMeta

### Community 304 - "Community 304"
Cohesion: 0.67
Nodes (1): RoadmapSkeleton()

### Community 305 - "Community 305"
Cohesion: 0.67
Nodes (2): LanguageProvider, RustProvider

### Community 306 - "Community 306"
Cohesion: 0.67
Nodes (2): GET(), SentryExampleAPIError

### Community 307 - "Community 307"
Cohesion: 0.50
Nodes (1): SentryExampleFrontendError

### Community 308 - "Community 308"
Cohesion: 0.67
Nodes (1): settingsMeta

### Community 309 - "Community 309"
Cohesion: 0.50
Nodes (3): JobFailureEvent, SubmissionEvaluationResult, TestResult

### Community 310 - "Community 310"
Cohesion: 0.50
Nodes (3): cacheKeyParamSchema, GetCacheKeysQuery, getCacheKeysSchema

### Community 311 - "Community 311"
Cohesion: 0.50
Nodes (3): bulkReorderSystemDesignTopicsSchema, createSystemDesignTopicSchema, updateSystemDesignTopicSchema

### Community 312 - "Community 312"
Cohesion: 0.50
Nodes (2): options, testProblems

### Community 313 - "Community 313"
Cohesion: 0.50
Nodes (3): Company, CompanyProblem, CompanyProblemsResponse

### Community 314 - "Community 314"
Cohesion: 0.67
Nodes (2): LanguageProvider, TypeScriptProvider

### Community 315 - "Community 315"
Cohesion: 0.67
Nodes (1): generateUserMetadata()

### Community 316 - "Community 316"
Cohesion: 0.50
Nodes (2): BaseController, ProfileController

### Community 317 - "Community 317"
Cohesion: 0.50
Nodes (2): BaseController, UserController

### Community 318 - "Community 318"
Cohesion: 0.50
Nodes (2): ExecuteCodeInput, ExecuteCodeSchema

### Community 319 - "Community 319"
Cohesion: 0.67
Nodes (1): AcademyRouteDependencies

### Community 320 - "Community 320"
Cohesion: 0.67
Nodes (1): ArenaAdminRoutesDeps

### Community 321 - "Community 321"
Cohesion: 0.67
Nodes (1): ArenaRoutesDeps

### Community 322 - "Community 322"
Cohesion: 0.67
Nodes (1): AuthRoutesDeps

### Community 324 - "Community 324"
Cohesion: 0.67
Nodes (1): CloudFactory

### Community 325 - "Community 325"
Cohesion: 0.67
Nodes (2): ICloudProvider, VmStatus

### Community 326 - "Community 326"
Cohesion: 0.67
Nodes (1): CompanyAdminRouteDeps

### Community 327 - "Community 327"
Cohesion: 0.67
Nodes (2): CreateCompanyPayload, UpdateCompanyPayload

### Community 328 - "Community 328"
Cohesion: 0.67
Nodes (2): createCompanySchema, updateCompanySchema

### Community 329 - "Community 329"
Cohesion: 0.67
Nodes (1): CompanyRouteDependencies

### Community 330 - "Community 330"
Cohesion: 1.33
Nodes (2): getEnv(), LoadConfig()

### Community 331 - "Community 331"
Cohesion: 0.67
Nodes (1): ContestAdminRouteDeps

### Community 332 - "Community 332"
Cohesion: 0.67
Nodes (2): CreateContestPayload, UpdateContestPayload

### Community 333 - "Community 333"
Cohesion: 0.67
Nodes (2): createContestSchema, updateContestSchema

### Community 336 - "Community 336"
Cohesion: 0.67
Nodes (1): Main

### Community 337 - "Community 337"
Cohesion: 0.67
Nodes (1): fs

### Community 338 - "Community 338"
Cohesion: 0.67
Nodes (1): metadata

### Community 339 - "Community 339"
Cohesion: 0.67
Nodes (1): AiProblemRoutesDeps

### Community 340 - "Community 340"
Cohesion: 0.67
Nodes (2): ImportedProblemInput, importedProblemSchema

### Community 341 - "Community 341"
Cohesion: 0.67
Nodes (2): CreateAdminProblemPayload, UpdateAdminProblemPayload

### Community 342 - "Community 342"
Cohesion: 0.67
Nodes (2): updateAdminProblemSchema, updateProblemTestsSchema

### Community 343 - "Community 343"
Cohesion: 0.67
Nodes (1): ProblemTestRoutesDeps

### Community 345 - "Community 345"
Cohesion: 0.67
Nodes (1): JSON_STRUCTURE_EXAMPLE

### Community 346 - "Community 346"
Cohesion: 0.67
Nodes (1): AI_PROBLEM_SYSTEM_PROMPT

### Community 349 - "Community 349"
Cohesion: 0.67
Nodes (1): ReportBugAdminRouteDeps

### Community 350 - "Community 350"
Cohesion: 0.67
Nodes (2): createBugReportSchema, updateBugReportSchema

### Community 351 - "Community 351"
Cohesion: 0.67
Nodes (1): CompilerRoutesDeps

### Community 352 - "Community 352"
Cohesion: 0.67
Nodes (1): Solution

### Community 353 - "Community 353"
Cohesion: 0.67
Nodes (1): RegisterSeoRoutesDeps

### Community 354 - "Community 354"
Cohesion: 0.67
Nodes (2): config, isPublicRoute

### Community 355 - "Community 355"
Cohesion: 0.67
Nodes (1): StatsRoutesDeps

### Community 356 - "Community 356"
Cohesion: 0.67
Nodes (2): AppState, useAppStore

### Community 357 - "Community 357"
Cohesion: 0.67
Nodes (1): SubmissionRoutesDeps

### Community 358 - "Community 358"
Cohesion: 0.67
Nodes (1): CacheAdminRouteDeps

### Community 359 - "Community 359"
Cohesion: 0.67
Nodes (1): SystemDesignAdminRouteDeps

### Community 360 - "Community 360"
Cohesion: 0.67
Nodes (1): SystemDesignRouteDependencies

### Community 361 - "Community 361"
Cohesion: 0.67
Nodes (1): TaxonomyAdminRouteDeps

### Community 362 - "Community 362"
Cohesion: 0.67
Nodes (1): TaxonomyRouteDeps

### Community 363 - "Community 363"
Cohesion: 0.67
Nodes (1): metadata

### Community 364 - "Community 364"
Cohesion: 0.67
Nodes (1): genAI

### Community 365 - "Community 365"
Cohesion: 0.67
Nodes (1): genAI

### Community 366 - "Community 366"
Cohesion: 0.67
Nodes (1): FollowRouteDependencies

### Community 367 - "Community 367"
Cohesion: 0.67
Nodes (1): ProfileRouteDependencies

### Community 368 - "Community 368"
Cohesion: 0.67
Nodes (1): UserAdminRouteDeps

### Community 369 - "Community 369"
Cohesion: 0.67
Nodes (1): UserRouteDependencies

### Community 370 - "Community 370"
Cohesion: 0.67
Nodes (2): GetProblemSchema, GetProblemsSchema

### Community 371 - "Community 371"
Cohesion: 0.67
Nodes (2): CreateCompanyInput, createCompanySchema

### Community 372 - "Community 372"
Cohesion: 0.67
Nodes (2): CreateSystemDesignTopicInput, createSystemDesignTopicSchema

### Community 374 - "Community 374"
Cohesion: 1.00
Nodes (1): nextConfig

### Community 375 - "Community 375"
Cohesion: 1.00
Nodes (1): config

### Community 381 - "Community 381"
Cohesion: 1.00
Nodes (1): PUBLIC_CONFIG

### Community 383 - "Community 383"
Cohesion: 1.00
Nodes (1): repositoriesRegistry

### Community 385 - "Community 385"
Cohesion: 1.00
Nodes (1): users

### Community 403 - "Community 403"
Cohesion: 1.00
Nodes (1): SyncUserSchema

### Community 404 - "Community 404"
Cohesion: 1.00
Nodes (1): eslintConfig

### Community 405 - "Community 405"
Cohesion: 1.00
Nodes (1): nextConfig

### Community 406 - "Community 406"
Cohesion: 1.00
Nodes (1): config

## Knowledge Gaps
- **955 isolated node(s):** `nextConfig`, `config`, `geistSans`, `geistMono`, `metadata` (+950 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 31`** (1 nodes): `Scanner`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `BaseController`, `UserAdminController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `UserAdminService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `UserAdminRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (2 nodes): `AcademyAdminService`, `IAcademyAdminService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (2 nodes): `AcademyAdminController`, `BaseController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (2 nodes): `IWorkspaceService`, `WorkspaceCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (2 nodes): `IWorkspaceService`, `WorkspaceService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (2 nodes): `ArenaMatchRepository`, `MongoBaseRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `ArenaRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (2 nodes): `TrackConceptResponse`, `TracksResponse`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (1 nodes): `ArenaRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (2 nodes): `ISolutionRepository`, `SolutionRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (2 nodes): `BaseController`, `WorkspaceController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (2 nodes): `IWorkspaceRepository`, `WorkspaceRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (2 nodes): `BaseController`, `SystemDesignAdminController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (2 nodes): `ISystemDesignAdminService`, `SystemDesignAdminService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (2 nodes): `ITaxonomyService`, `TaxonomyCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (2 nodes): `ITaxonomyRepository`, `TaxonomyRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (1 nodes): `ArenaService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (1 nodes): `WorkspaceService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (2 nodes): `ISolutionService`, `SolutionCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (2 nodes): `IStatsRepository`, `StatsRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (2 nodes): `BaseController`, `TaxonomyAdminController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (2 nodes): `ITaxonomyAdminService`, `TaxonomyAdminService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (2 nodes): `IUserRepository`, `UserRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (1 nodes): `FastScanner`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (2 nodes): `BaseController`, `ProblemAdminController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 101`** (2 nodes): `IProblemAdminService`, `ProblemAdminService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (2 nodes): `ISolutionService`, `SolutionService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (2 nodes): `ISubmissionService`, `SubmissionCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (2 nodes): `ArenaController`, `BaseController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (2 nodes): `ChatService`, `IChatService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 111`** (2 nodes): `BaseTypeMapper`, `JavaTypeMapper`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 116`** (2 nodes): `IProblemService`, `ProblemService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 118`** (2 nodes): `ISeoServiceDeps`, `SeoService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 123`** (2 nodes): `ISubmissionService`, `SubmissionService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 125`** (2 nodes): `ITaxonomyAdminRepository`, `TaxonomyAdminRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 127`** (2 nodes): `AcademyCache`, `IAcademyService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 128`** (2 nodes): `ArenaMatchService`, `IArenaMatchService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 130`** (1 nodes): `ChatRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 131`** (2 nodes): `CompanyAdminService`, `ICompanyAdminService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 132`** (2 nodes): `BaseController`, `ContestAdminController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 133`** (2 nodes): `ContestRepository`, `IContestRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 136`** (1 nodes): `DriverJudgeExecutionService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 137`** (2 nodes): `IProblemService`, `ProblemCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 138`** (2 nodes): `BaseController`, `ProblemController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 140`** (2 nodes): `SystemDesignTopic`, `SystemDesignTopicContent`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 143`** (2 nodes): `BaseController`, `SeoController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 144`** (2 nodes): `BaseController`, `SolutionController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 145`** (1 nodes): `LeaderboardCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 146`** (2 nodes): `IStatsService`, `StatsService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 148`** (2 nodes): `FollowRepository`, `IFollowRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 149`** (2 nodes): `IStatsService`, `UserStatsCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 152`** (2 nodes): `AcademyController`, `BaseController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 154`** (2 nodes): `ArenaMatchCache`, `IArenaMatchService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 155`** (1 nodes): `ArenaService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 156`** (2 nodes): `ArenaSubmissionRepository`, `MongoBaseRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 157`** (1 nodes): `AuthService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 158`** (2 nodes): `BaseController`, `ChatController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 159`** (2 nodes): `BaseController`, `CompanyAdminController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 161`** (2 nodes): `ContestAdminService`, `IContestAdminService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 163`** (1 nodes): `MetricsCollector`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 167`** (2 nodes): `IndexedDBHelper`, `useDiagramAutoSave()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 172`** (1 nodes): `SEO_QUERY_KEYS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 173`** (1 nodes): `ReportBugAdminService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 174`** (2 nodes): `BaseTypeMapper`, `RustTypeMapper`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 175`** (2 nodes): `BaseController`, `SubmissionController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 178`** (2 nodes): `ITaxonomyService`, `TaxonomyService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 181`** (2 nodes): `FollowService`, `IFollowService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 184`** (2 nodes): `BaseTypeMapper`, `CTypeMapper`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 185`** (2 nodes): `AzureProvider`, `ICloudProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 186`** (2 nodes): `CompanyService`, `ICompanyService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 187`** (2 nodes): `BaseTypeMapper`, `CppTypeMapper`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 188`** (2 nodes): `BaseTypeMapper`, `CSharpTypeMapper`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 189`** (2 nodes): `BaseTypeMapper`, `GoTypeMapper`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 192`** (1 nodes): `Comparator`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 193`** (2 nodes): `IProblemTestService`, `ProblemTestService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 196`** (1 nodes): `SeoRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 197`** (1 nodes): `ArenaEventProcessor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 198`** (1 nodes): `ArenaSocketManager`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 201`** (2 nodes): `generateLearnMetadata()`, `generateWorkspaceMetadata()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 202`** (2 nodes): `BaseController`, `StatsController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 204`** (2 nodes): `BaseController`, `CacheAdminController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 206`** (2 nodes): `BaseController`, `TaxonomyController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 208`** (2 nodes): `BaseTypeMapper`, `TypeScriptTypeMapper`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 209`** (2 nodes): `BaseController`, `FollowController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 211`** (1 nodes): `AcademyExecutionService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 213`** (1 nodes): `MatchDomainEngine`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 215`** (2 nodes): `IClockService`, `SystemClockService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 216`** (2 nodes): `CompanyCache`, `ICompanyService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 217`** (2 nodes): `BaseController`, `CompanyController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 219`** (2 nodes): `CodecRegistry`, `createDefaultCodecRegistry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 222`** (2 nodes): `Origin`, `SideRaysProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 224`** (2 nodes): `BaseTypeMapper`, `JavaScriptTypeMapper`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 225`** (1 nodes): `Judge0Service`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 227`** (2 nodes): `AiProblemController`, `BaseController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 228`** (2 nodes): `IProblemTestService`, `ProblemTestCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 229`** (2 nodes): `BaseController`, `ProblemTestController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 231`** (2 nodes): `BaseTypeMapper`, `PythonTypeMapper`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 233`** (1 nodes): `workspaceKeys`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 234`** (1 nodes): `ChatService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 236`** (2 nodes): `ISystemDesignService`, `SystemDesignCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 237`** (2 nodes): `BaseController`, `SystemDesignController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 238`** (2 nodes): `ISystemDesignService`, `SystemDesignService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 241`** (2 nodes): `GeminiLlmService`, `ILlmService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 242`** (2 nodes): `ILlmService`, `LlmService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 245`** (1 nodes): `MatchBroadcasterService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 246`** (2 nodes): `arenaHubMeta`, `arenaSelectMeta`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 247`** (2 nodes): `BaseController`, `CompilerController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 248`** (1 nodes): `ContestService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 258`** (2 nodes): `BaseController`, `ReportBugAdminController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 259`** (1 nodes): `ReportBugAdminRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 260`** (2 nodes): `IReportBugService`, `ReportBugService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 261`** (2 nodes): `LearnContentSkeleton()`, `LearnSidebarSkeleton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 262`** (1 nodes): `StatsSubmissionService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 267`** (2 nodes): `ILeetCodeService`, `LeetCodeCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 268`** (2 nodes): `IUserService`, `UserService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 272`** (2 nodes): `ILlmService`, `LlmCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 273`** (2 nodes): `ArenaAdminController`, `BaseController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 274`** (2 nodes): `ArenaAdminRepository`, `IArenaAdminRepository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 275`** (1 nodes): `MatchValidatorService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 276`** (2 nodes): `AuthController`, `BaseController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 277`** (2 nodes): `BaseController`, `ClerkWebhookController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 279`** (1 nodes): `CompilerService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 280`** (1 nodes): `ContestCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 281`** (1 nodes): `contestsHubMeta`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 283`** (2 nodes): `CSharpProvider`, `LanguageProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 284`** (2 nodes): `GoProvider`, `LanguageProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 286`** (2 nodes): `JavaScriptProvider`, `LanguageProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 287`** (2 nodes): `AiJudgeCache`, `IAiJudgeService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 288`** (1 nodes): `AiVerdictAuditService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 290`** (1 nodes): `leaderboardMeta`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 291`** (1 nodes): `AuthMiddleware`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 292`** (1 nodes): `submissionRetryConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 293`** (1 nodes): `AiAddSolveService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 294`** (2 nodes): `ProblemAdminRoutesDeps`, `problemSearchQuerySchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 295`** (2 nodes): `ProblemRoutesDeps`, `UserIdParamSchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 297`** (1 nodes): `ProblemValidatorService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 299`** (2 nodes): `AI_CODE_JUDGE_SYSTEM_PROMPT`, `AiCodeJudgeUserPromptParams`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 300`** (1 nodes): `solutionKeys`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 302`** (1 nodes): `reportBugMeta`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 303`** (1 nodes): `roadmapMeta`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 304`** (1 nodes): `RoadmapSkeleton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 305`** (2 nodes): `LanguageProvider`, `RustProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 306`** (2 nodes): `GET()`, `SentryExampleAPIError`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 307`** (1 nodes): `SentryExampleFrontendError`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 308`** (1 nodes): `settingsMeta`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 312`** (2 nodes): `options`, `testProblems`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 314`** (2 nodes): `LanguageProvider`, `TypeScriptProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 315`** (1 nodes): `generateUserMetadata()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 316`** (2 nodes): `BaseController`, `ProfileController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 317`** (2 nodes): `BaseController`, `UserController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 318`** (2 nodes): `ExecuteCodeInput`, `ExecuteCodeSchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 319`** (1 nodes): `AcademyRouteDependencies`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 320`** (1 nodes): `ArenaAdminRoutesDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 321`** (1 nodes): `ArenaRoutesDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 322`** (1 nodes): `AuthRoutesDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 324`** (1 nodes): `CloudFactory`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 325`** (2 nodes): `ICloudProvider`, `VmStatus`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 326`** (1 nodes): `CompanyAdminRouteDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 327`** (2 nodes): `CreateCompanyPayload`, `UpdateCompanyPayload`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 328`** (2 nodes): `createCompanySchema`, `updateCompanySchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 329`** (1 nodes): `CompanyRouteDependencies`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 330`** (2 nodes): `getEnv()`, `LoadConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 331`** (1 nodes): `ContestAdminRouteDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 332`** (2 nodes): `CreateContestPayload`, `UpdateContestPayload`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 333`** (2 nodes): `createContestSchema`, `updateContestSchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 336`** (1 nodes): `Main`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 337`** (1 nodes): `fs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 338`** (1 nodes): `metadata`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 339`** (1 nodes): `AiProblemRoutesDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 340`** (2 nodes): `ImportedProblemInput`, `importedProblemSchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 341`** (2 nodes): `CreateAdminProblemPayload`, `UpdateAdminProblemPayload`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 342`** (2 nodes): `updateAdminProblemSchema`, `updateProblemTestsSchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 343`** (1 nodes): `ProblemTestRoutesDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 345`** (1 nodes): `JSON_STRUCTURE_EXAMPLE`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 346`** (1 nodes): `AI_PROBLEM_SYSTEM_PROMPT`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 349`** (1 nodes): `ReportBugAdminRouteDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 350`** (2 nodes): `createBugReportSchema`, `updateBugReportSchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 351`** (1 nodes): `CompilerRoutesDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 352`** (1 nodes): `Solution`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 353`** (1 nodes): `RegisterSeoRoutesDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 354`** (2 nodes): `config`, `isPublicRoute`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 355`** (1 nodes): `StatsRoutesDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 356`** (2 nodes): `AppState`, `useAppStore`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 357`** (1 nodes): `SubmissionRoutesDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 358`** (1 nodes): `CacheAdminRouteDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 359`** (1 nodes): `SystemDesignAdminRouteDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 360`** (1 nodes): `SystemDesignRouteDependencies`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 361`** (1 nodes): `TaxonomyAdminRouteDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 362`** (1 nodes): `TaxonomyRouteDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 363`** (1 nodes): `metadata`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 364`** (1 nodes): `genAI`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 365`** (1 nodes): `genAI`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 366`** (1 nodes): `FollowRouteDependencies`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 367`** (1 nodes): `ProfileRouteDependencies`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 368`** (1 nodes): `UserAdminRouteDeps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 369`** (1 nodes): `UserRouteDependencies`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 370`** (2 nodes): `GetProblemSchema`, `GetProblemsSchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 371`** (2 nodes): `CreateCompanyInput`, `createCompanySchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 372`** (2 nodes): `CreateSystemDesignTopicInput`, `createSystemDesignTopicSchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 374`** (1 nodes): `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 375`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 381`** (1 nodes): `PUBLIC_CONFIG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 383`** (1 nodes): `repositoriesRegistry`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 385`** (1 nodes): `users`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 403`** (1 nodes): `SyncUserSchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 404`** (1 nodes): `eslintConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 405`** (1 nodes): `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 406`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button` connect `Community 8` to `Community 33`, `Community 2`, `Community 5`, `Community 14`, `Community 13`, `Community 26`, `Community 9`, `Community 7`, `Community 49`, `Community 110`, `Community 96`, `Community 25`, `Community 134`, `Community 24`, `Community 30`, `Community 10`, `Community 17`, `Community 190`, `Community 22`, `Community 11`, `Community 58`, `Community 16`, `Community 117`, `Community 76`, `Community 12`, `Community 42`, `Community 98`, `Community 44`, `Community 78`, `Community 34`, `Community 165`, `Community 55`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `createLogger()` connect `Community 3` to `Community 153`, `Community 106`, `Community 64`, `Community 107`, `Community 4`, `Community 0`, `Community 1`, `Community 21`, `Community 56`, `Community 28`, `Community 230`, `Community 51`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `ICradle` connect `Community 0` to `Community 210`, `Community 3`, `Community 153`, `Community 64`, `Community 65`, `Community 107`, `Community 4`, `Community 1`, `Community 131`, `Community 160`, `Community 23`, `Community 28`, `Community 21`, `Community 116`, `Community 139`, `Community 193`, `Community 230`, `Community 51`, `Community 122`, `Community 124`, `Community 176`, `Community 268`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **What connects `nextConfig`, `config`, `geistSans` to the rest of the system?**
  _955 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03379360465116279 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.037425742574257424 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05586477015048444 - nodes in this community are weakly interconnected._
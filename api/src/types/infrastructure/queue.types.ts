/**
 * Queue Job Type Definitions
 * Defines the structure of jobs flowing through BullMQ
 */

/**
 * Job data for code submission evaluation
 * Passed to the worker processor for async evaluation
 */
export interface SubmissionEvaluationJob {
  /**
   * MongoDB submission document ID
   * Used to fetch and update submission in MongoDB
   */
  submissionId: string

  /**
   * MongoDB problem document ID
   * Used to fetch problem details and test cases
   */
  problemId: string

  /**
   * Programming language identifier
   * Example: 'javascript', 'python', 'cpp', etc.
   */
  languageId: string

  /**
   * User's submitted source code
   * The code to be evaluated by Groq AI
   */
  sourceCode: string

  /**
   * Clerk user ID
   * For tracking and logging purposes
   */
  userId: string

  /**
   * Attempt count for retry tracking
   * Incremented by worker on backoff
   */
  attemptCount?: number

  /**
   * Timestamp when job was initially created
   * For monitoring and debugging
   */
  createdAt?: number

  /**
   * Optional Arena Match ID
   * If present, the worker will update the arena match state
   */
  arenaMatchId?: string

  /**
   * Optional Clerk User ID for Arena matching
   */
  clerkId?: string

  /**
   * Optional Request ID for end-to-end tracing
   */
  requestId?: string
}


/**
 * Result of a successful job completion
 * Returned by worker after evaluation
 */
export interface SubmissionEvaluationResult {
  /**
   * Final verdict on submission
   * ACCEPTED: All tests passed
   * WRONG_ANSWER: Some tests failed
   * COMPILATION_ERROR: Code doesn't compile
   * RUNTIME_ERROR: Code crashes during execution
   * TLE: Time limit exceeded
   * SYSTEM_ERROR: Unexpected server error
   */
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'TLE' | 'SYSTEM_ERROR'

  /**
   * Detailed test results
   * Array of per-test evaluations
   */
  tests: TestResult[]

  /**
   * Raw LLM response for debugging
   */
  rawLlmResponse?: unknown

  /**
   * Whether result was served from cache
   */
  cached?: boolean

  /**
   * Execution time in seconds
   */
  executionTime?: number

  /**
   * Error message if evaluation failed
   */
  error?: string
}

/**
 * Individual test case result
 */
export interface TestResult {
  /**
   * Test case index (0-based)
   */
  index: number

  /**
   * Test input
   */
  input: string

  /**
   * Expected output
   */
  expected_output: string

  /**
   * Actual output from code execution
   */
  stdout: string | null

  /**
   * Standard error output
   */
  stderr: string | null

  /**
   * Compilation errors if any
   */
  compile_output: string | null

  /**
   * Additional message from evaluator
   */
  message: string | null

  /**
   * Test verdict
   */
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'TLE' | 'SYSTEM_ERROR'

  /**
   * Status with numeric ID for database
   */
  rawStatus: {
    id: number
    description: string
  }

  /**
   * Execution time in milliseconds
   */
  time: string | null

  /**
   * Memory used in kilobytes
   */
  memory?: number
}

/**
 * Job failure event data
 * Used for error handling and logging
 */
export interface JobFailureEvent {
  /**
   * Job ID from BullMQ
   */
  jobId: string | number | undefined

  /**
   * Number of attempts made
   */
  attemptsMade?: number

  /**
   * Error that caused failure
   */
  error: Error

  /**
   * Whether it's a 429 rate limit error
   */
  isRateLimitError?: boolean

  /**
   * Whether it's a network error
   */
  isNetworkError?: boolean
}

/**
 * Queue health status
 */
export interface QueueHealthStatus {
  /**
   * Overall queue health
   */
  healthy: boolean

  /**
   * Number of pending jobs
   */
  pendingCount: number

  /**
   * Number of active jobs
   */
  activeCount: number

  /**
   * Number of failed jobs
   */
  failedCount: number

  /**
   * Number of completed jobs
   */
  completedCount: number

  /**
   * Timestamp of health check
   */
  checkedAt: Date
}

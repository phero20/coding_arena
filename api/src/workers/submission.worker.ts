import { Worker, WorkerOptions } from 'bullmq'
import pino from 'pino'
import { submissionQueue } from '../libs/queue'
import type { SubmissionEvaluationJob, SubmissionEvaluationResult, JobFailureEvent } from '../types/queue.types'
import { SubmissionRepository } from '../repositories/submission.repository'
import { ProblemTestRepository } from '../repositories/problem-test.repository'
import { ProblemRepository } from '../repositories/problem.repository'
import { AiCodeJudgeService } from '../services/ai-code-judge.service'
import { GroqLlmService } from '../services/groq-llm.service'
import { ProblemCache } from '../cache/problem.cache'
import { ProblemService } from '../services/problem.service'
import { AiJudgeCache } from '../cache/ai-judge.cache'

/**
 * Logger for worker operations
 */
const logger = pino({
  name: 'submission-worker',
  level: process.env.LOG_LEVEL || 'info',
})

/**
 * Worker configuration
 * Processes submission evaluation jobs from the queue
 */
const workerOptions: WorkerOptions = {
  connection: {
    host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname || 'localhost',
    port: parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port || '6379'),
  },
  concurrency: 1, // Process 1 job at a time to respect Groq rate limits
}

/**
 * Submission Evaluation Worker
 * Processes async code evaluation jobs
 * 
 * Flow:
 * 1. Receives job from queue with submission data
 * 2. Calls AI code judge service (Groq)
 * 3. Updates submission status in MongoDB
 * 4. Completes or retries on failure
 */
const submissionWorker = new Worker('submission-evaluation', processSubmissionJob, workerOptions)

/**
 * Initialize services for worker
 * These are used in the job processor
 */
const submissionRepository = new SubmissionRepository()
const problemRepository = new ProblemRepository()
const problemTestRepository = new ProblemTestRepository()
const groqLlmService = new GroqLlmService()
const problemService = new ProblemService(problemRepository)
const problemCache = new ProblemCache(problemService)
const aiCodeJudgeService = new AiCodeJudgeService(groqLlmService, problemCache as any)
const aiJudgeCache = new AiJudgeCache(aiCodeJudgeService)

/**
 * Main job processor function with Steps 4.1, 4.2, 4.3
 * Called for each job in the queue
 * 
 * STEP 4.1: Core job processing logic
 * - Get job data
 * - Call AiCodeJudgeService
 * - Get test results
 * - Update MongoDB submission
 * 
 * STEP 4.2: Error handling
 * - Try-catch around Groq call
 * - Mark submission as SYSTEM_ERROR on failure
 * - Log errors for debugging
 * 
 * STEP 4.3: Retry logic
 * - Max 3 attempts (configured in queue.ts)
 * - Exponential backoff: 1s, 2s, 4s
 * - Special handling for 429 (rate limit) errors
 * 
 * @param job - BullMQ job object containing submission data
 * @returns Evaluation result or throws error for retry
 */
async function processSubmissionJob(
  job: any
): Promise<SubmissionEvaluationResult> {
  const jobData: SubmissionEvaluationJob = job.data
  const requestStartTime = Date.now()

  logger.info(
    {
      jobId: job.id,
      submissionId: jobData.submissionId,
      problemId: jobData.problemId,
      userId: jobData.userId,
      attempt: job.attemptsMade || 1,
    },
    'Starting submission evaluation'
  )

  try {
    // ========================================
    // STEP 4.1: CORE JOB PROCESSING LOGIC
    // ========================================

    // 1. Fetch problem details and test cases (both public AND private)
    const problemTests = await problemTestRepository.findAllByProblem(
      jobData.problemId,
    )

    if (!problemTests || problemTests.length === 0) {
      throw new Error(`No test cases found for problem ${jobData.problemId}`)
    }

    // Combine public + private test cases for evaluation
    const allTestCases: any[] = []
    let testIndex = 0
    
    // Add public test cases first
    const publicTestsData = problemTests.find((pt: any) => pt.type === 'public')
    if (publicTestsData?.cases) {
      publicTestsData.cases.forEach((testCase: any) => {
        allTestCases.push({
          index: testIndex++,
          input: testCase.input,
          expected_output: testCase.expected_output,
        })
      })
    }

    // Add private test cases
    const privateTestsData = problemTests.find((pt: any) => pt.type === 'hidden')
    if (privateTestsData?.cases) {
      privateTestsData.cases.forEach((testCase: any) => {
        allTestCases.push({
          index: testIndex++,
          input: testCase.input,
          expected_output: testCase.expected_output,
        })
      })
    }

    if (allTestCases.length === 0) {
      throw new Error('No test cases available for evaluation')
    }

    logger.debug(
      {
        submissionId: jobData.submissionId,
        publicTests: publicTestsData?.cases?.length || 0,
        hiddenTests: privateTestsData?.cases?.length || 0,
        totalTests: allTestCases.length,
      },
      'Test cases loaded (public + hidden)'
    )

    // 2. Call AiCodeJudgeService with caching (run all test cases)
    const evaluationResult = await aiJudgeCache.runSamples({
      problemId: jobData.problemId,
      languageId: jobData.languageId,
      languageName: jobData.languageId,
      sourceCode: jobData.sourceCode,
      tests: allTestCases,
    })

    // 3. Parse results
    let finalStatus = evaluationResult.overallStatus
    // Ensure status is not PENDING (worker should only return final verdicts)
    if (finalStatus === 'PENDING') {
      finalStatus = 'SYSTEM_ERROR'
    }
    // Map execution test results to queue test result type
    const testResults = evaluationResult.tests.map((t: any) => ({
      index: t.index,
      input: t.input,
      expected_output: t.expected_output,
      stdout: t.stdout ?? null,
      stderr: t.stderr ?? null,
      compile_output: t.compile_output ?? null,
      message: t.message ?? null,
      status: t.status,
      rawStatus: {
        id: 0,
        description: 'AI Evaluation',
      },
      time: t.time ?? null,
      memory: t.memory,
    }))

    logger.info(
      {
        submissionId: jobData.submissionId,
        status: finalStatus,
        testsPassed: testResults.filter((t: any) => t.status === 'ACCEPTED').length,
        totalTests: testResults.length,
      },
      'Evaluation completed by Groq'
    )

    // 4. Update submission in MongoDB with results
    await submissionRepository.updateSubmissionStatus({
      id: jobData.submissionId,
      status: finalStatus,
      details: {
        tests: testResults,
        evaluatedAt: new Date().toISOString(),
        evaluationDuration: Date.now() - requestStartTime,
      },
    })

    logger.info(
      {
        jobId: job.id,
        submissionId: jobData.submissionId,
        status: finalStatus,
        duration: Date.now() - requestStartTime,
      },
      'Submission updated in database'
    )

    // 5. Return result
    const result: SubmissionEvaluationResult = {
      status: finalStatus as 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'TLE' | 'SYSTEM_ERROR',
      tests: testResults,
      executionTime: Date.now() - requestStartTime,
      cached: evaluationResult.cached,
    }

    return result

    // ========================================
    // STEP 4.2: ERROR HANDLING
    // ========================================
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error'
    const isRateLimitError = errorMessage.includes('429')
    const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')

    logger.error(
      {
        jobId: job.id,
        submissionId: jobData.submissionId,
        error: errorMessage,
        attempt: job.attemptsMade || 1,
        maxAttempts: job.opts?.attempts,
        isRateLimitError,
        isTimeoutError,
        duration: Date.now() - requestStartTime,
      },
      'Submission evaluation failed'
    )

    // ========================================
    // STEP 4.3: RETRY LOGIC
    // ========================================

    const attemptNumber = job.attemptsMade || 1
    const maxAttempts = job.opts?.attempts || 3

    // Check if this is the last attempt
    if (attemptNumber >= maxAttempts) {
      logger.error(
        {
          submissionId: jobData.submissionId,
          attempts: attemptNumber,
          error: errorMessage,
        },
        'Max retry attempts reached, marking submission as SYSTEM_ERROR'
      )

      // Mark submission as SYSTEM_ERROR since all retries exhausted
      try {
        await submissionRepository.updateSubmissionStatus({
          id: jobData.submissionId,
          status: 'SYSTEM_ERROR',
          details: {
            error: errorMessage,
            failedAfterAttempts: attemptNumber,
            evaluatedAt: new Date().toISOString(),
          },
        })
      } catch (dbErr) {
        logger.error(
          { submissionId: jobData.submissionId, dbErr },
          'Failed to update submission status to SYSTEM_ERROR'
        )
      }
    } else {
      // Still have retries left, log retry attempt
      logger.warn(
        {
          submissionId: jobData.submissionId,
          attempt: attemptNumber,
          nextAttempt: attemptNumber + 1,
          maxAttempts,
        },
        'Retrying submission evaluation'
      )
    }

    // For rate limit errors (429), add custom backoff
    // BullMQ already has exponential backoff (1s, 2s, 4s)
    if (isRateLimitError) {
      logger.warn(
        { submissionId: jobData.submissionId },
        'Rate limited by Groq API - will retry with backoff'
      )
    }

    // Throw to trigger BullMQ retry logic
    throw error
  }
}

/**
 * Worker event listeners for error handling
 */

submissionWorker.on('error', (err: Error) => {
  logger.error({ err }, 'Worker error occurred')
})

/**
 * Queue event listeners using type casting for event monitoring
 */
;(submissionQueue as any).on('failed', (job: any, err: Error) => {
  const failureEvent: JobFailureEvent = {
    jobId: job?.id,
    attemptsMade: job?.attemptsMade,
    error: err,
    isRateLimitError: err.message?.includes('429'),
    isNetworkError: err.message?.includes('ECONNREFUSED') || err.message?.includes('timeout'),
  }

  logger.error(failureEvent, 'Job failed after all retry attempts')
})

;(submissionQueue as any).on('stalled', (jobId: string) => {
  logger.warn({ jobId }, 'Job stalled - taking longer than expected')
})

;(submissionQueue as any).on('completed', (job: any) => {
  logger.info(
    {
      jobId: job.id,
      duration: job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : 0,
    },
    'Job completed successfully'
  )
})

/**
 * Worker lifecycle events
 */

// Ready event - worker is initialized and ready to process jobs
;(submissionWorker as any).once('ready', () => {
  logger.info('Submission worker ready and listening for jobs')
})

/**
 * Graceful shutdown handler
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down worker gracefully...')
  await submissionWorker.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down worker gracefully...')
  await submissionWorker.close()
  process.exit(0)
})

/**
 * Export worker instance for control
 */
export { submissionWorker }

/**
 * Default export for auto-import
 */
export default submissionWorker

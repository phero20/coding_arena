import { Worker, WorkerOptions } from 'bullmq'
import pino from 'pino'
import { submissionQueue } from '../libs/queue'
import type { SubmissionEvaluationJob, SubmissionEvaluationResult, JobFailureEvent } from '../types/queue.types'

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
  settings: {
    lockDuration: 30000, // Lock job for 30 seconds
    lockRenewTime: 15000, // Renew lock every 15 seconds
  },
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
 * Main job processor function
 * Called for each job in the queue
 * 
 * @param job - BullMQ job object containing submission data
 * @returns Evaluation result or throws error for retry
 */
async function processSubmissionJob(
  job: any
): Promise<SubmissionEvaluationResult> {
  const jobData: SubmissionEvaluationJob = job.data

  logger.info(
    {
      jobId: job.id,
      submissionId: jobData.submissionId,
      problemId: jobData.problemId,
      userId: jobData.userId,
    },
    'Starting submission evaluation'
  )

  try {
    // TODO: Implement in Step 4.1
    // 1. Fetch problem details and test cases
    // 2. Call AiCodeJudgeService.runSamples()
    // 3. Parse results
    // 4. Update submission in MongoDB
    // 5. Return result

    const result: SubmissionEvaluationResult = {
      status: 'SYSTEM_ERROR',
      tests: [],
      error: 'Worker processor not implemented yet',
    }

    logger.info(
      {
        jobId: job.id,
        submissionId: jobData.submissionId,
        status: result.status,
      },
      'Submission evaluation completed'
    )

    return result
  } catch (error) {
    logger.error(
      {
        jobId: job.id,
        submissionId: jobData.submissionId,
        error,
        attempt: job.attemptsMade,
        maxAttempts: job.opts?.attempts,
      },
      'Submission evaluation failed'
    )

    throw error // BullMQ will retry based on config
  }
}

/**
 * Worker event listeners
 */

submissionWorker.on('error', (err) => {
  logger.error({ err }, 'Worker error')
})

submissionWorker.on('failed', (job, err) => {
  const failureEvent: JobFailureEvent = {
    jobId: job?.id,
    attemptsMade: job?.attemptsMade,
    error: err,
    isRateLimitError: err.message?.includes('429'),
    isNetworkError: err.message?.includes('ECONNREFUSED') || err.message?.includes('timeout'),
  }

  logger.error(failureEvent, 'Job failed after all retry attempts')
})

submissionWorker.on('stalled', (jobId) => {
  logger.warn({ jobId }, 'Job stalled - taking longer than expected')
})

submissionWorker.on('completed', (job) => {
  logger.info(
    {
      jobId: job.id,
      duration: job.finishedOn ? job.finishedOn - job.processedOn : 0,
    },
    'Job completed'
  )
})

/**
 * Worker lifecycle events
 */

submissionWorker.on('ready', () => {
  logger.info('Submission worker ready and listening for jobs')
})

submissionWorker.on('close', () => {
  logger.info('Submission worker closed')
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

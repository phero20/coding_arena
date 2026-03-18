import { Queue } from 'bullmq'
import { config } from '../configs/env'
import pino from 'pino'

/**
 * Logger for queue operations
 */
const logger = pino({
  name: 'submission-queue',
  level: process.env.LOG_LEVEL || 'info',
})

/**
 * Redis connection configuration for BullMQ
 * Uses the same Redis instance as the main app
 */
const redisConnection = {
  host: new URL(config.redisUrl || 'redis://localhost:6379').hostname || 'localhost',
  port: parseInt(new URL(config.redisUrl || 'redis://localhost:6379').port || '6379'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: false,
}

/**
 * Submission Evaluation Queue
 * - Handles async evaluation of code submissions
 * - Processes jobs sequentially (concurrency: 1)
 * - Respects Groq API rate limits
 */
export const submissionQueue = new Queue('submission-evaluation', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours (for debugging)
    },
  },
})

/**
 * Event listeners for queue monitoring
 * Using type casting to handle strict BullMQ event types
 */

submissionQueue.on('error', (err) => {
  logger.error({ err }, 'Queue error')
})

;(submissionQueue as any).on('failed', (job: any, err: Error) => {
  logger.error(
    { jobId: job?.id, attempt: job?.attemptsMade, err },
    'Job failed'
  )
})

;(submissionQueue as any).on('stalled', (jobId: string) => {
  logger.warn({ jobId }, 'Job stalled (taking too long)')
})

;(submissionQueue as any).on('completed', (job: any) => {
  logger.info({ jobId: job.id }, 'Job completed successfully')
})

/**
 * Health check for queue
 */
export async function isQueueHealthy(): Promise<boolean> {
  try {
    const connection = submissionQueue.client
    if (!connection) return false
    await (connection as any).ping()
    return true
  } catch (err) {
    logger.error({ err }, 'Queue health check failed')
    return false
  }
}

export default submissionQueue
import type { Hono } from 'hono'
import type { SubmissionController } from '../controllers/submission.controller'
import { rateLimit } from '../middlewares/rate-limit.middleware'

export interface SubmissionRoutesDeps {
  authMiddleware: any
  authorizationMiddleware: any
  submissionController: SubmissionController
}

export const registerSubmissionRoutes = (
  app: Hono,
  deps: SubmissionRoutesDeps,
) => {
  const { authMiddleware, submissionController } = deps

  app.use('/submissions/*', (c, next) => authMiddleware.handle(c, next))

  // Code Play/Run: 10 per minute
  app.post(
    '/submissions/run',
    rateLimit({ windowMs: 60000, max: 10, keyPrefix: 'rl:run' }),
    (c) => submissionController.run(c),
  )

  // Final Submission: 5 per minute
  app.post(
    '/submissions/submit',
    rateLimit({ windowMs: 60000, max: 5, keyPrefix: 'rl:submit' }),
    (c) => submissionController.submit(c),
  )

  // Check submission status - no rate limit (frequent polling expected)
  app.get('/submissions/:submissionId', (c) =>
    submissionController.getSubmissionStatus(c),
  )

  app.get('/submissions/problem/:problemId', (c) =>
    submissionController.getUserSubmissions(c),
  )
}


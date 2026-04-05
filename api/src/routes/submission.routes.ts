import type { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { runSubmissionSchema, submitSubmissionSchema } from '../validators/submission.validator'
import type { SubmissionController } from '../controllers/submission.controller'
import { rateLimit } from '../middlewares/rate-limit.middleware'
import type { AuthMiddleware } from '../middlewares/auth.middleware'
import type { AuthorizationMiddleware } from '../middlewares/authorization.middleware'
import type { AppEnv } from '../types/hono.types'

export interface SubmissionRoutesDeps {
  authMiddleware: AuthMiddleware
  authorizationMiddleware: AuthorizationMiddleware
  submissionController: SubmissionController
}

export const registerSubmissionRoutes = (
  app: Hono<AppEnv>,
  deps: SubmissionRoutesDeps,
) => {
  const { authMiddleware, submissionController } = deps

  app.use('/submissions/*', (c, next) => authMiddleware.handle(c, next))

  // Code Play/Run: 10 per minute
  app.post(
    '/submissions/run',
    rateLimit({ windowMs: 60000, max: 10, keyPrefix: 'rl:run' }),
    zValidator('json', runSubmissionSchema),
    (c) => submissionController.run(c),
  )

  // Final Submission: 5 per minute
  app.post(
    '/submissions/submit',
    rateLimit({ windowMs: 60000, max: 5, keyPrefix: 'rl:submit' }),
    zValidator('json', submitSubmissionSchema),
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


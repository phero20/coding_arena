import type { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { runSubmissionSchema, submitSubmissionSchema } from '../validators/submission.validator'
import { SubmissionIdParamSchema, ProblemIdParamSchema } from '../validators/common.validator'
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
  // Controllers now use context-free handlers via the .action() adapter
  
  app.post(
    '/submissions/run',
    rateLimit({ windowMs: 60000, max: 10, keyPrefix: 'rl:run' }),
    zValidator('json', runSubmissionSchema),
    submissionController.action(submissionController.run, { status: 201 }),
  )

  // Final Submission: 5 per minute
  app.post(
    '/submissions/submit',
    rateLimit({ windowMs: 60000, max: 5, keyPrefix: 'rl:submit' }),
    zValidator('json', submitSubmissionSchema),
    submissionController.action(submissionController.submit, { status: 201 }),
  )

  // Check submission status - no rate limit (frequent polling expected)
  app.get('/submissions/:submissionId',
    zValidator('param', SubmissionIdParamSchema),
    submissionController.action(submissionController.getSubmissionStatus),
  )

  app.get('/submissions/problem/:problemId',
    zValidator('param', ProblemIdParamSchema),
    submissionController.action(submissionController.getUserSubmissions),
  )
}

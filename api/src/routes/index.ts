import { Hono } from 'hono'
import { container } from '../libs/container'
import type { AppEnv } from '../types/hono.types'

import { registerAuthRoutes } from './auth.routes'
import { registerProblemRoutes } from './problem.routes'
import { registerProblemTestRoutes } from './problem-test.routes'
import { registerSubmissionRoutes } from './submission.routes'
import { registerAiProblemRoutes } from './ai-problem.routes'
import { registerArenaRoutes } from './arena.routes'

import { healthRoutes } from './health.routes'

const { controllers, middlewares } = container

export const registerRoutes = (app: Hono<AppEnv>) => {
  app.get('/', (c) => c.text('OK'))
  
  // Health monitoring
  app.route('/health', healthRoutes)
  const v1 = new Hono<AppEnv>()

  const authApp = new Hono<AppEnv>()
  registerAuthRoutes(authApp, {
    authMiddleware: middlewares.authMiddleware,
    authorizationMiddleware: middlewares.authorizationMiddleware,
    authController: controllers.authController,
    clerkWebhookController: controllers.clerkWebhookController,
  })
  v1.route('/auth', authApp)

  registerProblemRoutes(v1, {
    problemController: controllers.problemController,
    authMiddleware: middlewares.authMiddleware,
    authorizationMiddleware: middlewares.authorizationMiddleware,
  })

  registerProblemTestRoutes(v1, {
    problemTestController: controllers.problemTestController,
    authMiddleware: middlewares.authMiddleware,
    authorizationMiddleware: middlewares.authorizationMiddleware,
  })

  registerSubmissionRoutes(v1, {
    authMiddleware: middlewares.authMiddleware,
    authorizationMiddleware: middlewares.authorizationMiddleware,
    submissionController: controllers.submissionController,
  })

  registerAiProblemRoutes(v1, {
    aiProblemController: controllers.aiProblemController,
  })

  registerArenaRoutes(v1, {
    arenaController: controllers.arenaController,
    authMiddleware: middlewares.authMiddleware,
  })


  app.route('/api/v1', v1)
}


import { Hono } from 'hono'
import { container } from '../lib/container'
import { registerAuthRoutes } from './auth.routes'
import { registerProblemRoutes } from './problem.routes'
import { registerProblemTestRoutes } from './problem-test.routes'
import { registerSubmissionRoutes } from './submission.routes'
import { registerAiProblemRoutes } from './ai-problem.routes'
import { registerArenaRoutes } from './arena.routes'

const { controllers, middlewares, repositories } = container

export const registerRoutes = (app: Hono) => {
  app.get('/', (c) => c.text('OK'))
  
  const v1 = new Hono()

  const authApp = new Hono()
  registerAuthRoutes(authApp, {
    authMiddleware: middlewares.authMiddleware,
    authorizationMiddleware: middlewares.authorizationMiddleware,
    authController: controllers.authController,
    clerkWebhookController: controllers.clerkWebhookController,
  })
  v1.route('/auth', authApp)

  registerProblemRoutes(v1, {
    problemController: controllers.problemController,
  })

  registerProblemTestRoutes(v1, {
    problemTestController: controllers.problemTestController,
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
    arenaRepository: repositories.arenaRepository,
    userRepository: repositories.userRepository,
    authMiddleware: middlewares.authMiddleware,
  })

  app.route('/api/v1', v1)
}


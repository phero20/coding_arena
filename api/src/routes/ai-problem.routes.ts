import type { Hono } from 'hono'
import type { AiProblemController } from '../controllers/ai-problem.controller'

export interface AiProblemRoutesDeps {
  aiProblemController: AiProblemController
}

export const registerAiProblemRoutes = (app: Hono, deps: AiProblemRoutesDeps) => {
  const { aiProblemController } = deps

  // NOTE: This route is intentionally left unauthenticated for now.
  // Add auth and role-based checks before using in production.
  app.post('/problems/ai-import', (c) => aiProblemController.import(c))
}


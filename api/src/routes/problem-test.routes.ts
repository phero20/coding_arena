import type { Hono } from 'hono'
import type { ProblemTestController } from '../controllers/problem-test.controller'

export interface ProblemTestRoutesDeps {
  problemTestController: ProblemTestController
}

export const registerProblemTestRoutes = (
  app: Hono,
  deps: ProblemTestRoutesDeps,
) => {
  const { problemTestController } = deps

  app.post('/problems/:problem_id/tests', (c) =>
    problemTestController.upsertTests(c),
  )

  app.get('/problems/:problem_id/tests', (c) =>
    problemTestController.getTestsForProblem(c),
  )

  app.get('/problems/:problem_id/tests/:type', (c) =>
    problemTestController.getTestsForProblemAndType(c),
  )
}


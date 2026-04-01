import { authService, arenaService, aiProblemService, submissionService } from "./service.container";
import { problemCache, problemTestCache, executionService } from "./cache.container";
import { AuthController } from "../../controllers/auth.controller";
import { ClerkWebhookController } from "../../controllers/clerk-webhook.controller";
import { ProblemController } from "../../controllers/problem.controller";
import { ProblemTestController } from "../../controllers/problem-test.controller";
import { SubmissionController } from "../../controllers/submission.controller";
import { AiProblemController } from "../../controllers/ai-problem.controller";
import { ArenaController } from "../../controllers/arena.controller";
import { submissionQueue } from "../queue";

export const authController = new AuthController();
export const clerkWebhookController = new ClerkWebhookController(authService);
export const problemController = new ProblemController(problemCache);
export const problemTestController = new ProblemTestController(problemTestCache);
export const arenaController = new ArenaController(arenaService);

export const aiProblemController = new AiProblemController(
  aiProblemService,
  problemCache,
  problemTestCache
);

export const submissionController = new SubmissionController(
  submissionService,
  executionService,
  submissionQueue
);

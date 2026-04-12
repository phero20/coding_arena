import { userRepository, problemRepository, problemTestRepository, submissionRepository, arenaRepository, arenaMatchRepository, arenaSubmissionRepository } from "./repo.container";
import { AuthService } from "../../services/auth.service";
import { ProblemService } from "../../services/problem.service";
import { ProblemTestService } from "../../services/problem-test.service";
import { SubmissionService } from "../../services/submission.service";
import { GroqLlmService } from "../../services/groq-llm.service";
import { AiProblemService } from "../../services/ai-problem.service";
import { ArenaService } from "../../services/arena.service";

export const authService = new AuthService(userRepository);
export const problemService = new ProblemService(problemRepository);
export const problemTestService = new ProblemTestService(problemTestRepository);
export const submissionService = new SubmissionService(
  submissionRepository,
  arenaMatchRepository,
  arenaRepository,
  arenaSubmissionRepository
);
export const groqLlmService = new GroqLlmService();
export const aiProblemService = new AiProblemService();

export const arenaService = new ArenaService(
  arenaRepository,
  userRepository,
  arenaMatchRepository,
  arenaSubmissionRepository
);

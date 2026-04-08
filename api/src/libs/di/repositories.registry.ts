import { asClass } from "awilix";
import { UserRepository } from "../../repositories/user/user.repository";
import { ProblemRepository } from "../../repositories/problems/problem.repository";
import { ProblemTestRepository } from "../../repositories/problems/problem-test.repository";
import { SubmissionRepository } from "../../repositories/submissions/submission.repository";
import { ArenaRepository } from "../../repositories/arena/arena.repository";
import { ArenaMatchRepository } from "../../repositories/arena/arena-match.repository";
import { ArenaSubmissionRepository } from "../../repositories/arena/arena-submission.repository";
import { StatsRepository } from "../../repositories/stats/stats.repository";

/**
 * Repository layer registrations.
 * This module manages the persistence layer for the entire platform.
 */
export const repositoriesRegistry = {
  userRepository: asClass(UserRepository).singleton(),
  problemRepository: asClass(ProblemRepository).singleton(),
  problemTestRepository: asClass(ProblemTestRepository).singleton(),
  submissionRepository: asClass(SubmissionRepository).singleton(),
  arenaRepository: asClass(ArenaRepository).singleton(),
  arenaMatchRepository: asClass(ArenaMatchRepository).singleton(),
  arenaSubmissionRepository: asClass(ArenaSubmissionRepository).singleton(),
  statsRepository: asClass(StatsRepository).singleton(),
};

import { asClass } from "awilix";
import { UserRepository } from "../../repositories/user/user.repository";
import { ProblemRepository } from "../../repositories/problems/problem.repository";
import { ProblemTestRepository } from "../../repositories/problems/problem-test.repository";
import { SubmissionRepository } from "../../repositories/submissions/submission.repository";
import { ArenaRepository } from "../../repositories/arena/arena.repository";
import { ArenaMatchRepository } from "../../repositories/arena/arena-match.repository";
import { ArenaSubmissionRepository } from "../../repositories/arena/arena-submission.repository";
import { StatsRepository } from "../../repositories/stats/stats.repository";
import { FollowRepository } from "../../repositories/user/follow.repository";
import { ContestRepository } from "../../repositories/contest/contest.repository";
import { TaxonomyRepository } from "../../repositories/taxonomy/taxonomy.repository";
import { SolutionRepository } from "../../repositories/solutions/solution.repository";
import { WorkspaceRepository } from "../../repositories/workspace/workspace.repository";
import { ChatRepository } from "../../repositories/chat/chat.repository";
import { AcademyRepository } from "../../repositories/academy/academy.repository";

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
  followRepository: asClass(FollowRepository).singleton(),
  contestRepository: asClass(ContestRepository).singleton(),
  taxonomyRepository: asClass(TaxonomyRepository).singleton(),
  solutionRepository: asClass(SolutionRepository).singleton(),
  workspaceRepository: asClass(WorkspaceRepository).singleton(),
  chatRepository: asClass(ChatRepository).singleton(),
  academyRepository: asClass(AcademyRepository).singleton(),
};

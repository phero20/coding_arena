import { UserRepository } from "../../repositories/user.repository";
import { ProblemRepository } from "../../repositories/problem.repository";
import { ProblemTestRepository } from "../../repositories/problem-test.repository";
import { SubmissionRepository } from "../../repositories/submission.repository";
import { ArenaMatchRepository } from "../../repositories/arena-match.repository";
import { ArenaSubmissionRepository } from "../../repositories/arena-submission.repository";
import { ArenaRepository } from "../../repositories/arena.repository";

export const userRepository = new UserRepository();
export const problemRepository = new ProblemRepository();
export const problemTestRepository = new ProblemTestRepository();
export const submissionRepository = new SubmissionRepository();
export const arenaRepository = new ArenaRepository();
export const arenaMatchRepository = new ArenaMatchRepository();
export const arenaSubmissionRepository = new ArenaSubmissionRepository();

import { UserAdminRepository } from "../../repositories/user/user.admin.repository";
import { AppError } from "../../utils/app-error";

export class UserAdminService {
  constructor(private readonly deps: { 
    userAdminRepository: UserAdminRepository;
  }) {}

  async getAllUsers() {
    return this.deps.userAdminRepository.findAll();
  }

  async getCounts() {
    return this.deps.userAdminRepository.getCounts();
  }

  async createUser(data: any) {
    return this.deps.userAdminRepository.create(data);
  }

  async updateUser(id: string, data: any) {
    const updated = await this.deps.userAdminRepository.update(id, data);
    if (!updated) {
      throw AppError.notFound(`User with id '${id}' not found`);
    }
    return updated;
  }

  async deleteUser(id: string) {
    const deleted = await this.deps.userAdminRepository.delete(id);
    if (!deleted) {
      throw AppError.notFound(`User with id '${id}' not found`);
    }
    return deleted;
  }

  async getUserStats(userId: string) {
    const stats = await this.deps.userAdminRepository.findStatsByUserId(userId);
    return stats;
  }

  async createUserStats(data: any) {
    return this.deps.userAdminRepository.createStats(data);
  }

  async updateUserStats(userId: string, data: any) {
    const updated = await this.deps.userAdminRepository.updateStats(userId, data);
    if (!updated) {
      throw AppError.notFound(`User stats for user '${userId}' not found`);
    }
    return updated;
  }

  async deleteUserStats(userId: string) {
    const deleted = await this.deps.userAdminRepository.deleteStats(userId);
    if (!deleted) {
      throw AppError.notFound(`User stats for user '${userId}' not found`);
    }
    return deleted;
  }

  async getUserActivity(userId: string) {
    return this.deps.userAdminRepository.findActivityByUserId(userId);
  }

  async createUserActivity(data: any) {
    return this.deps.userAdminRepository.createActivity(data);
  }

  async updateUserActivity(userId: string, date: string, data: any) {
    const updated = await this.deps.userAdminRepository.updateActivity(userId, date, data);
    if (!updated) {
      throw AppError.notFound(`User activity for user '${userId}' on '${date}' not found`);
    }
    return updated;
  }

  async deleteUserActivity(userId: string, date: string) {
    const deleted = await this.deps.userAdminRepository.deleteActivity(userId, date);
    if (!deleted) {
      throw AppError.notFound(`User activity for user '${userId}' on '${date}' not found`);
    }
    return deleted;
  }

  async getUserSolvedProblems(userId: string) {
    return this.deps.userAdminRepository.findSolvedProblemsByUserId(userId);
  }

  async createUserSolvedProblem(data: any) {
    return this.deps.userAdminRepository.createSolvedProblem(data);
  }

  async deleteUserSolvedProblem(userId: string, problemId: string) {
    const deleted = await this.deps.userAdminRepository.deleteSolvedProblem(userId, problemId);
    if (!deleted) {
      throw AppError.notFound(`Solved problem '${problemId}' for user '${userId}' not found`);
    }
    return deleted;
  }

  async getUserAcademyExercises(userId: string) {
    return this.deps.userAdminRepository.findAcademyExercisesByUserId(userId);
  }

  async createUserAcademyExercise(data: any) {
    return this.deps.userAdminRepository.createAcademyExercise(data);
  }

  async deleteUserAcademyExercise(userId: string, trackSlug: string, exerciseSlug: string) {
    const deleted = await this.deps.userAdminRepository.deleteAcademyExercise(userId, trackSlug, exerciseSlug);
    if (!deleted) {
      throw AppError.notFound(`Academy exercise '${exerciseSlug}' in track '${trackSlug}' for user '${userId}' not found`);
    }
    return deleted;
  }

  async getUserSolvedLanguages(userId: string) {
    return this.deps.userAdminRepository.findSolvedLanguagesByUserId(userId);
  }

  async createUserSolvedLanguage(data: any) {
    return this.deps.userAdminRepository.createSolvedLanguage(data);
  }

  async deleteUserSolvedLanguage(userId: string, problemId: string, languageId: string) {
    const deleted = await this.deps.userAdminRepository.deleteSolvedLanguage(userId, problemId, languageId);
    if (!deleted) {
      throw AppError.notFound(`Solved language '${languageId}' for problem '${problemId}' for user '${userId}' not found`);
    }
    return deleted;
  }

  async getUserSolutions(userId: string) {
    return this.deps.userAdminRepository.findSolutionsByUserId(userId);
  }

  async deleteUserSolution(userId: string, solutionId: string) {
    const deleted = await this.deps.userAdminRepository.deleteSolution(userId, solutionId);
    if (!deleted) {
      throw AppError.notFound(`Solution '${solutionId}' for user '${userId}' not found`);
    }
    return deleted;
  }
}

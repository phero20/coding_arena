import { BaseController } from "../base.controller";
import { type UserAdminService } from "../../services/user/user.admin.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";

export class UserAdminController extends BaseController {
  private readonly userAdminService: UserAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.userAdminService = cradle.userAdminService;
  }

  async getAllUsers(_req: ControllerRequest<never, never, never>) {
    return await this.userAdminService.getAllUsers();
  }

  async getCounts(_req: ControllerRequest<never, never, never>) {
    return await this.userAdminService.getCounts();
  }

  async createUser(req: ControllerRequest<any, never, never>) {
    return await this.userAdminService.createUser(req.body);
  }

  async updateUser(req: ControllerRequest<any, { id: string }, never>) {
    return await this.userAdminService.updateUser(req.params.id, req.body);
  }

  async deleteUser(req: ControllerRequest<never, { id: string }, never>) {
    await this.userAdminService.deleteUser(req.params.id);
    return { success: true };
  }

  async getUserStats(req: ControllerRequest<never, { id: string }, never>) {
    return await this.userAdminService.getUserStats(req.params.id);
  }

  async createUserStats(req: ControllerRequest<any, never, never>) {
    return await this.userAdminService.createUserStats(req.body);
  }

  async updateUserStats(req: ControllerRequest<any, { id: string }, never>) {
    return await this.userAdminService.updateUserStats(req.params.id, req.body);
  }

  async deleteUserStats(req: ControllerRequest<never, { id: string }, never>) {
    await this.userAdminService.deleteUserStats(req.params.id);
    return { success: true };
  }

  async getUserActivity(req: ControllerRequest<never, { id: string }, never>) {
    return await this.userAdminService.getUserActivity(req.params.id);
  }

  async createUserActivity(req: ControllerRequest<any, never, never>) {
    return await this.userAdminService.createUserActivity(req.body);
  }

  async updateUserActivity(req: ControllerRequest<any, { id: string; date: string }, never>) {
    return await this.userAdminService.updateUserActivity(req.params.id, req.params.date, req.body);
  }

  async deleteUserActivity(req: ControllerRequest<never, { id: string; date: string }, never>) {
    await this.userAdminService.deleteUserActivity(req.params.id, req.params.date);
    return { success: true };
  }

  async getUserSolvedProblems(req: ControllerRequest<never, { id: string }, never>) {
    return await this.userAdminService.getUserSolvedProblems(req.params.id);
  }

  async createUserSolvedProblem(req: ControllerRequest<any, never, never>) {
    return await this.userAdminService.createUserSolvedProblem(req.body);
  }

  async deleteUserSolvedProblem(req: ControllerRequest<never, { id: string; problemId: string }, never>) {
    await this.userAdminService.deleteUserSolvedProblem(req.params.id, req.params.problemId);
    return { success: true };
  }

  async getUserAcademyExercises(req: ControllerRequest<never, { id: string }, never>) {
    return await this.userAdminService.getUserAcademyExercises(req.params.id);
  }

  async createUserAcademyExercise(req: ControllerRequest<any, never, never>) {
    return await this.userAdminService.createUserAcademyExercise(req.body);
  }

  async deleteUserAcademyExercise(req: ControllerRequest<never, { id: string; trackSlug: string; exerciseSlug: string }, never>) {
    await this.userAdminService.deleteUserAcademyExercise(req.params.id, req.params.trackSlug, req.params.exerciseSlug);
    return { success: true };
  }

  async getUserSolvedLanguages(req: ControllerRequest<never, { id: string }, never>) {
    return await this.userAdminService.getUserSolvedLanguages(req.params.id);
  }

  async createUserSolvedLanguage(req: ControllerRequest<any, never, never>) {
    return await this.userAdminService.createUserSolvedLanguage(req.body);
  }

  async deleteUserSolvedLanguage(req: ControllerRequest<never, { id: string; problemId: string; languageId: string }, never>) {
    await this.userAdminService.deleteUserSolvedLanguage(req.params.id, req.params.problemId, req.params.languageId);
    return { success: true };
  }

  async getUserSolutions(req: ControllerRequest<never, { id: string }, never>) {
    return await this.userAdminService.getUserSolutions(req.params.id);
  }

  async deleteUserSolution(req: ControllerRequest<never, { id: string; solutionId: string }, never>) {
    await this.userAdminService.deleteUserSolution(req.params.id, req.params.solutionId);
    return { success: true };
  }
}

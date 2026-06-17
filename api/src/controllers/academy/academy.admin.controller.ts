import { BaseController } from "../base.controller";
import { type IAcademyAdminService } from "../../services/academy/academy.admin.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import { AppError } from "../../utils/app-error";

export class AcademyAdminController extends BaseController {
  private readonly academyAdminService: IAcademyAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.academyAdminService = cradle.academyAdminService;
  }

  async createTrack(req: ControllerRequest<{ slug: string; data: any }, never, never>) {
    const { slug, data } = req.body;
    return await this.academyAdminService.createTrack(slug, data);
  }

  async updateTrack(
    req: ControllerRequest<{ data: any }, { slug: string }, never>
  ) {
    const { slug } = req.params;
    const { data } = req.body;
    return await this.academyAdminService.updateTrack(slug, data);
  }

  async deleteTrack(req: ControllerRequest<never, { slug: string }, never>) {
    const { slug } = req.params;
    return await this.academyAdminService.deleteTrack(slug);
  }

  async getAllTracks(_req: ControllerRequest<never, never, never>) {
    return await this.academyAdminService.getAllTracks();
  }

  // Configs
  async createConfig(req: ControllerRequest<{ slug: string; data: any }, never, never>) {
    const { slug, data } = req.body;
    return await this.academyAdminService.createConfig(slug, data);
  }

  async updateConfig(
    req: ControllerRequest<{ data: any }, { slug: string }, never>
  ) {
    const { slug } = req.params;
    const { data } = req.body;
    return await this.academyAdminService.updateConfig(slug, data);
  }

  async deleteConfig(req: ControllerRequest<never, { slug: string }, never>) {
    const { slug } = req.params;
    const success = await this.academyAdminService.deleteConfig(slug);
    return { success };
  }

  async getAllConfigs(_req: ControllerRequest<never, never, never>) {
    return await this.academyAdminService.getAllConfigs();
  }

  // Concepts
  async createConcept(req: ControllerRequest<{ conceptSlug: string; data: any }, { trackSlug: string }, never>) {
    const { trackSlug } = req.params;
    const { conceptSlug, data } = req.body;
    return await this.academyAdminService.createConcept(trackSlug, conceptSlug, data);
  }

  async updateConcept(
    req: ControllerRequest<{ data: any }, { trackSlug: string; conceptSlug: string }, never>
  ) {
    const { trackSlug, conceptSlug } = req.params;
    const { data } = req.body;
    return await this.academyAdminService.updateConcept(trackSlug, conceptSlug, data);
  }

  async deleteConcept(req: ControllerRequest<never, { trackSlug: string; conceptSlug: string }, never>) {
    const { trackSlug, conceptSlug } = req.params;
    const success = await this.academyAdminService.deleteConcept(trackSlug, conceptSlug);
    return { success };
  }

  async getConceptsByTrack(req: ControllerRequest<never, { trackSlug: string }, never>) {
    const { trackSlug } = req.params;
    return await this.academyAdminService.getConceptsByTrack(trackSlug);
  }

  // Exercises
  async createExercise(req: ControllerRequest<{ exerciseSlug: string; data: any }, { trackSlug: string }, never>) {
    const { trackSlug } = req.params;
    const { exerciseSlug, data } = req.body;
    return await this.academyAdminService.createExercise(trackSlug, exerciseSlug, data);
  }

  async updateExercise(
    req: ControllerRequest<{ data: any }, { trackSlug: string; exerciseSlug: string }, never>
  ) {
    const { trackSlug, exerciseSlug } = req.params;
    const { data } = req.body;
    return await this.academyAdminService.updateExercise(trackSlug, exerciseSlug, data);
  }

  async deleteExercise(req: ControllerRequest<never, { trackSlug: string; exerciseSlug: string }, never>) {
    const { trackSlug, exerciseSlug } = req.params;
    const success = await this.academyAdminService.deleteExercise(trackSlug, exerciseSlug);
    return { success };
  }

  async getExercisesByTrack(req: ControllerRequest<never, { trackSlug: string }, never>) {
    const { trackSlug } = req.params;
    return await this.academyAdminService.getExercisesByTrack(trackSlug);
  }
}

import { type IAcademyAdminRepository, type AcademyStats } from "../../repositories/academy/academy.admin.repository";
import { AppError } from "../../utils/app-error";

export interface IAcademyAdminService {
  createTrack(slug: string, data: any): Promise<any>;
  updateTrack(slug: string, data: any): Promise<any>;
  deleteTrack(slug: string): Promise<boolean>;
  getAllTracks(): Promise<any[]>;

  createConfig(slug: string, data: any): Promise<any>;
  updateConfig(slug: string, data: any): Promise<any>;
  deleteConfig(slug: string): Promise<boolean>;
  getAllConfigs(): Promise<any[]>;

  createConcept(trackSlug: string, conceptSlug: string, data: any): Promise<any>;
  updateConcept(trackSlug: string, conceptSlug: string, data: any): Promise<any>;
  deleteConcept(trackSlug: string, conceptSlug: string): Promise<boolean>;
  getConceptsByTrack(trackSlug: string): Promise<any[]>;

  createExercise(trackSlug: string, exerciseSlug: string, data: any): Promise<any>;
  updateExercise(trackSlug: string, exerciseSlug: string, data: any): Promise<any>;
  deleteExercise(trackSlug: string, exerciseSlug: string): Promise<boolean>;
  getExercisesByTrack(trackSlug: string): Promise<any[]>;
  getStats(): Promise<AcademyStats>;
}

export class AcademyAdminService implements IAcademyAdminService {
  private readonly academyAdminRepository: IAcademyAdminRepository;

  constructor(opts: { academyAdminRepository: IAcademyAdminRepository }) {
    this.academyAdminRepository = opts.academyAdminRepository;
  }

  async createTrack(slug: string, data: any): Promise<any> {
    try {
      return await this.academyAdminRepository.createTrack(slug, data);
    } catch (e: any) {
      if (e.code === 11000) {
        throw AppError.conflict(`Track with slug '${slug}' already exists`);
      }
      throw e;
    }
  }

  async updateTrack(slug: string, data: any): Promise<any> {
    const updated = await this.academyAdminRepository.updateTrack(slug, data);
    if (!updated) {
      throw AppError.notFound(`Track with slug '${slug}' not found`);
    }
    return updated;
  }

  async deleteTrack(slug: string): Promise<boolean> {
    const deleted = await this.academyAdminRepository.deleteTrack(slug);
    if (!deleted) {
      throw AppError.notFound(`Track with slug '${slug}' not found`);
    }
    return deleted;
  }

  async getAllTracks(): Promise<any[]> {
    return await this.academyAdminRepository.getAllTracks();
  }

  // Configs
  async createConfig(slug: string, data: any): Promise<any> {
    try {
      return await this.academyAdminRepository.createConfig(slug, data);
    } catch (e: any) {
      if (e.code === 11000) {
        throw AppError.conflict(`Config with slug '${slug}' already exists`);
      }
      throw e;
    }
  }

  async updateConfig(slug: string, data: any): Promise<any> {
    const updated = await this.academyAdminRepository.updateConfig(slug, data);
    if (!updated) {
      throw AppError.notFound(`Config with slug '${slug}' not found`);
    }
    return updated;
  }

  async deleteConfig(slug: string): Promise<boolean> {
    const deleted = await this.academyAdminRepository.deleteConfig(slug);
    if (!deleted) {
      throw AppError.notFound(`Config with slug '${slug}' not found`);
    }
    return deleted;
  }

  async getAllConfigs(): Promise<any[]> {
    return await this.academyAdminRepository.getAllConfigs();
  }

  // Concepts
  async createConcept(trackSlug: string, conceptSlug: string, data: any): Promise<any> {
    try {
      return await this.academyAdminRepository.createConcept(trackSlug, conceptSlug, data);
    } catch (e: any) {
      if (e.code === 11000) {
        throw AppError.conflict(`Concept with slug '${conceptSlug}' already exists for track '${trackSlug}'`);
      }
      throw e;
    }
  }

  async updateConcept(trackSlug: string, conceptSlug: string, data: any): Promise<any> {
    const updated = await this.academyAdminRepository.updateConcept(trackSlug, conceptSlug, data);
    if (!updated) {
      throw AppError.notFound(`Concept '${conceptSlug}' not found in track '${trackSlug}'`);
    }
    return updated;
  }

  async deleteConcept(trackSlug: string, conceptSlug: string): Promise<boolean> {
    const deleted = await this.academyAdminRepository.deleteConcept(trackSlug, conceptSlug);
    if (!deleted) {
      throw AppError.notFound(`Concept '${conceptSlug}' not found in track '${trackSlug}'`);
    }
    return deleted;
  }

  async getConceptsByTrack(trackSlug: string): Promise<any[]> {
    return await this.academyAdminRepository.getConceptsByTrack(trackSlug);
  }

  // Exercises
  async createExercise(trackSlug: string, exerciseSlug: string, data: any): Promise<any> {
    try {
      return await this.academyAdminRepository.createExercise(trackSlug, exerciseSlug, data);
    } catch (e: any) {
      if (e.code === 11000) {
        throw AppError.conflict(`Exercise with slug '${exerciseSlug}' already exists for track '${trackSlug}'`);
      }
      throw e;
    }
  }

  async updateExercise(trackSlug: string, exerciseSlug: string, data: any): Promise<any> {
    const updated = await this.academyAdminRepository.updateExercise(trackSlug, exerciseSlug, data);
    if (!updated) {
      throw AppError.notFound(`Exercise '${exerciseSlug}' not found in track '${trackSlug}'`);
    }
    return updated;
  }

  async deleteExercise(trackSlug: string, exerciseSlug: string): Promise<boolean> {
    const deleted = await this.academyAdminRepository.deleteExercise(trackSlug, exerciseSlug);
    if (!deleted) {
      throw AppError.notFound(`Exercise '${exerciseSlug}' not found in track '${trackSlug}'`);
    }
    return deleted;
  }

  async getExercisesByTrack(trackSlug: string): Promise<any[]> {
    return await this.academyAdminRepository.getExercisesByTrack(trackSlug);
  }

  async getStats(): Promise<AcademyStats> {
    return await this.academyAdminRepository.getStats();
  }
}

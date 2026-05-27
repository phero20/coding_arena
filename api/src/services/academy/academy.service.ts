import { type IAcademyRepository } from "../../repositories/academy/academy.repository";


export interface IAcademyService {
  getTracks(): Promise<any>;
  getTrackConfig(slug: string): Promise<any>;
  getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any>;
  getTrackExercise(trackSlug: string, exerciseSlug: string): Promise<any>;
  getSolvedExercises(userId: string, trackSlug: string): Promise<string[]>;
}

export class AcademyService implements IAcademyService {
  private academyRepository: IAcademyRepository;

  constructor({ academyRepository }: { academyRepository: IAcademyRepository }) {
    this.academyRepository = academyRepository;
  }

  async getTracks(): Promise<any> {
    return await this.academyRepository.getTracks();
  }

  async getTrackConfig(slug: string): Promise<any> {
    return await this.academyRepository.getTrackConfig(slug);
  }

  async getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any> {
    return await this.academyRepository.getTrackConcept(trackSlug, conceptSlug);
  }

  async getTrackExercise(trackSlug: string, exerciseSlug: string): Promise<any> {
    return await this.academyRepository.getTrackExercise(trackSlug, exerciseSlug);
  }

  async getSolvedExercises(userId: string, trackSlug: string): Promise<string[]> {
    return await this.academyRepository.getSolvedExercises(userId, trackSlug);
  }
}

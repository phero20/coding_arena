import { type IAcademyRepository } from "../../repositories/academy/academy.repository";

export interface IAcademyService {
  getTracks(): Promise<any>;
  getTrackConfig(slug: string): Promise<any>;
  getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any>;
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
}

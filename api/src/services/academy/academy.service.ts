import { type IAcademyRepository } from "../../repositories/academy/academy.repository";

export interface IAcademyService {
  getTracks(): Promise<any>;
}

export class AcademyService implements IAcademyService {
  private academyRepository: IAcademyRepository;

  constructor({ academyRepository }: { academyRepository: IAcademyRepository }) {
    this.academyRepository = academyRepository;
  }

  async getTracks(): Promise<any> {
    return await this.academyRepository.getTracks();
  }
}

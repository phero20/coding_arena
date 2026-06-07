import type { SeoRepository } from "../../repositories/seo/seo.repository";

export interface ISeoServiceDeps {
  seoRepository: SeoRepository;
}

export class SeoService {
  private readonly seoRepository: SeoRepository;

  constructor({ seoRepository }: ISeoServiceDeps) {
    this.seoRepository = seoRepository;
  }

  async getProblemsSitemapData() {
    return this.seoRepository.getProblemsForSitemap();
  }

  async getAcademyTracksSitemapData() {
    return this.seoRepository.getAcademyTracksForSitemap();
  }

  async getAcademyExercisesSitemapData() {
    return this.seoRepository.getAcademyExercisesForSitemap();
  }

  async getSystemDesignLessonsSitemapData() {
    return this.seoRepository.getSystemDesignLessonsForSitemap();
  }

  async getCompanyTagsSitemapData() {
    return this.seoRepository.getCompanyTagsForSitemap();
  }

  async getUsersSitemapData() {
    return this.seoRepository.getUsersForSitemap();
  }
}

export interface SitemapProblem {
  _id: string;
  problem_id: string;
  problem_slug: string;
  updatedAt: string;
}

export interface SitemapAcademyTrack {
  slug: string;
}

export interface SitemapAcademyExercise {
  trackSlug: string;
  exerciseSlug: string;
}

export interface SitemapSystemDesignLesson {
  slug: string;
}

export interface SitemapCompanyTag {
  slug: string;
}

export interface SitemapUser {
  username: string;
  updatedAt: string;
}

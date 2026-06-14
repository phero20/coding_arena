import { ProblemModel } from "../../mongo/models/problem.model";
import { db } from "../../db";
import { users } from "../../db/schema";
import { AcademyTrackModel } from "../../mongo/models/academymodels/academy-track.model";
import { AcademyExerciseModel } from "../../mongo/models/academymodels/academy-exercise.model";
import { SystemDesignTopicModel } from "../../mongo/models/system-design-topic.model";
import { CompanyModel } from "../../mongo/models/company.model";

export class SeoRepository {
  /**
   * Fetches the minimum required data for all problems to populate the sitemap.
   * Only fetches problem_id (slug used in URL) and updatedAt.
   */
  async getProblemsForSitemap() {
    const problems = await ProblemModel.find({})
      .select("problem_id problem_slug updatedAt")
      .lean()
      .exec();
    
    return problems;
  }

  /**
   * Fetches all academy track slugs from the static JSON file.
   */
  async getAcademyTracksForSitemap() {
    try {
      const tracks = await AcademyTrackModel.find({}).select("slug").lean().exec();
      return tracks;
    } catch (e: any) {
      console.error("Error fetching tracks for sitemap:", e);
      return [];
    }
  }

  /**
   * Fetches all academy exercises across all tracks by scanning the exercises directory.
   * Returns { trackSlug: string, exerciseSlug: string }
   */
  async getAcademyExercisesForSitemap() {
    try {
      const exercises = await AcademyExerciseModel.find({}).select("trackSlug exerciseSlug").lean().exec();
      return exercises;
    } catch (e: any) {
      console.error("Error fetching exercises for sitemap:", e);
      return [];
    }
  }

  /**
   * Fetches all system design lesson slugs.
   */
  async getSystemDesignLessonsForSitemap() {
    try {
      const topics = await SystemDesignTopicModel.find({}).select("slug").lean().exec();
      return topics;
    } catch (e: any) {
      console.error("Error fetching system design topics for sitemap:", e);
      return [];
    }
  }

  /**
   * Fetches all company tag slugs.
   */
  async getCompanyTagsForSitemap() {
    try {
      const companies = await CompanyModel.find({}).select("slug").lean().exec();
      return companies;
    } catch (e: any) {
      console.error("Error fetching companies for sitemap:", e);
      return [];
    }
  }

  /**
   * Fetches all user profiles from the PostgreSQL database.
   */
  async getUsersForSitemap() {
    try {
      const allUsers = await db.select({
        username: users.username,
        updatedAt: users.updatedAt
      }).from(users).execute();

      return allUsers;
    } catch (e: any) {
      console.error("Error fetching users for sitemap:", e);
      return [];
    }
  }
}

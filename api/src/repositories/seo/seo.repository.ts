import { ProblemModel } from "../../mongo/models/problem.model";
import { db } from "../../db";
import { users } from "../../db/schema";
import fs from "fs/promises";
import path from "path";

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
    // Relative to dist/repositories/seo or src/repositories/seo
    // Matches the path used in AcademyRepository
    const filePath = path.join(__dirname, "../../../../data/static-data/academy/tracks.json");
    try {
      const data = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(data);
      // parsed.tracks is an array of track objects { slug: "javascript", ... }
      return parsed.tracks.map((track: any) => ({ slug: track.slug }));
    } catch (e: any) {
      if (e.code === 'ENOENT') return [];
      throw e;
    }
  }

  /**
   * Fetches all academy exercises across all tracks by scanning the exercises directory.
   * Returns { trackSlug: string, exerciseSlug: string }
   */
  async getAcademyExercisesForSitemap() {
    const exercisesPath = path.join(__dirname, "../../../../data/static-data/academy/exercises");
    try {
      const trackSlugs = await fs.readdir(exercisesPath);
      const allExercises: { trackSlug: string, exerciseSlug: string }[] = [];

      for (const trackSlug of trackSlugs) {
        const trackDirPath = path.join(exercisesPath, trackSlug);
        try {
          const stat = await fs.stat(trackDirPath);
          if (stat.isDirectory()) {
            const exerciseFiles = await fs.readdir(trackDirPath);
            for (const file of exerciseFiles) {
              if (file.endsWith(".json")) {
                const exerciseSlug = file.replace(".json", "");
                allExercises.push({ trackSlug, exerciseSlug });
              }
            }
          }
        } catch (e) {
          console.error(`Error reading exercises for track ${trackSlug}:`, e);
        }
      }

      return allExercises;
    } catch (e: any) {
      if (e.code === 'ENOENT') return [];
      throw e;
    }
  }

  /**
   * Fetches all system design lesson slugs.
   */
  async getSystemDesignLessonsForSitemap() {
    const filePath = path.join(__dirname, "../../../../data/static-data/system-design/topics.json");
    try {
      const data = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(data);
      // parsed is an array of topic objects { slug: "ip", ... }
      return parsed.map((topic: any) => ({ slug: topic.slug }));
    } catch (e: any) {
      if (e.code === 'ENOENT') return [];
      throw e;
    }
  }

  /**
   * Fetches all company tag slugs.
   */
  async getCompanyTagsForSitemap() {
    const filePath = path.join(__dirname, "../../../../data/static-data/company-wise-problems/companies.json");
    try {
      const data = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(data);
      // parsed is an array of company objects { id: "accenture", ... }
      return parsed.map((company: any) => ({ slug: company.id }));
    } catch (e: any) {
      if (e.code === 'ENOENT') return [];
      throw e;
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

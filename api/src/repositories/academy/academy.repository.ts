import fs from "fs/promises";
import path from "path";
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { userAcademyExercises } from "../../db/schema";

export interface IAcademyRepository {
  getTracks(): Promise<any>;
  getTrackConfig(slug: string): Promise<any>;
  getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any>;
  getTrackExercise(trackSlug: string, exerciseSlug: string): Promise<any>;
  markExerciseSolved(userId: string, trackSlug: string, exerciseSlug: string): Promise<boolean>;
  getSolvedExercises(userId: string, trackSlug: string): Promise<string[]>;
}

export class AcademyRepository implements IAcademyRepository {
  async getTracks(): Promise<any> {
    const filePath = path.join(__dirname, "../../../../data/static-data/academy/tracks.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  async getTrackConfig(slug: string): Promise<any> {
    const filePath = path.join(__dirname, `../../../../data/static-data/academy/config/${slug}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  async getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any> {
    const filePath = path.join(__dirname, `../../../../data/static-data/academy/concepts/${trackSlug}/${conceptSlug}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  async getTrackExercise(trackSlug: string, exerciseSlug: string): Promise<any> {
    const filePath = path.join(__dirname, `../../../../data/static-data/academy/exercises/${trackSlug}/${exerciseSlug}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  async markExerciseSolved(userId: string, trackSlug: string, exerciseSlug: string): Promise<boolean> {
    const result = await db
      .insert(userAcademyExercises)
      .values({
        userId,
        trackSlug,
        exerciseSlug,
      })
      .onConflictDoNothing({
        target: [
          userAcademyExercises.userId,
          userAcademyExercises.trackSlug,
          userAcademyExercises.exerciseSlug,
        ],
      })
      .returning();
      
    return result.length > 0;
  }

  async getSolvedExercises(userId: string, trackSlug: string): Promise<string[]> {
    const filters = [eq(userAcademyExercises.userId, userId)];
    
    if (trackSlug !== "all") {
      filters.push(eq(userAcademyExercises.trackSlug, trackSlug));
    }

    const solved = await db
      .select({ exerciseSlug: userAcademyExercises.exerciseSlug })
      .from(userAcademyExercises)
      .where(and(...filters));

    return solved.map((s) => s.exerciseSlug);
  }
}

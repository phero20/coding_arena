import fs from "fs/promises";
import path from "path";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { userAcademyExercises } from "../../db/schema";
import { AcademyTrackModel } from "../../mongo/models/academymodels/academy-track.model";
import { AcademyConfigModel } from "../../mongo/models/academymodels/academy-config.model";
import { AcademyConceptModel } from "../../mongo/models/academymodels/academy-concept.model";
import { AcademyExerciseModel } from "../../mongo/models/academymodels/academy-exercise.model";

export interface IAcademyRepository {
  getTracks(): Promise<any>;
  getTrackConfig(slug: string): Promise<any>;
  getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any>;
  getTrackExercise(trackSlug: string, exerciseSlug: string): Promise<any>;
  markExerciseSolved(userId: string, trackSlug: string, exerciseSlug: string): Promise<boolean>;
  getSolvedExercises(userId: string, trackSlug: string): Promise<string[]>;
  getAcademySolvedCount(userId: string): Promise<number>;
}

export class AcademyRepository implements IAcademyRepository {
  async getTracks(): Promise<any> {
    try {
      const dbTracks = await AcademyTrackModel.find({}).lean();
      if (!dbTracks || dbTracks.length === 0) {
        // Fallback or just return empty format if not seeded yet
        return { tracks: [] };
      }
      // Reconstruct the JSON structure that the frontend expects
      return { tracks: dbTracks.map(doc => doc.data) };
    } catch (e: any) {
      return null;
    }
  }

  async getTrackConfig(slug: string): Promise<any> {
    try {
      const doc = await AcademyConfigModel.findOne({ slug }).lean();
      return doc ? doc.data : null;
    } catch (e: any) {
      return null;
    }
  }

  async getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any> {
    try {
      const doc = await AcademyConceptModel.findOne({ trackSlug, conceptSlug }).lean();
      return doc ? doc.data : null;
    } catch (e: any) {
      return null;
    }
  }

  async getTrackExercise(trackSlug: string, exerciseSlug: string): Promise<any> {
    try {
      const doc = await AcademyExerciseModel.findOne({ trackSlug, exerciseSlug }).lean();
      return doc ? doc.data : null;
    } catch (e: any) {
      return null;
    }
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

  async getAcademySolvedCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(userAcademyExercises)
      .where(eq(userAcademyExercises.userId, userId));
    return result?.count || 0;
  }
}

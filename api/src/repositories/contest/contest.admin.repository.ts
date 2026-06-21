import { db, schema } from "../../db";
import { eq, count } from "drizzle-orm";
import type { Contest, NewContest } from "../../db/schema";
import { type ICradle } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("contest-admin-repository");

export interface IContestAdminRepository {
  getAll(): Promise<Contest[]>;
  create(payload: NewContest): Promise<Contest>;
  update(id: string, payload: Partial<Contest>): Promise<Contest | null>;
  delete(id: string): Promise<void>;
  getStats(): Promise<{ contests: number }>;
}

export class ContestAdminRepository implements IContestAdminRepository {
  constructor(_: ICradle) {}

  async getAll(): Promise<Contest[]> {
    const docs = await db
      .select()
      .from(schema.contests)
      .orderBy(schema.contests.startTime);

    return docs;
  }

  async create(payload: NewContest): Promise<Contest> {
    const [created] = await db
      .insert(schema.contests)
      .values(payload)
      .returning();
    return created;
  }

  async update(id: string, payload: Partial<Contest>): Promise<Contest | null> {
    const [updated] = await db
      .update(schema.contests)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(schema.contests.id, id))
      .returning();
    
    return updated || null;
  }

  async delete(id: string): Promise<void> {
    await db.delete(schema.contests).where(eq(schema.contests.id, id));
  }

  async getStats(): Promise<{ contests: number }> {
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(schema.contests);
    
    return { contests: total };
  }
}

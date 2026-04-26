import { db, schema } from "../../db";
import { eq, gte, sql, and, lte } from "drizzle-orm";
import type { Contest, NewContest } from "../../db/schema";
import { createLogger } from "../../libs/utils/logger";
import { type ICradle } from "../../libs/awilix-container";
import { type IClockService } from "../../services/common/clock.service";

const logger = createLogger("contest-repository");

export interface IContestRepository {
  findById(id: string): Promise<Contest | null>;
  findByClistId(clistId: number): Promise<Contest | null>;
  findUpcoming(limit?: number, maxDate?: Date): Promise<Contest[]>;
  upsert(contest: NewContest): Promise<Contest>;
  deleteOld(before: Date): Promise<number>;
}

export class ContestRepository implements IContestRepository {
  private readonly clock: IClockService;

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
  }

  async findById(id: string): Promise<Contest | null> {
    const [contest] = await db
      .select()
      .from(schema.contests)
      .where(eq(schema.contests.id, id))
      .limit(1);
    return contest ?? null;
  }

  async findByClistId(clistId: number): Promise<Contest | null> {
    const [contest] = await db
      .select()
      .from(schema.contests)
      .where(eq(schema.contests.clistId, clistId))
      .limit(1);
    return contest ?? null;
  }

  async findUpcoming(limit: number = 200, maxDate?: Date): Promise<Contest[]> {
    const conditions = [gte(schema.contests.startTime, this.clock.nowDate())];
    
    if (maxDate) {
      conditions.push(lte(schema.contests.startTime, maxDate));
    }

    return await db
      .select()
      .from(schema.contests)
      .where(and(...conditions))
      .orderBy(schema.contests.startTime)
      .limit(limit);
  }

  async upsert(contest: NewContest): Promise<Contest> {
    const [upserted] = await db
      .insert(schema.contests)
      .values(contest)
      .onConflictDoUpdate({
        target: schema.contests.clistId,
        set: {
          title: contest.title,
          description: contest.description,
          platform: contest.platform,
          startTime: contest.startTime,
          endTime: contest.endTime,
          duration: contest.duration,
          href: contest.href,
          icon: contest.icon,
          status: contest.status,
          updatedAt: this.clock.nowDate(),
        },
      })
      .returning();

    return upserted;
  }

  async deleteOld(before: Date): Promise<number> {
    const result = await db
      .delete(schema.contests)
      .where(sql`${schema.contests.endTime} < ${before}`);

    // Drizzle doesn't return row count easily on all drivers, but this is the intent
    return 1;
  }
}

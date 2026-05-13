import { db, schema } from "../../db";
import { eq, and, sql } from "drizzle-orm";
import type { Solution, NewSolution, SolutionVote, NewSolutionVote, User } from "../../db/schema";
import { type ICradle } from "../../libs/awilix-container";
import { type IClockService } from "../../services/common/clock.service";

export interface SolutionWithAuthor extends Solution {
  author: Pick<User, 'username' | 'avatarUrl' | 'fullName'>;
}

export interface ISolutionRepository {
  create(solution: NewSolution): Promise<Solution>;
  findById(id: string): Promise<SolutionWithAuthor | null>;
  findByProblemId(problemId: string): Promise<SolutionWithAuthor[]>;
  upsertVote(vote: NewSolutionVote): Promise<void>;
  updateVoteCounts(solutionId: string): Promise<void>;
  getUserVote(userId: string, solutionId: string): Promise<SolutionVote | null>;
  update(id: string, solution: Partial<NewSolution>): Promise<Solution>;
  delete(id: string): Promise<void>;
  deleteVote(userId: string, solutionId: string): Promise<void>;
  findByUserId(userId: string, limit: number, offset: number): Promise<SolutionWithAuthor[]>;
  countByUserId(userId: string): Promise<number>;
}

export class SolutionRepository implements ISolutionRepository {
  private readonly clock: IClockService;

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
  }

  async create(solution: NewSolution): Promise<Solution> {
    const [created] = await db.insert(schema.solutions).values(solution).returning();
    return created;
  }

  async findById(id: string): Promise<SolutionWithAuthor | null> {
    const results = await db
      .select({
        solution: schema.solutions,
        author: {
          username: schema.users.username,
          avatarUrl: schema.users.avatarUrl,
          fullName: schema.users.fullName,
        },
      })
      .from(schema.solutions)
      .leftJoin(schema.users, eq(schema.solutions.userId, schema.users.id))
      .where(eq(schema.solutions.id, id))
      .limit(1);

    if (results.length === 0) return null;
    
    return {
      ...results[0].solution,
      author: results[0].author as any,
    };
  }

  async findByProblemId(problemId: string): Promise<SolutionWithAuthor[]> {
    const results = await db
      .select({
        solution: schema.solutions,
        author: {
          username: schema.users.username,
          avatarUrl: schema.users.avatarUrl,
          fullName: schema.users.fullName,
        },
      })
      .from(schema.solutions)
      .leftJoin(schema.users, eq(schema.solutions.userId, schema.users.id))
      .where(eq(schema.solutions.problemId, problemId))
      .orderBy(sql`${schema.solutions.upvotes} - ${schema.solutions.downvotes} DESC`, schema.solutions.createdAt);

    return results.map(r => ({
      ...r.solution,
      author: r.author as any,
    }));
  }

  async upsertVote(vote: NewSolutionVote): Promise<void> {
    await db
      .insert(schema.solutionVotes)
      .values(vote)
      .onConflictDoUpdate({
        target: [schema.solutionVotes.userId, schema.solutionVotes.solutionId],
        set: { 
          voteType: vote.voteType,
          createdAt: this.clock.nowDate()
        },
      });
  }

  async getUserVote(userId: string, solutionId: string): Promise<SolutionVote | null> {
    const [vote] = await db
      .select()
      .from(schema.solutionVotes)
      .where(
        and(
          eq(schema.solutionVotes.userId, userId),
          eq(schema.solutionVotes.solutionId, solutionId)
        )
      )
      .limit(1);
    
    return vote ?? null;
  }

  async updateVoteCounts(solutionId: string): Promise<void> {
    const counts = await db
      .select({
        type: schema.solutionVotes.voteType,
        count: sql<number>`count(*)`,
      })
      .from(schema.solutionVotes)
      .where(eq(schema.solutionVotes.solutionId, solutionId))
      .groupBy(schema.solutionVotes.voteType);

    const upvotes = Number(counts.find(c => c.type === 1)?.count || 0);
    const downvotes = Number(counts.find(c => c.type === -1)?.count || 0);

    await db
      .update(schema.solutions)
      .set({ upvotes, downvotes, updatedAt: this.clock.nowDate() })
      .where(eq(schema.solutions.id, solutionId));
  }

  async update(id: string, solution: Partial<NewSolution>): Promise<Solution> {
    const [updated] = await db
      .update(schema.solutions)
      .set({ ...solution, updatedAt: this.clock.nowDate() })
      .where(eq(schema.solutions.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(schema.solutions).where(eq(schema.solutions.id, id));
  }
  
  async deleteVote(userId: string, solutionId: string): Promise<void> {
    await db
      .delete(schema.solutionVotes)
      .where(
        and(
          eq(schema.solutionVotes.userId, userId),
          eq(schema.solutionVotes.solutionId, solutionId)
        )
      );
  }

  async findByUserId(userId: string, limit: number, offset: number): Promise<SolutionWithAuthor[]> {
    const results = await db
      .select({
        solution: schema.solutions,
        author: {
          username: schema.users.username,
          avatarUrl: schema.users.avatarUrl,
          fullName: schema.users.fullName,
        },
      })
      .from(schema.solutions)
      .leftJoin(schema.users, eq(schema.solutions.userId, schema.users.id))
      .where(eq(schema.solutions.userId, userId))
      .orderBy(sql`${schema.solutions.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    return results.map(r => ({
      ...r.solution,
      author: r.author as any,
    }));
  }

  async countByUserId(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.solutions)
      .where(eq(schema.solutions.userId, userId));
    return Number(result?.count || 0);
  }
}

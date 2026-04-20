import { eq, and, sql } from "drizzle-orm";
import { db, schema } from "../../db";
import { type ICradle } from "../../libs/awilix-container";

export interface IFollowRepository {
  follow(followerId: string, followingId: string): Promise<void>;
  unfollow(followerId: string, followingId: string): Promise<boolean>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowCounts(
    userId: string,
  ): Promise<{ followers: number; following: number }>;
  getFollowersList(userId: string): Promise<any[]>;
  getFollowingList(userId: string): Promise<any[]>;
}

export class FollowRepository implements IFollowRepository {
  constructor(_: ICradle) {}

  async follow(followerId: string, followingId: string): Promise<void> {
    await db
      .insert(schema.follows)
      .values({
        followerId,
        followingId,
      })
      .onConflictDoNothing();
  }

  async unfollow(followerId: string, followingId: string): Promise<boolean> {
    const result = await db
      .delete(schema.follows)
      .where(
        and(
          eq(schema.follows.followerId, followerId),
          eq(schema.follows.followingId, followingId),
        ),
      )
      .returning();

    return result.length > 0;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(schema.follows)
      .where(
        and(
          eq(schema.follows.followerId, followerId),
          eq(schema.follows.followingId, followingId),
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  async getFollowCounts(
    userId: string,
  ): Promise<{ followers: number; following: number }> {
    const [followersCount, followingCount] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.follows)
        .where(eq(schema.follows.followingId, userId)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.follows)
        .where(eq(schema.follows.followerId, userId)),
    ]);

    return {
      followers: Number(followersCount[0].count),
      following: Number(followingCount[0].count),
    };
  }

  async getFollowersList(userId: string): Promise<any[]> {
    return await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        fullName: schema.users.fullName,
        avatarUrl: schema.users.avatarUrl,
      })
      .from(schema.follows)
      .innerJoin(schema.users, eq(schema.follows.followerId, schema.users.id))
      .where(eq(schema.follows.followingId, userId));
  }

  async getFollowingList(userId: string): Promise<any[]> {
    return await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        fullName: schema.users.fullName,
        avatarUrl: schema.users.avatarUrl,
      })
      .from(schema.follows)
      .innerJoin(schema.users, eq(schema.follows.followingId, schema.users.id))
      .where(eq(schema.follows.followerId, userId));
  }
}

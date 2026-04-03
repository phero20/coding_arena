import { db, schema } from '../db'
import { eq } from 'drizzle-orm'
import type { User, NewUser } from '../db/schema'

export interface IUserRepository {
  findByClerkId(clerkId: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(user: NewUser): Promise<User>
  update(clerkId: string, user: Partial<NewUser>): Promise<User | null>
}

export class UserRepository implements IUserRepository {
  async findByClerkId(clerkId: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.clerkId, clerkId))
      .limit(1)

    return user ?? null
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1)

    return user ?? null
  }

  async findByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1)

    return user ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1)

    return user ?? null
  }

  async create(user: NewUser): Promise<User> {
    const [created] = await db.insert(schema.users).values(user).returning()
    return created
  }

  async update(clerkId: string, user: Partial<NewUser>): Promise<User | null> {
    const [updated] = await db
      .update(schema.users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(schema.users.clerkId, clerkId))
      .returning()

    return updated ?? null
  }
}


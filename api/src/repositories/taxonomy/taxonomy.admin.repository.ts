import { db, schema } from '../../db';
import { eq, sql, and } from 'drizzle-orm';
import type { Category, NewCategory, CategoryProblem } from '../../db/schema';
import { type ICradle } from '../../libs/awilix-container';

export interface ITaxonomyAdminRepository {
  createCategory(category: NewCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  mapProblem(mapping: CategoryProblem): Promise<void>;
  batchMapProblems(mappings: CategoryProblem[]): Promise<void>;
  unmapProblem(categoryId: string, problemId: string): Promise<void>;
}

export class TaxonomyAdminRepository implements ITaxonomyAdminRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_: ICradle) {}

  async createCategory(category: NewCategory): Promise<Category> {
    const [created] = await db.insert(schema.categories).values(category).returning();
    return created;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const [updated] = await db
      .update(schema.categories)
      .set(category)
      .where(eq(schema.categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(schema.categories).where(eq(schema.categories.id, id));
  }

  async mapProblem(mapping: CategoryProblem): Promise<void> {
    await db
      .insert(schema.categoryProblems)
      .values(mapping)
      .onConflictDoUpdate({
        target: [schema.categoryProblems.categoryId, schema.categoryProblems.problemId],
        set: { order: mapping.order },
      });
  }

  async batchMapProblems(mappings: CategoryProblem[]): Promise<void> {
    if (mappings.length === 0) return;
    
    await db
      .insert(schema.categoryProblems)
      .values(mappings)
      .onConflictDoUpdate({
        target: [schema.categoryProblems.categoryId, schema.categoryProblems.problemId],
        set: { order: sql`EXCLUDED.order` },
      });
  }

  async unmapProblem(categoryId: string, problemId: string): Promise<void> {
    await db
      .delete(schema.categoryProblems)
      .where(
        and(
          eq(schema.categoryProblems.categoryId, categoryId),
          eq(schema.categoryProblems.problemId, problemId),
        ),
      );
  }
}

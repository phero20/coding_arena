import { db, schema } from '../../db';
import { eq, sql, and } from 'drizzle-orm';
import type { Category, NewCategory, CategoryProblem } from '../../db/schema';
import { type ICradle } from '../../libs/awilix-container';

export interface ITaxonomyRepository {
  findAllCategories(): Promise<Category[]>;
  findCategoryBySlug(slug: string): Promise<Category | null>;
  findCategoryById(id: string): Promise<Category | null>;
  findChildren(parentId: string): Promise<Category[]>;
  getProblemMappings(categoryId: string): Promise<CategoryProblem[]>;
  createCategory(category: NewCategory): Promise<Category>;
  mapProblem(mapping: CategoryProblem): Promise<void>;
  batchMapProblems(mappings: CategoryProblem[]): Promise<void>;
  unmapProblem(categoryId: string, problemId: string): Promise<void>;
  getProblemCount(categoryId: string): Promise<number>;
  getProblemCountRecursive(categoryId: string): Promise<number>;
  /** Batch: returns a map of categoryId -> recursive problem count in ONE query. */
  getAllProblemCounts(): Promise<Map<string, number>>;
}

export class TaxonomyRepository implements ITaxonomyRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_: ICradle) {}

  async findAllCategories(): Promise<Category[]> {
    return db.select().from(schema.categories).orderBy(schema.categories.order);
  }

  async findCategoryBySlug(slug: string): Promise<Category | null> {
    const [cat] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, slug))
      .limit(1);
    return cat ?? null;
  }

  async findCategoryById(id: string): Promise<Category | null> {
    const [cat] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1);
    return cat ?? null;
  }

  async findChildren(parentId: string): Promise<Category[]> {
    return db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.parentId, parentId))
      .orderBy(schema.categories.order);
  }

  async getProblemMappings(categoryId: string): Promise<CategoryProblem[]> {
    return db
      .select()
      .from(schema.categoryProblems)
      .where(eq(schema.categoryProblems.categoryId, categoryId))
      .orderBy(schema.categoryProblems.order);
  }

  async createCategory(category: NewCategory): Promise<Category> {
    const [created] = await db.insert(schema.categories).values(category).returning();
    return created;
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

  async getProblemCount(categoryId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.categoryProblems)
      .where(eq(schema.categoryProblems.categoryId, categoryId));
    return Number(result?.count ?? 0);
  }

  /**
   * Recursive CTE: counts all unique problems in this category AND all descendants.
   * Powers the completion-percentage feature on the frontend tree view.
   */
  async getProblemCountRecursive(categoryId: string): Promise<number> {
    const result = await db.execute(sql`
      WITH RECURSIVE category_tree AS (
        SELECT id FROM ${schema.categories} WHERE id = ${categoryId}
        UNION ALL
        SELECT c.id FROM ${schema.categories} c
        JOIN category_tree ct ON c.parent_id = ct.id
      )
      SELECT count(DISTINCT problem_id)::int AS count
      FROM ${schema.categoryProblems}
      WHERE category_id IN (SELECT id FROM category_tree)
    `);

    return Number(result.rows[0]?.count ?? 0);
  }

  /**
   * Batch recursive CTE: returns counts for EVERY category in a single query.
   * Eliminates the N+1 pattern in getTaxonomyTree().
   *
   * For each category (as root_id), we walk its full descendant subtree and
   * count all distinct problems mapped to any node in that subtree.
   */
  async getAllProblemCounts(): Promise<Map<string, number>> {
    const result = await db.execute(sql`
      WITH RECURSIVE category_tree AS (
        SELECT id AS root_id, id AS node_id
        FROM ${schema.categories}
        UNION ALL
        SELECT ct.root_id, c.id AS node_id
        FROM ${schema.categories} c
        JOIN category_tree ct ON c.parent_id = ct.node_id
      )
      SELECT ct.root_id AS category_id, count(DISTINCT cp.problem_id)::int AS count
      FROM category_tree ct
      LEFT JOIN ${schema.categoryProblems} cp ON cp.category_id = ct.node_id
      GROUP BY ct.root_id
    `);

    const countMap = new Map<string, number>();
    for (const row of result.rows) {
      countMap.set(row.category_id as string, Number(row.count ?? 0));
    }
    return countMap;
  }
}

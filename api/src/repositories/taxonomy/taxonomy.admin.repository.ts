import { db, schema } from "../../db";
import { eq, sql, and } from "drizzle-orm";
import { ProblemModel } from "../../mongo/models/problem.model";
import type { Category, NewCategory, CategoryProblem } from "../../db/schema";
import { type ICradle } from "../../libs/awilix-container";

export interface ITaxonomyAdminRepository {
  createCategory(category: NewCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  mapProblem(mapping: CategoryProblem): Promise<void>;
  batchMapProblems(mappings: CategoryProblem[]): Promise<void>;
  unmapProblem(categoryId: string, problemId: string): Promise<void>;
  getRoadmapStats(): Promise<{
    categories: number;
    traffic: {
      name: string;
      slug: string;
      count: number;
      difficulty: { easy: number; medium: number; hard: number };
    }[];
  }>;
}

export class TaxonomyAdminRepository implements ITaxonomyAdminRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_: ICradle) {}

  async createCategory(category: NewCategory): Promise<Category> {
    const [created] = await db
      .insert(schema.categories)
      .values(category)
      .returning();
    return created;
  }

  async updateCategory(
    id: string,
    category: Partial<Category>,
  ): Promise<Category> {
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
        target: [
          schema.categoryProblems.categoryId,
          schema.categoryProblems.problemId,
        ],
        set: { order: mapping.order },
      });
  }

  async batchMapProblems(mappings: CategoryProblem[]): Promise<void> {
    if (mappings.length === 0) return;

    await db
      .insert(schema.categoryProblems)
      .values(mappings)
      .onConflictDoUpdate({
        target: [
          schema.categoryProblems.categoryId,
          schema.categoryProblems.problemId,
        ],
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

  async getRoadmapStats(): Promise<{
    categories: number;
    traffic: {
      name: string;
      slug: string;
      count: number;
      difficulty: { easy: number; medium: number; hard: number };
    }[];
  }> {
    // Run the basic counts and the complex recursive CTE traffic query in parallel
    const [categoriesCount, trafficResult] = await Promise.all([
      db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(schema.categories),
      db.execute(sql`
        WITH RECURSIVE category_tree AS (
          -- Base case: Top level categories (parent_id is null)
          SELECT 
            id AS root_id,
            name AS root_name,
            slug AS root_slug,
            id AS current_id
          FROM categories
          WHERE parent_id IS NULL

          UNION ALL

          -- Recursive step: Find children
          SELECT 
            ct.root_id,
            ct.root_name,
            ct.root_slug,
            c.id AS current_id
          FROM categories c
          INNER JOIN category_tree ct ON c.parent_id = ct.current_id
        )
        SELECT 
          ct.root_name AS name,
          ct.root_slug AS slug,
          CAST(COUNT(usp.problem_id) AS INTEGER) AS count,
          array_agg(DISTINCT cp.problem_id) FILTER (WHERE cp.problem_id IS NOT NULL) AS problem_ids
        FROM category_tree ct
        LEFT JOIN category_problems cp ON ct.current_id = cp.category_id
        LEFT JOIN user_solved_problems usp ON cp.problem_id = usp.problem_id
        GROUP BY ct.root_id, ct.root_name, ct.root_slug
        ORDER BY count DESC
      `),
    ]);

    // Extract all unique problem IDs across all categories to fetch their difficulty from Mongo
    const allProblemIds = Array.from(
      new Set(trafficResult.rows.flatMap((r: any) => r.problem_ids || [])),
    );

    const problems = await ProblemModel.find(
      { problem_id: { $in: allProblemIds } },
      { problem_id: 1, difficulty: 1, _id: 0 },
    ).lean();

    const difficultyMap = new Map<string, string>(
      problems.map((p: any) => [p.problem_id, p.difficulty]),
    );

    const traffic = trafficResult.rows.map((row: any) => {
      const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 };
      for (const pid of row.problem_ids || []) {
        const d = difficultyMap.get(pid) as
          | "Easy"
          | "Medium"
          | "Hard"
          | undefined;
        if (d && (d === "Easy" || d === "Medium" || d === "Hard")) {
          difficultyCount[d]++;
        }
      }

      return {
        name: row.name,
        slug: row.slug,
        count: row.count,
        difficulty: {
          easy: difficultyCount.Easy,
          medium: difficultyCount.Medium,
          hard: difficultyCount.Hard,
        },
      };
    });

    return {
      categories: categoriesCount[0].count,
      traffic,
    };
  }
}

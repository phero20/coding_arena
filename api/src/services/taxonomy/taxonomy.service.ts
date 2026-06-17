import { type ICradle } from '../../libs/awilix-container';
import { type ITaxonomyRepository } from '../../repositories/taxonomy/taxonomy.repository';
import { type IProblemRepository } from '../../repositories/problems/problem.repository';
  import { type CategoryTreeNode,
  type CategoryDetail,
} from '../../types/taxonomy/taxonomy.types';
import { AppError } from '../../utils/app-error';

export interface ITaxonomyService {
  getTaxonomyTree(): Promise<CategoryTreeNode[]>;
  getUserRoadmapProgress(userId: string): Promise<{ counts: Record<string, number>; solvedIds: string[] }>;
  getCategoryDetail(slug: string, userId?: string): Promise<CategoryDetail>;
  getCategoryDetailById(id: string, userId?: string): Promise<CategoryDetail>;
  invalidateUserProgress(userId: string): Promise<void>;
}

export class TaxonomyService implements ITaxonomyService {
  private readonly taxonomyRepo: ITaxonomyRepository;
  private readonly problemRepo: IProblemRepository;

  constructor({ taxonomyRepository, problemRepository }: ICradle) {
    this.taxonomyRepo = taxonomyRepository;
    this.problemRepo = problemRepository;
  }

  /**
   * Builds the full recursive taxonomy tree.
   *
   * DB cost: 2 queries total (regardless of tree size).
   *   1. findAllCategories()      — fetch all category rows
   *   2. getAllProblemCounts()     — single batch CTE for all recursive counts
   * Everything else is pure in-memory O(n).
   */
  async getTaxonomyTree(): Promise<CategoryTreeNode[]> {
    // 2 parallel queries — no serial waiting
    const [allCategories, countMap] = await Promise.all([
      this.taxonomyRepo.findAllCategories(),
      this.taxonomyRepo.getAllProblemCounts(),
    ]);

    const nodeMap = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // Phase 1: Initialize all nodes with their pre-fetched counts
    for (const cat of allCategories) {
      nodeMap.set(cat.id, {
        ...cat,
        children: [],
        problemCount: countMap.get(cat.id) ?? 0,
      });
    }

    // Phase 2: Establish parent-child links (in-memory, zero DB calls)
    for (const node of Array.from(nodeMap.values())) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async getUserRoadmapProgress(userId: string): Promise<{ counts: Record<string, number>; solvedIds: string[] }> {
    return this.taxonomyRepo.getUserRoadmapProgress(userId);
  }

  /**
   * Returns full details for a category including enriched problems.
   *
   * DB cost: 3 queries total (regardless of problem count).
   *   1. findCategoryBySlug()     — single Postgres lookup
   *   2. findChildren() + getProblemMappings() + parent lookup — parallel
   *   3. findManyByProblemIds()   — single MongoDB $in query
   */
  async getCategoryDetail(slug: string, userId?: string): Promise<CategoryDetail> {
    const category = await this.taxonomyRepo.findCategoryBySlug(slug);
    if (!category) {
      throw AppError.notFound('Category not found');
    }

    const [parent, children, mappings] = await Promise.all([
      category.parentId
        ? this.taxonomyRepo.findCategoryById(category.parentId)
        : Promise.resolve(null),
      this.taxonomyRepo.findChildren(category.id),
      this.taxonomyRepo.getProblemMappings(category.id),
    ]);

    // Single $in query instead of N individual Mongo lookups
    const problemIds = mappings.map((m) => m.problemId);
    const [problems, solvedIds] = await Promise.all([
      this.problemRepo.findManyByProblemIds(problemIds),
      userId ? this.taxonomyRepo.getSolvedProblemIds(userId, problemIds) : Promise.resolve(new Set<string>()),
    ]);

    const mappingDict = new Map(mappings.map(m => [m.problemId, m.order]));

    const enrichedProblems = problems.map(p => ({
      ...p,
      isSolved: solvedIds.has(p.problem_id),
      order: mappingDict.get(p.problem_id) ?? 0,
    })).sort((a, b) => a.order - b.order);

    return {
      ...category,
      parent: parent ?? null,
      children,
      problems: enrichedProblems,
    };
  }

  async getCategoryDetailById(id: string, userId?: string): Promise<CategoryDetail> {
    const category = await this.taxonomyRepo.findCategoryById(id);
    if (!category) {
      throw AppError.notFound('Category not found');
    }

    const [parent, children, mappings] = await Promise.all([
      category.parentId
        ? this.taxonomyRepo.findCategoryById(category.parentId)
        : Promise.resolve(null),
      this.taxonomyRepo.findChildren(category.id),
      this.taxonomyRepo.getProblemMappings(category.id),
    ]);

    const problemIds = mappings.map((m) => m.problemId);
    const [problems, solvedIds] = await Promise.all([
      this.problemRepo.findManyByProblemIds(problemIds),
      userId ? this.taxonomyRepo.getSolvedProblemIds(userId, problemIds) : Promise.resolve(new Set<string>()),
    ]);

    const mappingDict = new Map(mappings.map(m => [m.problemId, m.order]));

    const enrichedProblems = problems.map(p => ({
      ...p,
      isSolved: solvedIds.has(p.problem_id),
      order: mappingDict.get(p.problem_id) ?? 0,
    })).sort((a, b) => a.order - b.order);

    return {
      ...category,
      parent: parent ?? null,
      children,
      problems: enrichedProblems,
    };
  }

  async invalidateUserProgress(_userId: string): Promise<void> {
    // No-op in the raw service, implemented in the Cache layer
  }
}

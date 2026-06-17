import { type ICradle } from '../../libs/awilix-container';
import { type ITaxonomyAdminRepository } from '../../repositories/taxonomy/taxonomy.admin.repository';
import { type ITaxonomyRepository } from '../../repositories/taxonomy/taxonomy.repository';
import { type IProblemRepository } from '../../repositories/problems/problem.repository';
import {
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
  type MapProblemPayload,
  type BatchMapProblemPayload,
  type CategoryTreeNode,
} from '../../types/taxonomy/taxonomy.types';
import { AppError } from '../../utils/app-error';
import { ERRORS } from '../../constants/errors';

export interface ITaxonomyAdminService {
  getAdminTree(): Promise<CategoryTreeNode[]>;
  getCategoryProblems(id: string): Promise<any>;
  createCategory(payload: CreateCategoryPayload): Promise<any>;
  updateCategory(id: string, payload: UpdateCategoryPayload): Promise<any>;
  deleteCategory(id: string): Promise<void>;
  mapProblemToCategory(payload: MapProblemPayload): Promise<void>;
  batchMapProblemsToCategory(payload: BatchMapProblemPayload): Promise<void>;
  unmapProblemFromCategory(categoryId: string, problemId: string): Promise<void>;
}

export class TaxonomyAdminService implements ITaxonomyAdminService {
  private readonly taxonomyAdminRepo: ITaxonomyAdminRepository;
  private readonly taxonomyRepo: ITaxonomyRepository;
  private readonly problemRepo: IProblemRepository;

  constructor({ taxonomyAdminRepository, taxonomyRepository, problemRepository }: ICradle) {
    this.taxonomyAdminRepo = taxonomyAdminRepository;
    this.taxonomyRepo = taxonomyRepository;
    this.problemRepo = problemRepository;
  }

  async getCategoryProblems(id: string): Promise<any> {
    return this.taxonomyRepo.getProblemMappings(id);
  }

  async getAdminTree(): Promise<CategoryTreeNode[]> {
    const [allCategories, countMap] = await Promise.all([
      this.taxonomyRepo.findAllCategories(),
      this.taxonomyRepo.getAllProblemCounts(),
    ]);

    const nodeMap = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    for (const cat of allCategories) {
      nodeMap.set(cat.id, {
        ...cat,
        children: [],
        problemCount: countMap.get(cat.id) ?? 0,
      });
    }

    for (const node of Array.from(nodeMap.values())) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async createCategory(payload: CreateCategoryPayload): Promise<any> {
    const existing = await this.taxonomyRepo.findCategoryBySlug(payload.slug);
    if (existing) {
      throw AppError.conflict(`A category with slug "${payload.slug}" already exists`);
    }
    return this.taxonomyAdminRepo.createCategory(payload);
  }

  async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<any> {
    const existing = await this.taxonomyRepo.findCategoryById(id);
    if (!existing) {
      throw AppError.notFound('Category not found');
    }

    if (payload.slug && payload.slug !== existing.slug) {
      const existingSlug = await this.taxonomyRepo.findCategoryBySlug(payload.slug);
      if (existingSlug) {
        throw AppError.conflict(`A category with slug "${payload.slug}" already exists`);
      }
    }

    if (payload.parentId === id) {
      throw AppError.badRequest('A category cannot be its own parent');
    }

    return this.taxonomyAdminRepo.updateCategory(id, payload);
  }

  async deleteCategory(id: string): Promise<void> {
    const existing = await this.taxonomyRepo.findCategoryById(id);
    if (!existing) {
      throw AppError.notFound('Category not found');
    }

    await this.taxonomyAdminRepo.deleteCategory(id);
  }

  async mapProblemToCategory(payload: MapProblemPayload): Promise<void> {
    const [category, problem] = await Promise.all([
      this.taxonomyRepo.findCategoryById(payload.categoryId),
      this.problemRepo.findByProblemId(payload.problemId),
    ]);

    if (!category) throw AppError.notFound('Category not found');
    if (!problem) throw AppError.from(ERRORS.PROBLEM.NOT_FOUND);

    await this.taxonomyAdminRepo.mapProblem({
      categoryId: payload.categoryId,
      problemId: payload.problemId,
      order: payload.order ?? 0,
    });
  }

  async batchMapProblemsToCategory(payload: BatchMapProblemPayload): Promise<void> {
    const category = await this.taxonomyRepo.findCategoryById(payload.categoryId);
    if (!category) throw AppError.notFound('Category not found');

    const mappings = payload.mappings.map((m: { problemId: string; order?: number }) => ({
      categoryId: payload.categoryId,
      problemId: m.problemId,
      order: m.order ?? 0,
    }));

    await this.taxonomyAdminRepo.batchMapProblems(mappings);
  }

  async unmapProblemFromCategory(categoryId: string, problemId: string): Promise<void> {
    await this.taxonomyAdminRepo.unmapProblem(categoryId, problemId);
  }
}

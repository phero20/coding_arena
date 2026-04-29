import { type Category } from '../../db/schema';

/**
 * Recursive structure for the Category Tree (Mind Map).
 */
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  problemCount: number;
}

/**
 * Detailed view of a category, including its parent, children, and enriched problems.
 */
export interface CategoryDetail extends Category {
  parent: Category | null;
  children: Category[];
  problems: any[]; // Enriched with Mongo problem data
}

/**
 * Payload for mapping a problem to a category.
 */
export interface MapProblemPayload {
  categoryId: string;
  problemId: string;
  order?: number;
}

/**
 * Payload for creating a new category.
 */
export interface CreateCategoryPayload {
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  order?: number;
}

// Route param shapes for controller typing
export interface SlugParams {
  slug: string;
}

export interface MapParams {
  categoryId: string;
  problemId: string;
}

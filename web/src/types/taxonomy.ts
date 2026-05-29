import { Problem } from "./api";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  order: number;
  problemCount: number;
  solvedCount: number;
  createdAt: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CategoryDetail extends Category {
  problems: Problem[];
  parent: Category | null;
  breadcrumbs: Category[];
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  order?: number;
}

export interface MapProblemPayload {
  categoryId: string;
  problemId: string;
  order?: number;
}

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getTaxonomyTree,
  getCategoryDetail,
  getCategoryDetailById,
  getUserRoadmapProgress,
} from "@/services/queries/taxonomy.queries";

/**
 * Hook to fetch the full hierarchical taxonomy tree.
 */
export function useTaxonomyTreeQuery() {
  return useQuery({
    queryKey: ["taxonomy-tree"],
    queryFn: getTaxonomyTree,
    staleTime: 1000 * 60 * 30, // 30 minutes cache for static tree
  });
}

/**
 * Hook to fetch the current user's roadmap progress.
 */
export function useUserRoadmapProgressQuery(isLoggedIn: boolean = true) {
  return useQuery({
    queryKey: ["user-roadmap-progress"],
    queryFn: getUserRoadmapProgress,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 2, // 2 minutes cache for progress
  });
}

/**
 * Hook to fetch detail for a specific category.
 */
export function useCategoryDetailQuery(slug: string) {
  return useQuery({
    queryKey: ["category-detail", slug],
    queryFn: () => getCategoryDetail(slug),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch detail for a specific category by ID.
 */
export function useCategoryDetailByIdQuery(id: string | null) {
  return useQuery({
    queryKey: ["category-detail-id", id],
    queryFn: () => getCategoryDetailById(id!),
    enabled: !!id,
  });
}

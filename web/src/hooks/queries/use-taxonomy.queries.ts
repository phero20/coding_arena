"use client";

import { useQuery } from "@tanstack/react-query";
import { getTaxonomyTree, getCategoryDetail } from "@/services/queries/taxonomy.queries";

/**
 * Hook to fetch the full hierarchical taxonomy tree.
 */
export function useTaxonomyTreeQuery() {
  return useQuery({
    queryKey: ["taxonomy-tree"],
    queryFn: getTaxonomyTree,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
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

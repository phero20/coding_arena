"use client";

import { useMemo } from "react";
import { useTaxonomyTreeQuery, useUserRoadmapProgressQuery } from "../queries/use-taxonomy.queries";
import { useUser } from "@clerk/nextjs";
import type { CategoryTreeNode } from "@/types/taxonomy";

/**
 * Custom hook to fetch and hydrate the roadmap tree with user progress.
 * Performs recursive bottom-up aggregation of solved counts in-memory.
 */
export function useRoadmapData(initialTreeData?: CategoryTreeNode[]) {
  const { isSignedIn } = useUser();
  const { data: tree, isLoading: isTreeLoading, error: treeError } = useTaxonomyTreeQuery(initialTreeData);
  const { data: progressMap, isLoading: isProgressLoading } = useUserRoadmapProgressQuery(!!isSignedIn);

  const hydratedTree = useMemo(() => {
    if (!tree) return null;

    /**
     * Recursive function to sum up solved counts from leaves to roots.
     * @param node The current category node
     * @param progress A flat map of { categoryId: solvedCount }
     */
    const hydrateNode = (node: CategoryTreeNode, progress: Record<string, number>): { node: CategoryTreeNode; totalSolved: number } => {
      // 1. Get direct solved count for this specific node
      const directSolved = progress[node.id] || 0;

      // 2. Recursively hydrate children and sum their solved counts
      let childrenSolvedTotal = 0;
      const hydratedChildren = (node.children || []).map((child) => {
        const { node: hChild, totalSolved } = hydrateNode(child, progress);
        childrenSolvedTotal += totalSolved;
        return hChild;
      });

      // 3. The total solved for this branch is direct + all children
      const totalSolvedInBranch = directSolved + childrenSolvedTotal;

      return {
        node: {
          ...node,
          children: hydratedChildren,
          solvedCount: totalSolvedInBranch,
        },
        totalSolved: totalSolvedInBranch,
      };
    };

    const currentProgress = progressMap?.counts || {};
    return tree.map((root: CategoryTreeNode) => hydrateNode(root, currentProgress).node);
  }, [tree, progressMap]);

  const solvedIdsSet = useMemo(() => new Set(progressMap?.solvedIds || []), [progressMap]);

  return {
    data: hydratedTree,
    solvedIds: solvedIdsSet,
    isLoading: isTreeLoading || isProgressLoading,
    error: treeError,
  };
}

import { useMemo } from "react";
import { TrackConfigResponse } from "@/types/academy";

export function useCurriculumLayout(config: TrackConfigResponse) {
  return useMemo(() => {
    const rawConcepts = config.concepts || [];
    const exercises = config.exercises?.concept || [];

    // 1. Load all concepts available in the language track
    const nodesMap = new Map<string, { id: string; label: string }>();
    rawConcepts.forEach((c: any) => {
      nodesMap.set(c.slug, { id: c.slug, label: c.name });
    });

    // 2. Build Adjacency List for topological sorting (and reverse list for layout heuristic)
    const adj = new Map<string, string[]>();
    const reverseAdj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodesMap.forEach((_, slug) => {
      adj.set(slug, []);
      reverseAdj.set(slug, []);
      inDegree.set(slug, 0);
    });

    exercises.forEach((ex: any) => {
      const taught: string[] = ex.concepts || [];
      const required: string[] = ex.prerequisites || [];

      taught.forEach((t: string) => {
        required.forEach((r: string) => {
          if (adj.has(r) && adj.has(t)) {
            adj.get(r)!.push(t);
            reverseAdj.get(t)!.push(r);
            inDegree.set(t, inDegree.get(t)! + 1);
          }
        });
      });
    });

    // Determine which nodes are completely disconnected (Orphans)
    const orphanNodes: { id: string; label: string }[] = [];
    const connectedNodesSet = new Set<string>();
    let totalEdges = 0;

    inDegree.forEach((degree, slug) => {
      const outDegree = adj.get(slug)?.length || 0;
      totalEdges += outDegree;
      
      if (degree === 0 && outDegree === 0) {
        orphanNodes.push(nodesMap.get(slug)!);
      } else {
        connectedNodesSet.add(slug);
      }
    });

    // If there are no edges, there's no real graph to show
    const showGraph = totalEdges > 0;

    // 3. Compute Ranks using Longest Path algorithm (so siblings align perfectly)
    const ranks = new Map<string, number>();
    const q: string[] = [];

    // Start with root nodes (no prerequisites) BUT exclude orphans
    inDegree.forEach((degree, slug) => {
      if (degree === 0 && connectedNodesSet.has(slug)) {
        q.push(slug);
        ranks.set(slug, 0);
      }
    });

    while (q.length > 0) {
      const curr = q.shift()!;
      const currentRank = ranks.get(curr)!;

      const neighbors = adj.get(curr) || [];
      neighbors.forEach(n => {
        // Only update and re-queue if we found a strictly longer path
        const newRank = currentRank + 1;
        if ((ranks.get(n) || -1) < newRank) {
          ranks.set(n, newRank);
          q.push(n);
        }
      });
    }

    // 4. Group connected nodes into levels (rows)
    const maxRank = Math.max(-1, ...Array.from(ranks.values()));
    const levels: { id: string; label: string }[][] = [];

    for (let i = 0; i <= maxRank; i++) {
      const levelNodes: { id: string; label: string }[] = [];
      ranks.forEach((rank, slug) => {
        if (rank === i) {
          levelNodes.push(nodesMap.get(slug)!);
        }
      });
      levels.push(levelNodes);
    }

    // 5. Barycenter Heuristic Sorting for the connected graph
    for (let i = 1; i <= maxRank; i++) {
      levels[i].sort((a, b) => {
        const getBarycenter = (nodeId: string) => {
          let sum = 0;
          let count = 0;
          const parents = reverseAdj.get(nodeId) || [];

          for (const p of parents) {
            const pRank = ranks.get(p);
            if (pRank !== undefined && pRank < i) {
              const pIndex = levels[pRank].findIndex(n => n.id === p);
              if (pIndex !== -1) {
                const normalizedPos = levels[pRank].length > 1
                  ? pIndex / (levels[pRank].length - 1)
                  : 0.5;
                sum += normalizedPos;
                count++;
              }
            }
          }
          return count === 0 ? 0.5 : sum / count;
        };

        const baryA = getBarycenter(a.id);
        const baryB = getBarycenter(b.id);

        if (baryA === baryB) {
          return 0;
        }
        return baryA - baryB;
      });
    }

    // 6. Append dynamic artificial phases for the leftover Orphan nodes!
    // We chunk them into groups of 3 to create a steady, gamified linear path
    const CHUNK_SIZE = 3;
    for (let i = 0; i < orphanNodes.length; i += CHUNK_SIZE) {
      levels.push(orphanNodes.slice(i, i + CHUNK_SIZE));
    }

    const allEdges: { source: string, target: string }[] = [];
    adj.forEach((children, parent) => {
      children.forEach(child => {
        allEdges.push({ source: parent, target: child });
      });
    });

    // Transitive Reduction (removes redundant crossing lines)
    const hasPath = (start: string, target: string, excludeDirect: boolean = false): boolean => {
      const visited = new Set<string>();
      const dfs = (current: string, isFirstStep: boolean): boolean => {
        if (current === target && !isFirstStep) return true;
        if (visited.has(current)) return false;
        visited.add(current);
        const neighbors = adj.get(current) || [];
        for (const n of neighbors) {
          if (isFirstStep && n === target && excludeDirect) continue;
          if (dfs(n, false)) return true;
        }
        return false;
      };
      return dfs(start, true);
    };

    const reducedEdges = allEdges.filter(e => !hasPath(e.source, e.target, true));

    return { levels, edges: reducedEdges, showGraph };
  }, [config]);
}

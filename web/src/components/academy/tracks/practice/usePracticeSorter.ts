import { useMemo } from "react";
import type { PracticeExercise } from "@/types/academy";

export interface TrackExercises {
  concept?: any[];
  practice?: PracticeExercise[];
}

/**
 * Stable sorter that reproduces Exercism's anonymous ordering:
 * Step A: gateway practice(s) first (no prerequisites) sorted by difficulty asc, then authored order
 * Step B: all concept exercises in authored order (skip deprecated)
 * Step C: remaining practice exercises sorted by difficulty asc, then authored order (skip deprecated)
 */
export interface UsePracticeSorterOptions {
  query?: string;
}

export function usePracticeSorter(exercises?: TrackExercises, options?: UsePracticeSorterOptions) {
  return useMemo(() => {
    const concepts = exercises?.concept ?? [];
    const practices = exercises?.practice ?? [];

    const isDeprecated = (p: any) => p?.status === "deprecated";

    // Final linear ordering to return
    const final: any[] = [];

    // Helper: treat missing difficulty as very large so it sorts last
    const difficultyOf = (p: any) => (typeof p?.difficulty === "number" ? p.difficulty : Number.MAX_SAFE_INTEGER);

    // Keep original authored index to preserve tie-break ordering
    const practicesWithIndex = practices.map((p, i) => ({ p, i }));

    // Step A: gateway practices (no prerequisites), but only treat as gateway
    // when their difficulty is at-or-below the gateway threshold. Higher-difficulty
    // zero-prereq practices will be sorted with the remaining practices.
    const GATEWAY_MAX_DIFFICULTY = 2;
    const zeroPrereq = practicesWithIndex
      .filter(({ p }) => !isDeprecated(p) && (!p?.prerequisites || p.prerequisites.length === 0) && difficultyOf(p) <= GATEWAY_MAX_DIFFICULTY)
      .sort((a, b) => {
        const da = difficultyOf(a.p) - difficultyOf(b.p);
        return da !== 0 ? da : a.i - b.i;
      });

    for (const { p } of zeroPrereq) {
      final.push({ ...p, kind: "practice", available: true });
    }

    // Step B: all concept exercises in authored order (skip deprecated)
    for (const c of concepts) {
      if (!isDeprecated(c)) final.push({ ...c, kind: "concept" });
    }

    // Step C: remaining practice exercises (have prerequisites OR are high-difficulty
    // zero-prereq items), sorted by difficulty asc then authored order.
    const remaining = practicesWithIndex
      .filter(({ p }) => !isDeprecated(p) && ((!!p?.prerequisites && p.prerequisites.length > 0) || ((!p?.prerequisites || p.prerequisites.length === 0) && difficultyOf(p) > GATEWAY_MAX_DIFFICULTY)))
      .sort((a, b) => {
        const da = difficultyOf(a.p) - difficultyOf(b.p);
        return da !== 0 ? da : a.i - b.i;
      });

    for (const { p } of remaining) {
      final.push({ ...p, kind: "practice", available: false });
    }

    // Name-only case-insensitive search
    const q = (options?.query ?? "").trim().toLowerCase();
    if (!q) return final;

    return final.filter((item) => {
      const name = `${item.name ?? ""}`.toLowerCase();
      return name.includes(q);
    });
  }, [exercises?.practice, exercises?.concept, options?.query]);
}

export default usePracticeSorter;
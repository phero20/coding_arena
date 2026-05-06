import { useState, useMemo } from "react";
import type { Problem } from "@/types/api";
import type { DifficultyFilter } from "@/components/practice/ProblemFilters";

export function useProblemFilters(
  initialProblems: Problem[],
  setPage: React.Dispatch<React.SetStateAction<number>>
) {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");

  const filteredProblems = useMemo(() => {
    let list = initialProblems || [];

    if (difficultyFilter !== "All") {
      list = list.filter((p) => p.difficulty === difficultyFilter);
    }

    if (topicFilter.trim()) {
      const t = topicFilter.toLowerCase();
      list = list.filter((p) =>
        p.topics.some((topic) => topic.toLowerCase().includes(t)),
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.problem_slug.toLowerCase().includes(q),
      );
    }

    return list;
  }, [initialProblems, difficultyFilter, topicFilter, search]);

  const resetFilters = () => {
    setPage(1);
    setSearch("");
    setDifficultyFilter("All");
    setTopicFilter("");
  };

  return {
    // State
    search,
    setSearch,
    topicFilter,
    setTopicFilter,
    difficultyFilter,
    setDifficultyFilter,
    
    // Computed
    filteredProblems,

    // Actions
    resetFilters,
  };
}

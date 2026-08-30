"use client";

import { useMemo, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import type { PracticeProblemListProps } from "@/types/component.types";
import { useInfiniteProblemsQuery } from "@/hooks/queries/use-problem.queries";
import { useCreateArena, useUpdateArenaProblem } from "@/hooks/arena/use-arena-actions";
import { useDebounce } from "@/hooks/shared/use-debounce";
import type { DifficultyFilter } from "@/components/practice/ProblemFilters";
import { useProblemSelectionHandler } from "@/hooks/practice/use-problem-selection";

// Sub-components
import { ArenaSelectionBanner } from "./ArenaSelectionBanner";
import { ProblemFilters } from "./ProblemFilters";
import { ProblemTable } from "./ProblemTable";
// LanguageSelectDialog removed as language selection is now per-player

export const PracticeProblemList: React.FC<PracticeProblemListProps & { initialData?: any }> = ({
  isSelectPage = false,
  roomId,
  initialData,
}) => {
  const { hostArena, isHosting } = useCreateArena();
  const { updateProblem, isUpdating } = useUpdateArenaProblem(roomId || "");

  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");

  const debouncedSearch = useDebounce(search, 500);
  const debouncedTopic = useDebounce(topicFilter, 500);

  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage 
  } = useInfiniteProblemsQuery(20, { 
    search: debouncedSearch, 
    topic: debouncedTopic, 
    difficulty: difficultyFilter 
  }, initialData);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading]);

  // Flatten the infinite pages into a single array
  const allProblems = useMemo(() => {
    const problems = data?.pages.flatMap((page) => page.problems) || [];
    return problems;
  }, [data]);

  const handleResetFilters = () => {
    setSearch("");
    setDifficultyFilter("All");
    setTopicFilter("");
  };

  const {
    selectingId,
    openLanguageSelect,
  } = useProblemSelectionHandler({
    roomId,
    updateProblem,
    hostArena
  });

  return (
    <section className="space-y-6">
      {isSelectPage && <ArenaSelectionBanner roomId={roomId} />}

      <ProblemFilters
        search={search}
        setSearch={setSearch}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        topicFilter={topicFilter}
        setTopicFilter={setTopicFilter}
        onReset={handleResetFilters}
        isSelectPage={isSelectPage}
      />

      <ProblemTable
        problems={allProblems}
        isLoading={isLoading}
        error={error}
        isSelectPage={isSelectPage}
        onSelect={openLanguageSelect}
        selectingId={selectingId}
        isHosting={isHosting}
        isUpdating={isUpdating}
        topicFilter={topicFilter}
        onRetry={refetch}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="py-4 flex justify-center w-full">
        {!hasNextPage && allProblems.length > 0 && !isLoading && (
          <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
            You've reached the end of the list.
          </p>
        )}
      </div>

    </section>
  );
};

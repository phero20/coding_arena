"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import type { PracticeProblemListProps } from "@/types/component.types";
import { toast } from "sonner";
import { useProblemsQuery, useInfiniteProblemsQuery } from "@/hooks/queries/use-problem.queries";
import { useCreateArena, useUpdateArenaProblem } from "@/hooks/arena/use-arena-actions";
import { useProblemFilters } from "@/hooks/practice/use-problem-filters";
import { useProblemSelectionHandler } from "@/hooks/practice/use-problem-selection";
import type { Problem } from "@/types/api";

// Sub-components
import { ArenaSelectionBanner } from "./ArenaSelectionBanner";
import { ProblemFilters, type DifficultyFilter } from "./ProblemFilters";
import { ProblemTable } from "./ProblemTable";
import { ProblemPagination } from "./ProblemPagination";
import { LanguageSelectDialog } from "./LanguageSelectDialog";

export const PracticeProblemList: React.FC<PracticeProblemListProps> = ({
  isSelectPage = false,
  roomId,
}) => {
  const router = useRouter();
  const { hostArena, isHosting } = useCreateArena();
  const { updateProblem, isUpdating } = useUpdateArenaProblem(roomId || "");

  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage 
  } = useInfiniteProblemsQuery(20);

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

  const {
    search,
    setSearch,
    topicFilter,
    setTopicFilter,
    difficultyFilter,
    setDifficultyFilter,
    filteredProblems,
    resetFilters: handleResetFilters
  } = useProblemFilters(allProblems, () => {}); 

  const {
    selectingId,
    isDialogOpen,
    setIsDialogOpen,
    selectedLanguage,
    setSelectedLanguage,
    selectedProblemForArena,
    openLanguageSelect,
    handleConfirmSelection
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
        problems={filteredProblems}
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

      <LanguageSelectDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        problem={selectedProblemForArena}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        onConfirm={handleConfirmSelection}
        isActionLoading={isHosting || isUpdating}
      />
    </section>
  );
};

"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PracticeProblemListProps } from "@/types/component.types";
import { toast } from "sonner";
import { useProblemsQuery } from "@/hooks/queries/use-problem.queries";
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

  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useProblemsQuery(page, 20); 
  const problems = data?.problems;
  const meta = data?.meta;
  
  const {
    search,
    setSearch,
    topicFilter,
    setTopicFilter,
    difficultyFilter,
    setDifficultyFilter,
    filteredProblems,
    resetFilters: handleResetFilters
  } = useProblemFilters(problems || [], setPage);

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
      />

      {meta && (
        <ProblemPagination
          page={page}
          totalPages={meta.totalPages}
          setPage={setPage}
        />
      )}

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

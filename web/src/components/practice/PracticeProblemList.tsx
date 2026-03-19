"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProblems } from "@/hooks/use-problems";
import { useCreateArena } from "@/hooks/use-arena-actions";
import { arenaService } from "@/services/arena.service";
import type { Problem } from "@/types/api";

// Sub-components
import { ArenaSelectionBanner } from "./ArenaSelectionBanner";
import { ProblemFilters, type DifficultyFilter } from "./ProblemFilters";
import { ProblemTable } from "./ProblemTable";
import { ProblemPagination } from "./ProblemPagination";
import { LanguageSelectDialog } from "./LanguageSelectDialog";

interface PracticeProblemListProps {
  isSelectPage?: boolean;
  roomId?: string;
}

export const PracticeProblemList: React.FC<PracticeProblemListProps> = ({
  isSelectPage = false,
  roomId,
}) => {
  const router = useRouter();
  const { hostArena, isHosting } = useCreateArena();
  
  // Filtering & Pagination State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");

  // Selection & Loading State
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  
  // Language Selection Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedProblemForArena, setSelectedProblemForArena] = useState<Problem | null>(null);

  const { problems, meta, isLoading, error } = useProblems(page, 20);

  const filteredProblems = useMemo(() => {
    let list = problems;

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
  }, [problems, difficultyFilter, topicFilter, search]);

  const handleResetFilters = () => {
    setPage(1);
    setSearch("");
    setDifficultyFilter("All");
    setTopicFilter("");
  };

  const openLanguageSelect = (problem: Problem) => {
    setSelectedProblemForArena(problem);
    const availableLangs = problem.code_snippets ? Object.keys(problem.code_snippets) : [];
    setSelectedLanguage(availableLangs[0] || "javascript");
    setIsDialogOpen(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedProblemForArena) return;
    const problem = selectedProblemForArena;
    
    setSelectingId(problem.problem_id);
    setIsDialogOpen(false);

    if (roomId) {
      setIsUpdating(true);
      try {
        await arenaService.updateRoomProblem(roomId, {
          problemId: problem.problem_id,
          problemSlug: problem.problem_slug,
          difficulty: problem.difficulty,
          language: selectedLanguage,
        });

        toast.success("Problem updated successfully!");
        router.push(`/arena/${roomId}`);
      } catch (error: any) {
        toast.error(error.message || "Failed to update problem");
        setIsUpdating(false);
        setSelectingId(null);
      }
    } else {
      hostArena({
        problemId: problem.problem_id,
        problemSlug: problem.problem_slug,
        difficulty: problem.difficulty,
        language: selectedLanguage,
      });
    }
  };

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

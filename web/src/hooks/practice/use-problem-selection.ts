import { useState } from "react";
import type { Problem } from "@/types/api";

export interface UseProblemSelectionHandlerProps {
  roomId?: string;
  updateProblem: (params: any, options?: any) => void;
  hostArena: (params: any) => void;
}

export function useProblemSelectionHandler({
  roomId,
  updateProblem,
  hostArena,
}: UseProblemSelectionHandlerProps) {
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedProblemForArena, setSelectedProblemForArena] = useState<Problem | null>(null);

  const openLanguageSelect = (problem: Problem) => {
    setSelectedProblemForArena(problem);
    const availableLangs = problem.code_snippets
      ? Object.keys(problem.code_snippets)
      : [];
    setSelectedLanguage(availableLangs[0] || "javascript");
    setIsDialogOpen(true);
  };

  const handleConfirmSelection = () => {
    if (!selectedProblemForArena) return;
    const problem = selectedProblemForArena;

    setSelectingId(problem.problem_id);
    setIsDialogOpen(false);

    if (roomId) {
      updateProblem({
        problemId: problem.problem_id,
        problemSlug: problem.problem_slug,
        difficulty: problem.difficulty,
        language: selectedLanguage,
      }, {
        onSettled: () => setSelectingId(null)
      });
    } else {
      hostArena({
        problemId: problem.problem_id,
        problemSlug: problem.problem_slug,
        difficulty: problem.difficulty,
        language: selectedLanguage,
      });
      // SelectingId is cleared if needed elsewhere or via navigating away
    }
  };

  return {
    selectingId,
    isDialogOpen,
    setIsDialogOpen,
    selectedLanguage,
    setSelectedLanguage,
    selectedProblemForArena,
    openLanguageSelect,
    handleConfirmSelection,
  };
}

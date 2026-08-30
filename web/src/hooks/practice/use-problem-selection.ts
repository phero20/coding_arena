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
  const [selectedProblemForArena, setSelectedProblemForArena] = useState<Problem | null>(null);

  const openLanguageSelect = (problem: Problem) => {
    setSelectedProblemForArena(problem);
    
    // We no longer need to select a language at the room level
    // Directly trigger the room creation / update
    setSelectingId(problem.problem_id);

    if (roomId) {
      updateProblem({
        problemId: problem.problem_id,
        problemSlug: problem.problem_slug,
        difficulty: problem.difficulty,
      }, {
        onSettled: () => setSelectingId(null)
      });
    } else {
      hostArena({
        problemId: problem.problem_id,
        problemSlug: problem.problem_slug,
        difficulty: problem.difficulty,
      });
    }
  };

  const handleConfirmSelection = () => {}; // Kept for backwards compatibility if needed, but unused

  return {
    selectingId,
    isDialogOpen: false,
    setIsDialogOpen: () => {},
    selectedLanguage: "",
    setSelectedLanguage: () => {},
    selectedProblemForArena,
    openLanguageSelect,
    handleConfirmSelection,
  };
}

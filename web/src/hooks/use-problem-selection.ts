"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Problem } from "@/types/api";
import { arenaService } from "@/services/arena.service";
import { useCreateArena } from "./use-arena-actions";

interface UseProblemSelectionOptions {
  roomId?: string;
}

export function useProblemSelection({ roomId }: UseProblemSelectionOptions = {}) {
  const router = useRouter();
  const { hostArena, isHosting } = useCreateArena();
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = async (problem: Problem) => {
    setSelectingId(problem.problem_id);
    
    if (roomId) {
      setIsUpdating(true);
      try {
        await arenaService.updateRoomProblem(roomId, {
          problemId: problem.problem_id,
          problemSlug: problem.problem_slug,
          difficulty: problem.difficulty,
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
      });
    }
  };

  return {
    handleSelect,
    selectingId,
    isLoading: isHosting || isUpdating,
  };
}

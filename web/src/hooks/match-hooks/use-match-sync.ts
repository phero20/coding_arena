import { useState, useMemo, useEffect } from "react";
import { useArenaStore } from "@/store/useArenaStore";
import { useShallow } from "zustand/react/shallow";
import { useUser } from "@clerk/nextjs";

interface UseMatchSyncProps {
  submitStatus?: string;
  submitTests?: any[];
  isArena?: boolean;
}

export const useMatchSync = ({
  submitStatus,
  submitTests,
  isArena,
}: UseMatchSyncProps) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"code" | "testcase" | "result">("code");

  const { room, leaderboard, matchEnded, finalRankings, setMatchEnded } = useArenaStore(
    useShallow((state) => ({
      room: state.room,
      leaderboard: state.leaderboard,
      matchEnded: state.matchEnded,
      finalRankings: state.finalRankings,
      setMatchEnded: state.setMatchEnded,
    }))
  );


  const handleCloseMatchEnd = (onExit?: () => void) => {
    setMatchEnded(false, []);
    if (onExit) onExit();
  };

  return {
    activeTab,
    setActiveTab,
    room,
    leaderboard,
    matchEnded,
    finalRankings,
    currentUser: user,
    handleCloseMatchEnd,
  };
};

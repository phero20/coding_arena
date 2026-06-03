"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useArenaRoom } from "./use-arena-room";
import { useLeaveArena } from "./use-arena-actions";

export function useArenaLobby(roomId: string) {
  const { userId } = useAuth();
  const [copied, setCopied] = useState(false);

  // 1. [SELF-SERVING] The hook retrieves its own data
  const {
    room,
    isConnected,
    isStartingMatch,
    startMatch,
    isLoading: isRoomLoading,
    error,
    sendMessage
  } = useArenaRoom(roomId);

  // 2. Players sorting & derived info
  const players = Object.values(room?.players || {}).sort((a, b) => {
    const dateA = new Date(a.joinedAt).getTime();
    const dateB = new Date(b.joinedAt).getTime();
    return dateA - dateB;
  });

  const currentPlayer = userId ? room?.players[userId] : null;
  const isHost = currentPlayer?.isCreator;
  const canStartMatch = players.length >= 2;

  // 3. Invite Code Logic
  const copyInviteCode = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 4. Coordination Logic
  const leaveArenaAction = useLeaveArena();
  const leaveRoom = () => {
    leaveArenaAction(true); // Hard-kill session cache on explicit exit
  };

  const updateMatchDuration = (durationStr: string) => {
    const duration = parseInt(durationStr, 10);
    sendMessage("UPDATE_MATCH_DURATION", { duration });
  };

  const kickPlayer = (targetUserId: string) => {
    sendMessage("KICK_PLAYER", { targetUserId });
  };

  return {
    // Data
    room,
    players,
    currentPlayer,
    isHost,
    isConnected,
    isStartingMatch,
    isLoading: isRoomLoading,
    error,
    
    // Derived
    canStartMatch,
    copied,

    // Actions
    startMatch,
    copyInviteCode,
    leaveRoom,
    updateMatchDuration,
    kickPlayer,
  };
}

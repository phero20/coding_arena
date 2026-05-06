"use client";

import { useState, type FormEvent } from "react";
import { useJoinArena } from "@/hooks/arena/use-arena-actions";

/**
 * Hook to manage the Join Arena form logic.
 * @returns {object} { roomId, setRoomId, isJoining, handleSubmit, canSubmit }
 */
export function useJoinArenaForm() {
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { joinArena } = useJoinArena();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedRoomId = roomId.trim();
    if (!trimmedRoomId || isJoining) return;

    setIsJoining(true);
    try {
      await joinArena(trimmedRoomId);
    } finally {
      setIsJoining(false);
    }
  };

  const canSubmit = roomId.trim().length > 0 && !isJoining;

  return {
    roomId,
    setRoomId,
    isJoining,
    handleSubmit,
    canSubmit,
  };
}

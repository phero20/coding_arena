"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { arenaService } from "@/services/arena.service";
import { toast } from "sonner";

export function useCreateArena() {
  const router = useRouter();

  const mutation = useMutation({
    mutationKey: ["create-arena"],
    mutationFn: (params?: {
      problemId: string;
      problemSlug: string;
      difficulty: string;
      language?: string;
    }) => arenaService.createRoom(params),
    onSuccess: (room) => {
      toast.success("Arena Room Created!");
      router.push(`/arena/${room.roomId}`);
    },
    onError: (err) => {
      console.error("Host Arena Error:", err);
      toast.error("Failed to create arena room");
    },
  });

  return {
    hostArena: (params?: {
      problemId: string;
      problemSlug: string;
      difficulty: string;
      language?: string;
    }) => mutation.mutate(params as any),
    isHosting: mutation.isPending,
    error: mutation.error as Error | null,
  };
}

export function useJoinArena() {
  const router = useRouter();

  const joinArena = (roomId: string) => {
    const cleanId = roomId.toUpperCase().trim();
    if (!cleanId) {
      toast.error("Please enter a valid Invite Code");
      return;
    }
    router.push(`/arena/${cleanId}`);
  };

  return {
    joinArena,
  };
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { submissionService } from "@/services/submission.service";

interface UseUserSubmissionsProps {
  problemId: string;
  enabled?: boolean;
}

export function useUserSubmissions({
  problemId,
  enabled = true,
}: UseUserSubmissionsProps) {
  return useQuery({
    queryKey: ["submissions", problemId],
    queryFn: () => submissionService.getUserSubmissions(problemId),
    enabled: !!problemId && enabled,
    staleTime: 30000, // 30 seconds
  });
}

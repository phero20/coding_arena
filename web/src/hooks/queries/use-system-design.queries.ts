"use client";

import { useQuery } from "@tanstack/react-query";
import { getSystemDesignTopics, getSystemDesignTopicContent } from "@/services/queries/system-design.queries";
import type { SystemDesignTopic, SystemDesignTopicContent } from "@/types/system-design";

/**
 * Hook to fetch all system design topics for the sidebar navigation.
 */
export function useSystemDesignTopicsQuery() {
  return useQuery<SystemDesignTopic[], Error>({
    queryKey: ["system-design-topics"],
    queryFn: getSystemDesignTopics,
    staleTime: Infinity, // Topics rarely change, cache indefinitely in the browser
  });
}

/**
 * Hook to fetch the specific markdown content for a topic.
 */
export function useSystemDesignTopicContentQuery(slug: string) {
  return useQuery<SystemDesignTopicContent, Error>({
    queryKey: ["system-design-topic-content", slug],
    queryFn: () => getSystemDesignTopicContent(slug),
    staleTime: Infinity, // The static markdown won't change during the session
    enabled: !!slug, // Only run the query if a slug is provided
  });
}

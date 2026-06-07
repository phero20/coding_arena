import { useQuery } from "@tanstack/react-query";
import { 
  getSitemapProblems, 
  getSitemapAcademyTracks, 
  getSitemapAcademyExercises, 
  getSitemapSystemDesignLessons, 
  getSitemapCompanyTags, 
  getSitemapUsers 
} from "@/services/queries/seo.queries";

export const SEO_QUERY_KEYS = {
  problems: ["seo", "sitemap", "problems"] as const,
  academyTracks: ["seo", "sitemap", "academy-tracks"] as const,
  academyExercises: ["seo", "sitemap", "academy-exercises"] as const,
  systemDesignLessons: ["seo", "sitemap", "system-design-lessons"] as const,
  companyTags: ["seo", "sitemap", "company-tags"] as const,
  users: ["seo", "sitemap", "users"] as const,
};

export function useSitemapProblems() {
  return useQuery({
    queryKey: SEO_QUERY_KEYS.problems,
    queryFn: getSitemapProblems,
  });
}

export function useSitemapAcademyTracks() {
  return useQuery({
    queryKey: SEO_QUERY_KEYS.academyTracks,
    queryFn: getSitemapAcademyTracks,
  });
}

export function useSitemapAcademyExercises() {
  return useQuery({
    queryKey: SEO_QUERY_KEYS.academyExercises,
    queryFn: getSitemapAcademyExercises,
  });
}

export function useSitemapSystemDesignLessons() {
  return useQuery({
    queryKey: SEO_QUERY_KEYS.systemDesignLessons,
    queryFn: getSitemapSystemDesignLessons,
  });
}

export function useSitemapCompanyTags() {
  return useQuery({
    queryKey: SEO_QUERY_KEYS.companyTags,
    queryFn: getSitemapCompanyTags,
  });
}

export function useSitemapUsers() {
  return useQuery({
    queryKey: SEO_QUERY_KEYS.users,
    queryFn: getSitemapUsers,
  });
}

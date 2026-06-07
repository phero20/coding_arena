import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { 
  SitemapProblem, 
  SitemapAcademyTrack, 
  SitemapAcademyExercise, 
  SitemapSystemDesignLesson, 
  SitemapCompanyTag, 
  SitemapUser 
} from "@/types/seo";

export async function getSitemapProblems(): Promise<SitemapProblem[]> {
  const response = await apiClient.get<ApiResponse<{ problems: SitemapProblem[] }>>("/seo/sitemap/problems");
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch sitemap problems");
  }
  return response.data.data.problems;
}

export async function getSitemapAcademyTracks(): Promise<SitemapAcademyTrack[]> {
  const response = await apiClient.get<ApiResponse<{ tracks: SitemapAcademyTrack[] }>>("/seo/sitemap/academy-tracks");
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch sitemap academy tracks");
  }
  return response.data.data.tracks;
}

export async function getSitemapAcademyExercises(): Promise<SitemapAcademyExercise[]> {
  const response = await apiClient.get<ApiResponse<{ exercises: SitemapAcademyExercise[] }>>("/seo/sitemap/academy-exercises");
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch sitemap academy exercises");
  }
  return response.data.data.exercises;
}

export async function getSitemapSystemDesignLessons(): Promise<SitemapSystemDesignLesson[]> {
  const response = await apiClient.get<ApiResponse<{ lessons: SitemapSystemDesignLesson[] }>>("/seo/sitemap/system-design-lessons");
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch sitemap system design lessons");
  }
  return response.data.data.lessons;
}

export async function getSitemapCompanyTags(): Promise<SitemapCompanyTag[]> {
  const response = await apiClient.get<ApiResponse<{ companies: SitemapCompanyTag[] }>>("/seo/sitemap/company-tags");
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch sitemap company tags");
  }
  return response.data.data.companies;
}

export async function getSitemapUsers(): Promise<SitemapUser[]> {
  const response = await apiClient.get<ApiResponse<{ users: SitemapUser[] }>>("/seo/sitemap/users");
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch sitemap users");
  }
  return response.data.data.users;
}

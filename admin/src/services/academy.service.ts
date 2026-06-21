import { apiClient } from "@/lib/api-client";

export interface AcademyStats {
  tracks: number;
  configs: number;
  concepts: number;
  exercises: number;
  conceptsPerTrack: { trackSlug: string; count: number }[];
  exercisesPerTrack: { trackSlug: string; count: number }[];
  difficultyDistribution: { difficulty: number | null; count: number }[];
  userSolvesPerTrack: { trackSlug: string; count: number }[];
}

export const academyAdminService = {









  
  getStats: async (): Promise<AcademyStats> => {
    const { data } = await apiClient.get<{ success: boolean; data: AcademyStats }>("/admin/academy/stats");
    return data.data;
  },
  
  // --- TRACKS ---
  getAllTracks: async () => {
    const { data } = await apiClient.get("/admin/academy/tracks");
    return data;
  },

  createTrack: async (slug: string, payload: any) => {
    const { data } = await apiClient.post("/admin/academy/tracks", { slug, data: payload });
    return data;
  },

  updateTrack: async (slug: string, payload: any) => {
    const { data } = await apiClient.put(`/admin/academy/tracks/${slug}`, { data: payload });
    return data;
  },

  deleteTrack: async (slug: string) => {
    const { data } = await apiClient.delete(`/admin/academy/tracks/${slug}`);
    return data;
  },








  // --- CONFIGS ---
  getAllConfigs: async () => {
    const { data } = await apiClient.get("/admin/academy/configs");
    return data;
  },

  createConfig: async (slug: string, payload: any) => {
    const { data } = await apiClient.post("/admin/academy/configs", { slug, data: payload });
    return data;
  },

  updateConfig: async (slug: string, payload: any) => {
    const { data } = await apiClient.put(`/admin/academy/configs/${slug}`, { data: payload });
    return data;
  },

  deleteConfig: async (slug: string) => {
    const { data } = await apiClient.delete(`/admin/academy/configs/${slug}`);
    return data;
  },

  // --- CONCEPTS ---
  getConceptsByTrack: async (trackSlug: string) => {
    const { data } = await apiClient.get(`/admin/academy/tracks/${trackSlug}/concepts`);
    return data;
  },

  createConcept: async (trackSlug: string, conceptSlug: string, payload: any) => {
    const { data } = await apiClient.post(`/admin/academy/tracks/${trackSlug}/concepts`, { conceptSlug, data: payload });
    return data;
  },

  updateConcept: async (trackSlug: string, conceptSlug: string, payload: any) => {
    const { data } = await apiClient.put(`/admin/academy/tracks/${trackSlug}/concepts/${conceptSlug}`, { data: payload });
    return data;
  },

  deleteConcept: async (trackSlug: string, conceptSlug: string) => {
    const { data } = await apiClient.delete(`/admin/academy/tracks/${trackSlug}/concepts/${conceptSlug}`);
    return data;
  },

  // --- EXERCISES ---
  getExercisesByTrack: async (trackSlug: string) => {
    const { data } = await apiClient.get(`/admin/academy/tracks/${trackSlug}/exercises`);
    return data;
  },

  createExercise: async (trackSlug: string, exerciseSlug: string, payload: any) => {
    const { data } = await apiClient.post(`/admin/academy/tracks/${trackSlug}/exercises`, { exerciseSlug, data: payload });
    return data;
  },

  updateExercise: async (trackSlug: string, exerciseSlug: string, payload: any) => {
    const { data } = await apiClient.put(`/admin/academy/tracks/${trackSlug}/exercises/${exerciseSlug}`, { data: payload });
    return data;
  },

  deleteExercise: async (trackSlug: string, exerciseSlug: string) => {
    const { data } = await apiClient.delete(`/admin/academy/tracks/${trackSlug}/exercises/${exerciseSlug}`);
    return data;
  },
};

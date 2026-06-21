import { apiClient } from "@/lib/api-client";

export const academyAdminService = {





  
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

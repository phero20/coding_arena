import { apiClient } from "@/lib/api-client";
import type { User, UserStats, UserActivity, UserSolvedProblem, UserAcademyExercise, UserSolvedLanguage } from "@/types/user";

export const userAdminService = {
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await apiClient.get("/admin/users");
    return data.data || data;
  },

  createUser: async (payload: Partial<User>): Promise<User> => {
    const { data } = await apiClient.post("/admin/users", payload);
    return data.data || data;
  },

  updateUser: async (id: string, payload: Partial<User>): Promise<User> => {
    const { data } = await apiClient.put(`/admin/users/${id}`, payload);
    return data.data || data;
  },

  deleteUser: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete(`/admin/users/${id}`);
    return data;
  },

  getUserStats: async (userId: string): Promise<UserStats> => {
    const { data } = await apiClient.get(`/admin/users/stats/${userId}`);
    return data.data || data;
  },

  createUserStats: async (payload: Partial<UserStats>): Promise<UserStats> => {
    const { data } = await apiClient.post("/admin/users/stats", payload);
    return data.data || data;
  },

  updateUserStats: async (userId: string, payload: Partial<UserStats>): Promise<UserStats> => {
    const { data } = await apiClient.put(`/admin/users/stats/${userId}`, payload);
    return data.data || data;
  },

  deleteUserStats: async (userId: string): Promise<void> => {
    const { data } = await apiClient.delete(`/admin/users/stats/${userId}`);
    return data;
  },

  getUserActivity: async (userId: string): Promise<UserActivity[]> => {
    const { data } = await apiClient.get(`/admin/users/activity/${userId}`);
    return data.data || data;
  },

  createUserActivity: async (payload: Partial<UserActivity>): Promise<UserActivity> => {
    const { data } = await apiClient.post("/admin/users/activity", payload);
    return data.data || data;
  },

  updateUserActivity: async (userId: string, date: string, payload: Partial<UserActivity>): Promise<UserActivity> => {
    const { data } = await apiClient.put(`/admin/users/activity/${userId}/${date}`, payload);
    return data.data || data;
  },

  deleteUserActivity: async (userId: string, date: string): Promise<void> => {
    const { data } = await apiClient.delete(`/admin/users/activity/${userId}/${date}`);
    return data;
  },

  getUserSolvedProblems: async (userId: string): Promise<UserSolvedProblem[]> => {
    const { data } = await apiClient.get(`/admin/users/solved-problems/${userId}`);
    return data.data || data;
  },

  createUserSolvedProblem: async (payload: Partial<UserSolvedProblem>): Promise<UserSolvedProblem> => {
    const { data } = await apiClient.post("/admin/users/solved-problems", payload);
    return data.data || data;
  },

  deleteUserSolvedProblem: async (userId: string, problemId: string): Promise<void> => {
    const { data } = await apiClient.delete(`/admin/users/solved-problems/${userId}/${problemId}`);
    return data;
  },

  getUserAcademyExercises: async (userId: string): Promise<UserAcademyExercise[]> => {
    const { data } = await apiClient.get(`/admin/users/academy-exercises/${userId}`);
    return data.data || data;
  },

  createUserAcademyExercise: async (payload: Partial<UserAcademyExercise>): Promise<UserAcademyExercise> => {
    const { data } = await apiClient.post("/admin/users/academy-exercises", payload);
    return data.data || data;
  },

  deleteUserAcademyExercise: async (userId: string, trackSlug: string, exerciseSlug: string): Promise<void> => {
    const { data } = await apiClient.delete(`/admin/users/academy-exercises/${userId}/${trackSlug}/${exerciseSlug}`);
    return data;
  },

  getUserSolvedLanguages: async (userId: string): Promise<UserSolvedLanguage[]> => {
    const { data } = await apiClient.get(`/admin/users/solved-languages/${userId}`);
    return data.data || data;
  },

  createUserSolvedLanguage: async (payload: Partial<UserSolvedLanguage>): Promise<UserSolvedLanguage> => {
    const { data } = await apiClient.post("/admin/users/solved-languages", payload);
    return data.data || data;
  },

  deleteUserSolvedLanguage: async (userId: string, problemId: string, languageId: string): Promise<void> => {
    const { data } = await apiClient.delete(`/admin/users/solved-languages/${userId}/${problemId}/${languageId}`);
    return data;
  },
};

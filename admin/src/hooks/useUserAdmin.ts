import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAdminService } from "@/services/user.service";
import type { User, UserStats, UserActivity, UserSolvedProblem, UserSolvedLanguage, UserAcademyExercise } from "@/types/user";
import { toast } from "sonner";

export const useUserAdmin = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => userAdminService.getAllUsers(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<User>) => userAdminService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create user");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) => 
      userAdminService.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userAdminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete user");
    },
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useUserStatsAdmin = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-user-stats", userId],
    queryFn: () => userId ? userAdminService.getUserStats(userId) : null,
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<UserStats>) => userAdminService.createUserStats(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats", variables.userId] });
      toast.success("User stats created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create user stats");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UserStats> }) => 
      userAdminService.updateUserStats(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats", variables.id] });
      toast.success("User stats updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update user stats");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userAdminService.deleteUserStats(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats", id] });
      toast.success("User stats deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete user stats");
    },
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    createStats: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateStats: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteStats: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useUserActivityAdmin = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-user-activity", userId],
    queryFn: () => userId ? userAdminService.getUserActivity(userId) : null,
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<UserActivity>) => userAdminService.createUserActivity(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-activity", variables.userId] });
      toast.success("User activity created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create user activity");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, date, payload }: { id: string; date: string; payload: Partial<UserActivity> }) => 
      userAdminService.updateUserActivity(id, date, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-activity", variables.id] });
      toast.success("User activity updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update user activity");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => userAdminService.deleteUserActivity(id, date),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-activity", variables.id] });
      toast.success("User activity deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete user activity");
    },
  });

  return {
    activity: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    createActivity: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateActivity: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteActivity: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useUserSolvedProblemsAdmin = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-user-solved-problems", userId],
    queryFn: () => userId ? userAdminService.getUserSolvedProblems(userId) : null,
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<UserSolvedProblem>) => userAdminService.createUserSolvedProblem(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-solved-problems", variables.userId] });
      toast.success("Solved problem record added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to add solved problem record");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, problemId }: { id: string; problemId: string }) => userAdminService.deleteUserSolvedProblem(id, problemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-solved-problems", variables.id] });
      toast.success("Solved problem record deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete solved problem record");
    },
  });

  return {
    solvedProblems: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    createSolvedProblem: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    deleteSolvedProblem: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useUserAcademyExercisesAdmin = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-user-academy-exercises", userId],
    queryFn: () => userId ? userAdminService.getUserAcademyExercises(userId) : null,
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<UserAcademyExercise>) => userAdminService.createUserAcademyExercise(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-academy-exercises", variables.userId] });
      toast.success("Academy exercise record added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to add academy exercise record");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, trackSlug, exerciseSlug }: { id: string; trackSlug: string; exerciseSlug: string }) => userAdminService.deleteUserAcademyExercise(id, trackSlug, exerciseSlug),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-academy-exercises", variables.id] });
      toast.success("Academy exercise record deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete academy exercise record");
    },
  });

  return {
    academyExercises: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    createAcademyExercise: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    deleteAcademyExercise: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useUserSolvedLanguagesAdmin = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-user-solved-languages", userId],
    queryFn: () => userId ? userAdminService.getUserSolvedLanguages(userId) : null,
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<UserSolvedLanguage>) => userAdminService.createUserSolvedLanguage(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-solved-languages", variables.userId] });
      toast.success("Solved language record added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to add solved language record");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, problemId, languageId }: { id: string; problemId: string; languageId: string }) => userAdminService.deleteUserSolvedLanguage(id, problemId, languageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-solved-languages", variables.id] });
      toast.success("Solved language record deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete solved language record");
    },
  });

  return {
    solvedLanguages: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    createSolvedLanguage: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    deleteSolvedLanguage: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

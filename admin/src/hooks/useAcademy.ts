import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academyAdminService, type AcademyStats } from "@/services/academy.service";
import { toast } from "sonner";

export const useAcademyStats = () => {
  const statsQuery = useQuery({
    queryKey: ["admin-academy-stats"],
    queryFn: async () => {
      return await academyAdminService.getStats();
    },
  });

  return {
    stats: (statsQuery.data || { 
      tracks: 0, 
      configs: 0, 
      concepts: 0, 
      exercises: 0,
      conceptsPerTrack: [],
      exercisesPerTrack: [],
      difficultyDistribution: [],
      userSolvesPerTrack: []
    }) as AcademyStats,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

export const useAcademyTracks = () => {
  const queryClient = useQueryClient();

  // Queries
  const tracksQuery = useQuery({
    queryKey: ["admin-academy-tracks"],
    queryFn: async () => {
      return await academyAdminService.getAllTracks();
    },
  });

  // Mutations
  const createTrackMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      academyAdminService.createTrack(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-tracks"] });
      toast.success("Track created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create track");
    },
  });

  const updateTrackMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      academyAdminService.updateTrack(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-tracks"] });
      toast.success("Track updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update track");
    },
  });

  const deleteTrackMutation = useMutation({
    mutationFn: (slug: string) => academyAdminService.deleteTrack(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-tracks"] });
      toast.success("Track deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete track");
    },
  });

  // Extract the tracks array from various possible backend response formats
  let tracksList = [];
  if (Array.isArray(tracksQuery.data)) {
    tracksList = tracksQuery.data;
  } else if (tracksQuery.data?.data && Array.isArray(tracksQuery.data.data)) {
    tracksList = tracksQuery.data.data;
  } else if (tracksQuery.data?.tracks && Array.isArray(tracksQuery.data.tracks)) {
    tracksList = tracksQuery.data.tracks;
  }

  return {
    // Data
    tracks: tracksList,
    isLoading: tracksQuery.isLoading,
    isError: tracksQuery.isError,
    error: tracksQuery.error,

    // Mutations
    createTrack: createTrackMutation.mutateAsync,
    isCreating: createTrackMutation.isPending,

    updateTrack: updateTrackMutation.mutateAsync,
    isUpdating: updateTrackMutation.isPending,

    deleteTrack: deleteTrackMutation.mutateAsync,
    isDeleting: deleteTrackMutation.isPending,
  };
};

export const useAcademyConfigs = () => {
  const queryClient = useQueryClient();

  // Queries
  const configsQuery = useQuery({
    queryKey: ["admin-academy-configs"],
    queryFn: async () => {
      return await academyAdminService.getAllConfigs();
    },
  });

  // Mutations
  const createConfigMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      academyAdminService.createConfig(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-configs"] });
      toast.success("Config created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create config");
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      academyAdminService.updateConfig(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-configs"] });
      toast.success("Config updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update config");
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (slug: string) => academyAdminService.deleteConfig(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-configs"] });
      toast.success("Config deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete config");
    },
  });

  // Extract the configs array
  let configsList = [];
  if (Array.isArray(configsQuery.data)) {
    configsList = configsQuery.data;
  } else if (configsQuery.data?.data && Array.isArray(configsQuery.data.data)) {
    configsList = configsQuery.data.data;
  }

  return {
    // Data
    configs: configsList,
    isLoading: configsQuery.isLoading,
    isError: configsQuery.isError,
    error: configsQuery.error,

    // Mutations
    createConfig: createConfigMutation.mutateAsync,
    isCreating: createConfigMutation.isPending,

    updateConfig: updateConfigMutation.mutateAsync,
    isUpdating: updateConfigMutation.isPending,

    deleteConfig: deleteConfigMutation.mutateAsync,
    isDeleting: deleteConfigMutation.isPending,
  };
};

export const useAcademyConcepts = (trackSlug: string) => {
  const queryClient = useQueryClient();

  // Queries
  const conceptsQuery = useQuery({
    queryKey: ["admin-academy-concepts", trackSlug],
    queryFn: async () => {
      if (!trackSlug) return [];
      return await academyAdminService.getConceptsByTrack(trackSlug);
    },
    enabled: !!trackSlug,
  });

  // Mutations
  const createConceptMutation = useMutation({
    mutationFn: ({ conceptSlug, data }: { conceptSlug: string; data: any }) =>
      academyAdminService.createConcept(trackSlug, conceptSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-concepts", trackSlug] });
      toast.success("Concept created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create concept");
    },
  });

  const updateConceptMutation = useMutation({
    mutationFn: ({ conceptSlug, data }: { conceptSlug: string; data: any }) =>
      academyAdminService.updateConcept(trackSlug, conceptSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-concepts", trackSlug] });
      toast.success("Concept updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update concept");
    },
  });

  const deleteConceptMutation = useMutation({
    mutationFn: (conceptSlug: string) => academyAdminService.deleteConcept(trackSlug, conceptSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-concepts", trackSlug] });
      toast.success("Concept deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete concept");
    },
  });

  // Extract the concepts array
  let conceptsList = [];
  if (Array.isArray(conceptsQuery.data)) {
    conceptsList = conceptsQuery.data;
  } else if (conceptsQuery.data?.data && Array.isArray(conceptsQuery.data.data)) {
    conceptsList = conceptsQuery.data.data;
  }

  return {
    // Data
    concepts: conceptsList,
    isLoading: conceptsQuery.isLoading,
    isError: conceptsQuery.isError,
    error: conceptsQuery.error,

    // Mutations
    createConcept: createConceptMutation.mutateAsync,
    isCreating: createConceptMutation.isPending,

    updateConcept: updateConceptMutation.mutateAsync,
    isUpdating: updateConceptMutation.isPending,

    deleteConcept: deleteConceptMutation.mutateAsync,
    isDeleting: deleteConceptMutation.isPending,
  };
};

export const useAcademyExercises = (trackSlug: string) => {
  const queryClient = useQueryClient();

  // Queries
  const exercisesQuery = useQuery({
    queryKey: ["admin-academy-exercises", trackSlug],
    queryFn: async () => {
      if (!trackSlug) return [];
      return await academyAdminService.getExercisesByTrack(trackSlug);
    },
    enabled: !!trackSlug,
  });

  // Mutations
  const createExerciseMutation = useMutation({
    mutationFn: ({ exerciseSlug, data }: { exerciseSlug: string; data: any }) =>
      academyAdminService.createExercise(trackSlug, exerciseSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-exercises", trackSlug] });
      toast.success("Exercise created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create exercise");
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: ({ exerciseSlug, data }: { exerciseSlug: string; data: any }) =>
      academyAdminService.updateExercise(trackSlug, exerciseSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-exercises", trackSlug] });
      toast.success("Exercise updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update exercise");
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: (exerciseSlug: string) => academyAdminService.deleteExercise(trackSlug, exerciseSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-exercises", trackSlug] });
      toast.success("Exercise deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete exercise");
    },
  });

  // Extract the exercises array
  let exercisesList = [];
  if (Array.isArray(exercisesQuery.data)) {
    exercisesList = exercisesQuery.data;
  } else if (exercisesQuery.data?.data && Array.isArray(exercisesQuery.data.data)) {
    exercisesList = exercisesQuery.data.data;
  }

  return {
    // Data
    exercises: exercisesList,
    isLoading: exercisesQuery.isLoading,
    isError: exercisesQuery.isError,
    error: exercisesQuery.error,

    // Mutations
    createExercise: createExerciseMutation.mutateAsync,
    isCreating: createExerciseMutation.isPending,

    updateExercise: updateExerciseMutation.mutateAsync,
    isUpdating: updateExerciseMutation.isPending,

    deleteExercise: deleteExerciseMutation.mutateAsync,
    isDeleting: deleteExerciseMutation.isPending,
  };
};

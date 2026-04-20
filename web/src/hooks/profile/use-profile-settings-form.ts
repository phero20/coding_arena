import React from "react";
import { useUpdateProfileMutation } from "@/hooks/queries/use-profile.mutations";

interface ProfileFormValues {
  githubUsername: string;
  linkedinUsername: string;
  leetcodeUsername: string;
}

interface UseProfileSettingsFormProps {
  currentUsername: string;
  initialValues: {
    githubUsername?: string | null;
    linkedinUsername?: string | null;
    leetcodeUsername?: string | null;
  };
}

/**
 * Custom hook for managing the Profile Settings form.
 * Handles state unification, dirty checking, and mutation orchestration.
 */
export function useProfileSettingsForm({
  currentUsername,
  initialValues,
}: UseProfileSettingsFormProps) {
  const { updateProfile } = useUpdateProfileMutation(currentUsername);

  // Initialize state from props
  const [values, setValues] = React.useState<ProfileFormValues>({
    githubUsername: initialValues.githubUsername || "",
    linkedinUsername: initialValues.linkedinUsername || "",
    leetcodeUsername: initialValues.leetcodeUsername || "",
  });

  // Track initial values for dirty-checking
  // We use memo to ensure stable comparison even if the object reference changes but content doesn't
  const memoizedInitial = React.useMemo(() => ({
    githubUsername: initialValues.githubUsername || "",
    linkedinUsername: initialValues.linkedinUsername || "",
    leetcodeUsername: initialValues.leetcodeUsername || "",
  }), [initialValues.githubUsername, initialValues.linkedinUsername, initialValues.leetcodeUsername]);

  // Derive dirty state
  const isDirty = React.useMemo(() => {
    return (
      values.githubUsername !== memoizedInitial.githubUsername ||
      values.linkedinUsername !== memoizedInitial.linkedinUsername ||
      values.leetcodeUsername !== memoizedInitial.leetcodeUsername
    );
  }, [values, memoizedInitial]);

  const handleChange = (field: keyof ProfileFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isDirty || updateProfile.isPending) return;

    updateProfile.mutate({
      githubUsername: values.githubUsername || null,
      linkedinUsername: values.linkedinUsername || null,
      leetcodeUsername: values.leetcodeUsername || null,
    });
  };

  return {
    values,
    isDirty,
    isLoading: updateProfile.isPending,
    handleChange,
    handleSave,
  };
}

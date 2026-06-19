import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyAdminService, type Company } from "@/services/company.service";
import { toast } from "sonner";

export const useCompanyAdmin = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => companyAdminService.getAllCompanies(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Company>) => companyAdminService.createCompany(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Company created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create company");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Company> }) => 
      companyAdminService.updateCompany(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Company updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update company");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => companyAdminService.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Company deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete company");
    },
  });

  return {
    companies: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    createCompany: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateCompany: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteCompany: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";
import type { Database } from "@/types/database.types";
type Category = Database["public"]["Tables"]["categories"]["Row"];
interface CategoryQueryParams {
  search?: string;
  sortBy?: "created_at" | "name" | "updated_at";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Fetch all categories with search, filter, and sorting
export function useCategories(params: CategoryQueryParams = {}) {
  const {
    search = "",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  return useQuery({
    queryKey: ["categories", { search, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: search.toString(),
        sortBy: sortBy.toString(),
        sortOrder: sortOrder.toString(),
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await axiosInstance.get(`/api/categories?${params}`);
      return response.data.categories;
    },
  });
}

// Fetch category count for pagination
export function useCategoriesCount(
  params: Omit<CategoryQueryParams, "page" | "limit"> = {},
) {
  const { search = "" } = params;

  return useQuery({
    queryKey: ["categories-count", { search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: search.toString(),
      });

      const response = await axiosInstance.get(
        `/api/categories/count?${params}`,
      );
      return response.data.count;
    },
  });
}

// Fetch single category by ID
export function useCategory(id: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Category;
    },
    enabled: !!id,
  });
}

// Create category mutation
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: any) => {
      console.log(
        "useCreateCategory: Creating category via API:",
        categoryData,
      );

      const response = await axiosInstance.post(
        "/api/categories",
        categoryData,
      );
      return response.data.category;
    },
    onSuccess: () => {
      toast.success("Category created successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-count"] });
    },
    onError: (error: any) => {
      console.error("useCreateCategory: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to create category");
    },
  });
}

// Update category mutation
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...categoryData }: any) => {
      console.log("useUpdateCategory: Updating category via API:", {
        id,
        categoryData,
      });

      const response = await axiosInstance.put("/api/categories", {
        id,
        ...categoryData,
      });
      return response.data.category;
    },
    onSuccess: (data: any) => {
      toast.success("Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-count"] });
      queryClient.invalidateQueries({ queryKey: ["categories", data.id] });
    },
    onError: (error: any) => {
      console.error("useUpdateCategory: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to update category");
    },
  });
}

// Delete category mutation
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("useDeleteCategory: Deleting category via API:", id);

      const response = await axiosInstance.delete("/api/categories", {
        data: { id },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-count"] });
    },
    onError: (error: any) => {
      console.error("useDeleteCategory: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to delete category");
    },
  });
}

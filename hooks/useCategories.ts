import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
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
      let query = (supabase as any).from("categories").select("*");

      // Apply search filter
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;
      return data as Category[];
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
      let query = (supabase as any)
        .from("categories")
        .select("*", { count: "exact", head: true });

      // Apply search filter
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
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
      const { data, error } = await (supabase as any)
        .from("categories")
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      toast.success("Category created successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}

// Update category mutation
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...categoryData }: any) => {
      const { data, error } = await (supabase as any)
        .from("categories")
        .update(categoryData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: (data: Category) => {
      toast.success("Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-count"] });
      queryClient.invalidateQueries({ queryKey: ["categories", data.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}

// Delete category mutation
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, get the category to check if it has an image
      const { data: category, error: fetchError } = await (supabase as any)
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Delete category image from storage if it exists
      if (category?.picture && category.picture.includes("supabase")) {
        const filePath = category.picture.split("/").pop();
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("category-images")
            .remove([filePath]);
          if (storageError) {
            console.warn("Failed to delete category image:", storageError);
          }
        }
      }

      // Update products in this category to null category
      const { error: updateError } = await (supabase as any)
        .from("products")
        .update({ category: null })
        .eq("category", category.name);

      if (updateError) {
        console.warn("Failed to update products in category:", updateError);
      }

      // Delete the category
      const { error } = await (supabase as any)
        .from("categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete category");
    },
  });
}

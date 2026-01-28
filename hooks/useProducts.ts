import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductQueryParams {
  search?: string;
  category?: string;
  status?: "all" | "in_stock" | "out_of_stock";
  sortBy?: "created_at" | "name" | "price" | "stock" | "updated_at";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Fetch all products with search, filter, and sorting
export function useProducts(params: ProductQueryParams = {}) {
  const {
    search = "",
    category = "all",
    status = "all",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  return useQuery({
    queryKey: [
      "products",
      { search, category, status, sortBy, sortOrder, page, limit },
    ],
    queryFn: async () => {
      let query = (supabase as any).from("products").select(`
          *,
          category:categories(id, name, slug, picture)
        `);

      // Apply search filter
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`,
        );
      }

      // Apply category filter
      if (category !== "all") {
        query = query.eq("category_id", category);
      }

      // Apply stock status filter
      if (status !== "all") {
        if (status === "in_stock") {
          query = query.gt("stock", 0);
        } else if (status === "out_of_stock") {
          query = query.lte("stock", 0);
        }
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;
      return data as any[];
    },
  });
}

// Fetch product count for pagination
export function useProductsCount(
  params: Omit<ProductQueryParams, "page" | "limit"> = {},
) {
  const { search = "", category = "all", status = "all" } = params;

  return useQuery({
    queryKey: ["products-count", { search, category, status }],
    queryFn: async () => {
      let query = (supabase as any)
        .from("products")
        .select("*", { count: "exact", head: true });

      // Apply search filter
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`,
        );
      }

      // Apply category filter
      if (category !== "all") {
        query = query.eq("category_id", category);
      }

      // Apply stock status filter
      if (status !== "all") {
        if (status === "in_stock") {
          query = query.gt("stock", 0);
        } else if (status === "out_of_stock") {
          query = query.lte("stock", 0);
        }
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    },
  });
}

// Fetch single product by ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select(`
          *,
          category:categories(id, name, slug, picture)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: any) => {
      const { data, error } = await supabase
        .from("products")
        .insert([product])
        .select();

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product");
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase
        .from("products")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product");
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product");
    },
  });
}

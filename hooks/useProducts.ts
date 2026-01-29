import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";
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
      const params = new URLSearchParams({
        search: search.toString(),
        category: category.toString(),
        status: status.toString(),
        sortBy: sortBy.toString(),
        sortOrder: sortOrder.toString(),
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await axiosInstance.get(`/api/products?${params}`);
      return response.data.products;
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
      const params = new URLSearchParams({
        search: search.toString(),
        category: category.toString(),
        status: status.toString(),
      });

      const response = await axiosInstance.get(`/api/products/count?${params}`);
      return response.data.count;
    },
  });
}

// Fetch single product by ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/products/${id}`);
      return response.data.product;
    },
    enabled: !!id,
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: any) => {
      console.log("useCreateProduct: Creating product via API:", product);

      const response = await axiosInstance.post("/api/products", product);
      return response.data.product;
    },
    onSuccess: (data) => {
      console.log("useCreateProduct: Mutation success, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error: any) => {
      console.error("useCreateProduct: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to create product");
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      console.log("useUpdateProduct: Updating product via API:", {
        id,
        updates,
      });

      const response = await axiosInstance.put("/api/products", {
        id,
        ...updates,
      });
      return response.data.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
    },
    onError: (error: any) => {
      console.error("useUpdateProduct: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to update product");
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("useDeleteProduct: Deleting product via API:", id);

      const response = await axiosInstance.delete("/api/products", {
        data: { id },
      });
      return response.data;
    },
    onSuccess: () => {
      console.log("useDeleteProduct: Mutation success, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      console.error("useDeleteProduct: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to delete product");
    },
  });
}

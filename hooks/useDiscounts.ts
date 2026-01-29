import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];

interface FetchDiscountsParams {
  search?: string;
  status?: "all" | "active" | "inactive";
  type?: "all" | "percentage" | "fixed_amount" | "free_shipping";
  sortBy?: "created_at" | "expires_at" | "discount_value";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

const fetchDiscounts = async (
  params: FetchDiscountsParams,
): Promise<CouponRow[]> => {
  let query = supabase.from("coupons").select("*");

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    query = query.or(
      `code.ilike.%${searchLower}%,description.ilike.%${searchLower}%`,
    );
  }

  // Apply status filter
  if (params.status && params.status !== "all") {
    const isActive = params.status === "active";
    query = query.eq("is_active", isActive);
  }

  // Apply type filter
  if (params.type && params.type !== "all") {
    query = query.eq("discount_type", params.type);
  }

  // Apply sorting
  const sortColumn = params.sortBy || "created_at";
  const isAscending = params.sortOrder === "asc";
  query = query.order(sortColumn, { ascending: isAscending });

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const useDiscounts = (params: FetchDiscountsParams = {}) => {
  return useQuery({
    queryKey: [
      "discounts",
      params.search,
      params.status,
      params.type,
      params.sortBy,
      params.sortOrder,
      params.page,
      params.limit,
    ],
    queryFn: () => fetchDiscounts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for getting total count of discounts
const fetchDiscountsCount = async (
  params: FetchDiscountsParams,
): Promise<number> => {
  let query = supabase
    .from("coupons")
    .select("*", { count: "exact", head: true });

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    query = query.or(
      `code.ilike.%${searchLower}%,description.ilike.%${searchLower}%`,
    );
  }

  // Apply status filter
  if (params.status && params.status !== "all") {
    const isActive = params.status === "active";
    query = query.eq("is_active", isActive);
  }

  // Apply type filter
  if (params.type && params.type !== "all") {
    query = query.eq("discount_type", params.type);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
};

export const useDiscountsCount = (params: FetchDiscountsParams = {}) => {
  return useQuery({
    queryKey: ["discountsCount", params.search, params.status, params.type],
    queryFn: () => fetchDiscountsCount(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Delete discount mutation
export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discountsCount"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete coupon");
    },
  });
};

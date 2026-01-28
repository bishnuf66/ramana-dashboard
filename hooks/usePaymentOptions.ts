import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type PaymentOption = Database["public"]["Tables"]["payment_options"]["Row"];

interface PaymentOptionQueryParams {
  search?: string;
  status?: "all" | "active" | "inactive";
  sortBy?: "created_at" | "name" | "updated_at";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Fetch all payment options with search, filter, and sorting
export function usePaymentOptions(params: PaymentOptionQueryParams = {}) {
  const {
    search = "",
    status = "all",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  return useQuery({
    queryKey: ["paymentOptions", { search, status, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      let query = (supabase as any)
        .from("payment_options")
        .select("*");

      // Apply search filter
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply status filter
      if (status !== "all") {
        query = query.eq("is_active", status === "active");
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;
      return data as PaymentOption[];
    },
  });
}

// Fetch payment option count for pagination
export function usePaymentOptionsCount(params: Omit<PaymentOptionQueryParams, 'page' | 'limit'> = {}) {
  const { search = "", status = "all" } = params;

  return useQuery({
    queryKey: ["paymentOptions-count", { search, status }],
    queryFn: async () => {
      let query = (supabase as any)
        .from("payment_options")
        .select("*", { count: "exact", head: true });

      // Apply search filter
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply status filter
      if (status !== "all") {
        query = query.eq("is_active", status === "active");
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    },
  });
}

// Fetch single payment option by ID
export function usePaymentOption(id: string) {
  return useQuery({
    queryKey: ["paymentOptions", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payment_options")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PaymentOption;
    },
    enabled: !!id,
  });
}

// Create payment option mutation
export function useCreatePaymentOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentOptionData: any) => {
      const { data, error } = await (supabase as any)
        .from("payment_options")
        .insert(paymentOptionData)
        .select()
        .single();

      if (error) throw error;
      return data as PaymentOption;
    },
    onSuccess: () => {
      toast.success("Payment option created successfully!");
      queryClient.invalidateQueries({ queryKey: ["paymentOptions"] });
      queryClient.invalidateQueries({ queryKey: ["paymentOptions-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create payment option");
    },
  });
}

// Update payment option mutation
export function useUpdatePaymentOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...paymentOptionData }: any) => {
      const { data, error } = await (supabase as any)
        .from("payment_options")
        .update(paymentOptionData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as PaymentOption;
    },
    onSuccess: (data: PaymentOption) => {
      toast.success("Payment option updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["paymentOptions"] });
      queryClient.invalidateQueries({ queryKey: ["paymentOptions-count"] });
      queryClient.invalidateQueries({ queryKey: ["paymentOptions", data.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update payment option");
    },
  });
}

// Delete payment option mutation
export function useDeletePaymentOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("payment_options").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Payment option deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["paymentOptions"] });
      queryClient.invalidateQueries({ queryKey: ["paymentOptions-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete payment option");
    },
  });
}

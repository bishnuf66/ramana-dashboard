import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type UserPayment = Database["public"]["Tables"]["user_payments"]["Row"];
type PaymentOption = Database["public"]["Tables"]["payment_options"]["Row"];

interface UserPaymentQueryParams {
  search?: string;
  status?: "all" | "verified" | "pending" | "rejected";
  paymentMethod?: string;
  sortBy?: "created_at" | "amount" | "updated_at";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Fetch all user payments with search, filter, and sorting
export function useUserPayments(params: UserPaymentQueryParams = {}) {
  const {
    search = "",
    status = "all",
    paymentMethod = "",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  return useQuery({
    queryKey: ["userPayments", { search, status, paymentMethod, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      let query = (supabase as any)
        .from("user_payments")
        .select(`
          *,
          payment_option:payment_options(*),
          orders(id, customer_name, customer_email, total_amount, order_status)
        `);

      // Apply search filter
      if (search) {
        query = query.or(`
          transaction_id.ilike.%${search}%,
          payment_method.ilike.%${search}%,
          orders.customer_name.ilike.%${search}%,
          orders.customer_email.ilike.%${search}%
        `);
      }

      // Apply status filter
      if (status !== "all") {
        if (status === "verified") {
          query = query.eq("is_verified", true);
        } else if (status === "pending") {
          query = query.eq("is_verified", false);
        }
      }

      // Apply payment method filter
      if (paymentMethod) {
        query = query.eq("payment_method", paymentMethod);
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

// Fetch user payment count for pagination
export function useUserPaymentsCount(params: Omit<UserPaymentQueryParams, 'page' | 'limit'> = {}) {
  const { search = "", status = "all", paymentMethod = "" } = params;

  return useQuery({
    queryKey: ["userPayments-count", { search, status, paymentMethod }],
    queryFn: async () => {
      let query = (supabase as any)
        .from("user_payments")
        .select("*", { count: "exact", head: true });

      // Apply search filter
      if (search) {
        query = query.or(`
          transaction_id.ilike.%${search}%,
          payment_method.ilike.%${search}%,
          orders.customer_name.ilike.%${search}%,
          orders.customer_email.ilike.%${search}%
        `);
      }

      // Apply status filter
      if (status !== "all") {
        if (status === "verified") {
          query = query.eq("is_verified", true);
        } else if (status === "pending") {
          query = query.eq("is_verified", false);
        }
      }

      // Apply payment method filter
      if (paymentMethod) {
        query = query.eq("payment_method", paymentMethod);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    },
  });
}

// Fetch single user payment by ID
export function useUserPayment(id: string) {
  return useQuery({
    queryKey: ["userPayments", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_payments")
        .select(`
          *,
          payment_option:payment_options(*),
          orders(id, customer_name, customer_email, total_amount, order_status)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
}

// Verify payment mutation
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const { data, error } = await (supabase as any)
        .from("user_payments")
        .update({ is_verified: verified })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { verified }) => {
      toast.success(`Payment ${verified ? "verified" : "unverified"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["userPayments"] });
      queryClient.invalidateQueries({ queryKey: ["userPayments-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update payment status");
    },
  });
}

// Delete payment mutation
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("user_payments").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Payment deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["userPayments"] });
      queryClient.invalidateQueries({ queryKey: ["userPayments-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete payment");
    },
  });
}

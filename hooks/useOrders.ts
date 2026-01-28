import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

interface OrderQueryParams {
  search?: string;
  status?: OrderStatus | "all";
  sortBy?: "created_at" | "updated_at" | "total_amount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Fetch all orders with search, filter, and sorting
export function useOrders(params: OrderQueryParams = {}) {
  const {
    search = "",
    status = "all",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  return useQuery({
    queryKey: ["orders", { search, status, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      let query = (supabase as any).from("orders").select("*");

      // Apply search filter
      if (search) {
        query = query.or(
          `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,id.ilike.%${search}%`,
        );
      }

      // Apply status filter
      if (status !== "all") {
        query = query.eq("order_status", status);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;
      return data as Order[];
    },
  });
}

// Fetch order count for pagination
export function useOrdersCount(
  params: Omit<OrderQueryParams, "page" | "limit"> = {},
) {
  const { search = "", status = "all" } = params;

  return useQuery({
    queryKey: ["orders-count", { search, status }],
    queryFn: async () => {
      let query = (supabase as any)
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Apply search filter
      if (search) {
        query = query.or(
          `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,id.ilike.%${search}%`,
        );
      }

      // Apply status filter
      if (status !== "all") {
        query = query.eq("order_status", status);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    },
  });
}

// Fetch single order by ID
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!id,
  });
}

// Update order status mutation
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update order status");
    },
  });
}

// Update order mutation
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Order>;
    }) => {
      const { error } = await supabase
        .from("orders")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update order");
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";
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
      const params: Record<string, string> = {
        search: search.toString(),
        sortBy: sortBy.toString(),
        sortOrder: sortOrder.toString(),
        page: page.toString(),
        limit: limit.toString(),
      };

      // Only add status parameter if it's not "all"
      if (status !== "all") {
        params.status = status.toString();
      }

      const queryString = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/api/orders?${queryString}`);
      return response.data.orders;
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
      const params: Record<string, string> = {
        search: search.toString(),
      };

      // Only add status parameter if it's not "all"
      if (status !== "all") {
        params.status = status.toString();
      }

      const queryString = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(
        `/api/orders/count?${queryString}`,
      );
      return response.data.count;
    },
  });
}

// Fetch single order by ID
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/orders/${id}`);
      return response.data.order;
    },
    enabled: !!id,
  });
}

// Update order status mutation
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => {
      console.log("useUpdateOrderStatus: Updating order status:", {
        orderId,
        status,
      });

      const response = await axiosInstance.put("/api/orders", {
        id: orderId,
        order_status: status,
      });
      return response.data.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated successfully");
    },
    onError: (error: any) => {
      console.error("useUpdateOrderStatus: Mutation error:", error);
      toast.error(
        error.response?.data?.error || "Failed to update order status",
      );
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
      console.log("useUpdateOrder: Updating order:", { id, updates });

      const response = await axiosInstance.put("/api/orders", {
        id,
        ...updates,
      });
      return response.data.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order updated successfully");
    },
    onError: (error: any) => {
      console.error("useUpdateOrder: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to update order");
    },
  });
}

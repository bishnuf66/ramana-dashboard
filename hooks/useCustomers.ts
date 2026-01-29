import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";

interface Customer {
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_amount: number;
  created_at: string;
  order_status: string;
}

interface CustomerQueryParams {
  search?: string;
  sortBy?: "created_at" | "total_amount" | "customer_name" | "customer_email";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Fetch all customers with search, filter, and sorting
export function useCustomers(params: CustomerQueryParams = {}) {
  const {
    search = "",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  return useQuery({
    queryKey: ["customers", { search, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: search.toString(),
        sortBy: sortBy.toString(),
        sortOrder: sortOrder.toString(),
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await axiosInstance.get(`/api/customers?${params}`);
      return response.data.customers;
    },
  });
}

// Fetch customer count for pagination
export function useCustomersCount(
  params: Omit<CustomerQueryParams, "page" | "limit"> = {},
) {
  const { search = "" } = params;

  return useQuery({
    queryKey: ["customers-count", { search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: search.toString(),
      });

      const response = await axiosInstance.get(
        `/api/customers/count?${params}`,
      );
      return response.data.count;
    },
  });
}

// Fetch single customer by ID
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/customers/${id}`);
      return response.data.customer;
    },
    enabled: !!id,
  });
}

// Create customer mutation
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData: any) => {
      console.log(
        "useCreateCustomer: Creating customer via API:",
        customerData,
      );

      const response = await axiosInstance.post("/api/customers", customerData);
      return response.data.customer;
    },
    onSuccess: () => {
      toast.success("Customer created successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers-count"] });
    },
    onError: (error: any) => {
      console.error("useCreateCustomer: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to create customer");
    },
  });
}

// Update customer mutation
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...customerData }: any) => {
      console.log("useUpdateCustomer: Updating customer via API:", {
        id,
        customerData,
      });

      const response = await axiosInstance.put("/api/customers", {
        id,
        ...customerData,
      });
      return response.data.customer;
    },
    onSuccess: (data: any) => {
      toast.success("Customer updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers-count"] });
      queryClient.invalidateQueries({ queryKey: ["customers", data.id] });
    },
    onError: (error: any) => {
      console.error("useUpdateCustomer: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to update customer");
    },
  });
}

// Delete customer mutation
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("useDeleteCustomer: Deleting customer via API:", id);

      const response = await axiosInstance.delete("/api/customers", {
        data: { id },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Customer deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers-count"] });
    },
    onError: (error: any) => {
      console.error("useDeleteCustomer: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to delete customer");
    },
  });
}

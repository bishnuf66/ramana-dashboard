import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";
import type { Database } from "@/types/database.types";

type UserPayment = Database["public"]["Tables"]["user_payments"]["Row"];
type PaymentOption = Database["public"]["Tables"]["payment_options"]["Row"];

interface UserPaymentQueryParams {
  search?: string;
  status?: "all" | "verified" | "pending" | "rejected";
  paymentMethod?: string;
  sortBy?: "created_at" | "paid_amount" | "updated_at";
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
    queryKey: [
      "userPayments",
      { search, status, paymentMethod, sortBy, sortOrder, page, limit },
    ],
    queryFn: async () => {
      const params: Record<string, string> = {
        search: search.toString(),
        paymentMethod: paymentMethod.toString(),
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
      const response = await axiosInstance.get(`/api/payments?${queryString}`);
      return response.data.userPayments;
    },
  });
}

// Fetch user payment count for pagination
export function useUserPaymentsCount(
  params: Omit<UserPaymentQueryParams, "page" | "limit"> = {},
) {
  const { search = "", status = "all", paymentMethod = "" } = params;

  return useQuery({
    queryKey: ["userPayments-count", { search, status, paymentMethod }],
    queryFn: async () => {
      const params: Record<string, string> = {
        search: search.toString(),
        paymentMethod: paymentMethod.toString(),
      };

      // Only add status parameter if it's not "all"
      if (status !== "all") {
        params.status = status.toString();
      }

      const queryString = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(
        `/api/payments/count?${queryString}`,
      );
      return response.data.count;
    },
  });
}

// Fetch single user payment by ID
export function useUserPayment(id: string) {
  return useQuery({
    queryKey: ["userPayments", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/payments/${id}`);
      return response.data.userPayment;
    },
    enabled: !!id,
  });
}

// Verify payment mutation
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      console.log("useVerifyPayment: Verifying payment via API:", {
        id,
        verified,
      });

      const response = await axiosInstance.post("/api/payments/verify", {
        id,
        verified,
      });
      return response.data;
    },
    onSuccess: (_, { verified }) => {
      toast.success(
        `Payment ${verified ? "verified" : "unverified"} successfully!`,
      );
      queryClient.invalidateQueries({ queryKey: ["userPayments"] });
      queryClient.invalidateQueries({ queryKey: ["userPayments-count"] });
    },
    onError: (error: any) => {
      console.error("useVerifyPayment: Mutation error:", error);
      toast.error(
        error.response?.data?.error || "Failed to update payment status",
      );
    },
  });
}

// Delete payment mutation
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("useDeletePayment: Deleting payment via API:", id);

      // First, fetch the payment details to get the image URL
      try {
        const paymentResponse = await axiosInstance.get(`/api/payments/${id}`);
        const payment = paymentResponse.data.userPayment;

        // Delete the payment screenshot image if it exists
        if (payment?.payment_screenshot) {
          console.log(
            "useDeletePayment: Deleting payment screenshot:",
            payment.payment_screenshot,
          );
          try {
            // Directly call the upload API to delete the image
            await axiosInstance.delete("/api/upload", {
              data: {
                imageUrl: payment.payment_screenshot,
                bucket: "payment-screenshots", // Assuming screenshots are stored in this bucket
              },
            });
            console.log(
              "useDeletePayment: Payment screenshot deleted successfully",
            );
          } catch (imageError) {
            console.warn(
              "useDeletePayment: Failed to delete payment screenshot:",
              imageError,
            );
            // Don't fail the entire delete operation if image deletion fails
          }
        }
      } catch (fetchError) {
        console.warn(
          "useDeletePayment: Failed to fetch payment details for image deletion:",
          fetchError,
        );
        // Continue with payment deletion even if we can't fetch details
      }

      // Now delete the payment record
      const response = await axiosInstance.delete(`/api/payments?id=${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Payment and associated image deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["userPayments"] });
      queryClient.invalidateQueries({ queryKey: ["userPayments-count"] });
    },
    onError: (error: any) => {
      console.error("useDeletePayment: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to delete payment");
    },
  });
}

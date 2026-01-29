import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";
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
    queryKey: [
      "paymentOptions",
      { search, status, sortBy, sortOrder, page, limit },
    ],
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
      const response = await axiosInstance.get(
        `/api/payment-options?${queryString}`,
      );
      return response.data.paymentOptions;
    },
  });
}

// Fetch payment option count for pagination
export function usePaymentOptionsCount(
  params: Omit<PaymentOptionQueryParams, "page" | "limit"> = {},
) {
  const { search = "", status = "all" } = params;

  return useQuery({
    queryKey: ["paymentOptions-count", { search, status }],
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
        `/api/payment-options/count?${queryString}`,
      );
      return response.data.count;
    },
  });
}

// Fetch single payment option by ID
export function usePaymentOption(id: string) {
  return useQuery({
    queryKey: ["paymentOptions", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/payment-options/${id}`);
      return response.data.paymentOption;
    },
    enabled: !!id,
  });
}

// Create payment option mutation
export function useCreatePaymentOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentOptionData: any) => {
      console.log(
        "useCreatePaymentOption: Creating payment option via API:",
        paymentOptionData,
      );

      const response = await axiosInstance.post(
        "/api/payment-options",
        paymentOptionData,
      );
      return response.data.paymentOption;
    },
    onSuccess: () => {
      toast.success("Payment option created successfully!");
      queryClient.invalidateQueries({ queryKey: ["paymentOptions"] });
      queryClient.invalidateQueries({ queryKey: ["paymentOptions-count"] });
    },
    onError: (error: any) => {
      console.error("useCreatePaymentOption: Mutation error:", error);
      toast.error(
        error.response?.data?.error || "Failed to create payment option",
      );
    },
  });
}

// Update payment option mutation
export function useUpdatePaymentOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...paymentOptionData }: any) => {
      console.log("useUpdatePaymentOption: Updating payment option via API:", {
        id,
        paymentOptionData,
      });

      const response = await axiosInstance.put("/api/payment-options", {
        id,
        ...paymentOptionData,
      });
      return response.data.paymentOption;
    },
    onSuccess: (data: any) => {
      toast.success("Payment option updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["paymentOptions"] });
      queryClient.invalidateQueries({ queryKey: ["paymentOptions-count"] });
      queryClient.invalidateQueries({ queryKey: ["paymentOptions", data.id] });
    },
    onError: (error: any) => {
      console.error("useUpdatePaymentOption: Mutation error:", error);
      toast.error(
        error.response?.data?.error || "Failed to update payment option",
      );
    },
  });
}

// Delete payment option mutation
export function useDeletePaymentOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log(
        "useDeletePaymentOption: Deleting payment option via API:",
        id,
      );

      // First, fetch the payment option to get the image URL
      try {
        const paymentResponse = await axiosInstance.get(
          `/api/payment-options/${id}`,
        );
        const paymentOption = paymentResponse.data.paymentOption;

        // Delete the QR image if it exists
        if (paymentOption?.qr_image_url) {
          console.log(
            "useDeletePaymentOption: Deleting QR image:",
            paymentOption.qr_image_url,
          );
          try {
            await axiosInstance.delete("/api/upload", {
              data: {
                imageUrl: paymentOption.qr_image_url,
                bucket: "payment-qr-images",
              },
            });
            console.log(
              "useDeletePaymentOption: QR image deleted successfully",
            );
          } catch (imageError) {
            console.warn(
              "useDeletePaymentOption: Failed to delete QR image:",
              imageError,
            );
            // Don't fail the entire delete operation if image deletion fails
          }
        }
      } catch (fetchError) {
        console.warn(
          "useDeletePaymentOption: Failed to fetch payment option for image deletion:",
          fetchError,
        );
        // Continue with payment option deletion even if we can't fetch details
      }

      // Now delete the payment option
      const response = await axiosInstance.delete("/api/payment-options", {
        data: { id },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        "Payment option and associated image deleted successfully!",
      );
      queryClient.invalidateQueries({ queryKey: ["paymentOptions"] });
      queryClient.invalidateQueries({ queryKey: ["paymentOptions-count"] });
    },
    onError: (error: any) => {
      console.error("useDeletePaymentOption: Mutation error:", error);
      toast.error(
        error.response?.data?.error || "Failed to delete payment option",
      );
    },
  });
}

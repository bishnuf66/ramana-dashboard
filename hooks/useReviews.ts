import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";

interface Review {
  id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  rating: number;
  title?: string;
  content: string;
  helpful_count?: number;
  not_helpful_count?: number;
  verified_purchase?: boolean;
  status?: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at?: string;
}

interface ReviewQueryParams {
  productId?: string;
  sortBy?: "newest" | "oldest" | "highest" | "lowest";
  rating?: number;
  page?: number;
  limit?: number;
}

// Fetch all reviews with filters
export function useReviews(params: ReviewQueryParams = {}) {
  const {
    productId,
    sortBy = "newest",
    rating,
    page = 1,
    limit = 10,
  } = params;

  return useQuery({
    queryKey: ["reviews", { productId, sortBy, rating, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (productId) params.append("productId", productId);
      if (sortBy !== "newest") params.append("sortBy", sortBy);
      if (rating) params.append("rating", rating.toString());
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await axiosInstance.get(`/api/reviews?${params}`);
      return response.data.reviews || [];
    },
  });
}

// Fetch single review by ID
export function useReview(id: string) {
  return useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/reviews/${id}`);
      return response.data.review;
    },
    enabled: !!id,
  });
}

// Create review mutation
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: any) => {
      console.log("useCreateReview: Creating review via API:", reviewData);
      
      const response = await axiosInstance.post("/api/reviews", reviewData);
      return response.data.review;
    },
    onSuccess: () => {
      toast.success("Review created successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      console.error("useCreateReview: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to create review");
    },
  });
}

// Update review mutation
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...reviewData }: any) => {
      console.log("useUpdateReview: Updating review via API:", { id, reviewData });
      
      const response = await axiosInstance.put("/api/reviews", { id, ...reviewData });
      return response.data.review;
    },
    onSuccess: (data: any) => {
      toast.success("Review updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", data.id] });
    },
    onError: (error: any) => {
      console.error("useUpdateReview: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to update review");
    },
  });
}

// Delete review mutation
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("useDeleteReview: Deleting review via API:", id);
      
      const response = await axiosInstance.delete("/api/reviews", { data: { id } });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Review deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      console.error("useDeleteReview: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to delete review");
    },
  });
}

// Approve review mutation
export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("useApproveReview: Approving review via API:", id);
      
      const response = await axiosInstance.put("/api/reviews", { 
        id, 
        status: "approved" 
      });
      return response.data.review;
    },
    onSuccess: () => {
      toast.success("Review approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      console.error("useApproveReview: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to approve review");
    },
  });
}

// Reject review mutation
export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("useRejectReview: Rejecting review via API:", id);
      
      const response = await axiosInstance.put("/api/reviews", { 
        id, 
        status: "rejected" 
      });
      return response.data.review;
    },
    onSuccess: () => {
      toast.success("Review rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      console.error("useRejectReview: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to reject review");
    },
  });
}

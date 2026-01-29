import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";
import type { Database } from "@/types/database.types";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

interface TestimonialQueryParams {
  search?: string;
  status?: "all" | "published" | "draft";
  rating?: number;
  sortBy?: "created_at" | "name" | "rating" | "updated_at";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Fetch all testimonials with search, filter, and sorting
export function useTestimonials(params: TestimonialQueryParams = {}) {
  const {
    search = "",
    status = "all",
    rating,
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  return useQuery({
    queryKey: [
      "testimonials",
      { search, status, rating, sortBy, sortOrder, page, limit },
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: search.toString(),
        status: status.toString(),
        rating: rating?.toString() || "",
        sortBy: sortBy.toString(),
        sortOrder: sortOrder.toString(),
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await axiosInstance.get(`/api/testimonials?${params}`);
      return response.data.testimonials;
    },
  });
}

// Fetch testimonial count for pagination
export function useTestimonialsCount(
  params: Omit<TestimonialQueryParams, "page" | "limit"> = {},
) {
  const { search = "", status = "all", rating } = params;

  return useQuery({
    queryKey: ["testimonials-count", { search, status, rating }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: search.toString(),
        status: status.toString(),
        rating: rating?.toString() || "",
      });

      const response = await axiosInstance.get(
        `/api/testimonials/count?${params}`,
      );
      return response.data.count;
    },
  });
}

// Fetch single testimonial by ID
export function useTestimonial(id: string) {
  return useQuery({
    queryKey: ["testimonials", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/testimonials/${id}`);
      return response.data.testimonial;
    },
    enabled: !!id,
  });
}

// Create testimonial mutation
export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testimonialData: any) => {
      console.log(
        "useCreateTestimonial: Creating testimonial via API:",
        testimonialData,
      );

      const response = await axiosInstance.post(
        "/api/testimonials",
        testimonialData,
      );
      return response.data.testimonial;
    },
    onSuccess: () => {
      toast.success("Testimonial created successfully!");
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials-count"] });
    },
    onError: (error: any) => {
      console.error("useCreateTestimonial: Mutation error:", error);
      toast.error(
        error.response?.data?.error || "Failed to create testimonial",
      );
    },
  });
}

// Update testimonial mutation
export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...testimonialData }: any) => {
      console.log("useUpdateTestimonial: Updating testimonial via API:", {
        id,
        testimonialData,
      });

      const response = await axiosInstance.put("/api/testimonials", {
        id,
        ...testimonialData,
      });
      return response.data.testimonial;
    },
    onSuccess: (data: any) => {
      toast.success("Testimonial updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials-count"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials", data.id] });
    },
    onError: (error: any) => {
      console.error("useUpdateTestimonial: Mutation error:", error);
      toast.error(
        error.response?.data?.error || "Failed to update testimonial",
      );
    },
  });
}

// Delete testimonial mutation
export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("useDeleteTestimonial: Deleting testimonial via API:", id);

      const response = await axiosInstance.delete("/api/testimonials", {
        data: { id },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Testimonial deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials-count"] });
    },
    onError: (error: any) => {
      console.error("useDeleteTestimonial: Mutation error:", error);
      toast.error(
        error.response?.data?.error || "Failed to delete testimonial",
      );
    },
  });
}

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
      let query = (supabase as any)
        .from("testimonials")
        .select("*", { count: "exact", head: true });

      // Apply search filter
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,content.ilike.%${search}%,company.ilike.%${search}%`,
        );
      }

      // Apply status filter
      if (status !== "all") {
        query = query.eq("published", status === "published");
      }

      // Apply rating filter
      if (rating) {
        query = query.eq("rating", rating);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    },
  });
}

// Fetch single testimonial by ID
export function useTestimonial(id: string) {
  return useQuery({
    queryKey: ["testimonials", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("testimonials")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Testimonial;
    },
    enabled: !!id,
  });
}

// Create testimonial mutation
export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testimonialData: any) => {
      const { data, error } = await (supabase as any)
        .from("testimonials")
        .insert(testimonialData)
        .select()
        .single();

      if (error) throw error;
      return data as Testimonial;
    },
    onSuccess: () => {
      toast.success("Testimonial created successfully!");
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create testimonial");
    },
  });
}

// Update testimonial mutation
export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...testimonialData }: any) => {
      const { data, error } = await (supabase as any)
        .from("testimonials")
        .update(testimonialData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Testimonial;
    },
    onSuccess: (data: Testimonial) => {
      toast.success("Testimonial updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials-count"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials", data.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update testimonial");
    },
  });
}

// Delete testimonial mutation
export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("testimonials")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Testimonial deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete testimonial");
    },
  });
}

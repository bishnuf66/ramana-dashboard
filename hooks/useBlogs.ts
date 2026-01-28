import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type BlogPost = Database["public"]["Tables"]["blogs"]["Row"];

interface BlogQueryParams {
  search?: string;
  status?: "all" | "published" | "draft";
  sortBy?: "created_at" | "title" | "updated_at";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Fetch all blog posts with search, filter, and sorting
export function useBlogs(params: BlogQueryParams = {}) {
  const {
    search = "",
    status = "all",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  return useQuery({
    queryKey: ["blogs", { search, status, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      let query = (supabase as any).from("blogs").select("*");

      // Apply search filter
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,content_md.ilike.%${search}%,excerpt.ilike.%${search}%`,
        );
      }

      // Apply status filter
      if (status !== "all") {
        query = query.eq("published", status === "published");
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;
      return data as BlogPost[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

// Fetch blog count for pagination
export function useBlogsCount(
  params: Omit<BlogQueryParams, "page" | "limit"> = {},
) {
  const { search = "", status = "all" } = params;

  return useQuery({
    queryKey: ["blogs-count", { search, status }],
    queryFn: async () => {
      let query = (supabase as any)
        .from("blogs")
        .select("*", { count: "exact", head: true });

      // Apply search filter
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,content_md.ilike.%${search}%,excerpt.ilike.%${search}%`,
        );
      }

      // Apply status filter
      if (status !== "all") {
        query = query.eq("published", status === "published");
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

// Fetch single blog post by ID
export function useBlog(id: string) {
  return useQuery({
    queryKey: ["blogs", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id,
  });
}

// Create blog post mutation
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogData: any) => {
      const { data, error } = await (supabase as any)
        .from("blogs")
        .insert(blogData)
        .select()
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: () => {
      toast.success("Blog post created successfully!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create blog post");
    },
  });
}

// Update blog post mutation
export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...blogData }: any) => {
      const { data, error } = await (supabase as any)
        .from("blogs")
        .update(blogData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: (data: BlogPost) => {
      toast.success("Blog post updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs-count"] });
      queryClient.invalidateQueries({ queryKey: ["blogs", data.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update blog post");
    },
  });
}

// Delete blog post mutation
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("blogs")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Blog post deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete blog post");
    },
  });
}

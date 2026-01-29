import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";

interface User {
  id: string;
  email: string;
  created_at: string | null;
  last_sign_in_at: string | null;
  display_name: string | null;
  role: string;
}

interface UserQueryParams {
  search?: string;
  sortBy?: "created_at" | "email" | "role";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Fetch all users with search, filter, and sorting
export function useUsers(params: UserQueryParams = {}) {
  const {
    search = "",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  return useQuery({
    queryKey: ["users", { search, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: search.toString(),
        sortBy: sortBy.toString(),
        sortOrder: sortOrder.toString(),
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await axiosInstance.get(`/api/users?${params}`);
      return response.data.users;
    },
  });
}

// Fetch user count for pagination
export function useUsersCount(
  params: Omit<UserQueryParams, "page" | "limit"> = {},
) {
  const { search = "" } = params;

  return useQuery({
    queryKey: ["users-count", { search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: search.toString(),
      });

      const response = await axiosInstance.get(`/api/users/count?${params}`);
      return response.data.count;
    },
  });
}

// Fetch single user by ID
export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/users/${id}`);
      return response.data.user;
    },
    enabled: !!id,
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: any) => {
      console.log("useCreateUser: Creating user via API:", userData);
      
      const response = await axiosInstance.post("/api/users", userData);
      return response.data.user;
    },
    onSuccess: () => {
      toast.success("User created successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-count"] });
    },
    onError: (error: any) => {
      console.error("useCreateUser: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to create user");
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...userData }: any) => {
      console.log("useUpdateUser: Updating user via API:", { id, userData });
      
      const response = await axiosInstance.put("/api/users", { id, ...userData });
      return response.data.user;
    },
    onSuccess: (data: any) => {
      toast.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-count"] });
      queryClient.invalidateQueries({ queryKey: ["users", data.id] });
    },
    onError: (error: any) => {
      console.error("useUpdateUser: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to update user");
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("useDeleteUser: Deleting user via API:", id);
      
      const response = await axiosInstance.delete("/api/users", { data: { id } });
      return response.data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-count"] });
    },
    onError: (error: any) => {
      console.error("useDeleteUser: Mutation error:", error);
      toast.error(error.response?.data?.error || "Failed to delete user");
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}

interface ContactMessagesParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Fetch contact messages
export function useContactMessages(params: ContactMessagesParams = {}) {
  return useQuery({
    queryKey: ["contact-messages", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append("search", params.search);
      if (params.status) searchParams.append("status", params.status);
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());

      const response = await axiosInstance.get(`/api/contact-messages?${searchParams}`);
      return response.data;
    },
  });
}

// Update contact message (mark as read/unread)
export function useUpdateContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const response = await axiosInstance.put("/api/contact-messages", { id, is_read });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
  });
}

// Delete contact message
export function useDeleteContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete("/api/contact-messages", {
        data: { id },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
  });
}

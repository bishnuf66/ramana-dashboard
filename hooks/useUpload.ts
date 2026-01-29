import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";

interface UploadResponse {
  success: boolean;
  publicUrl: string;
  fileName: string;
  path: string;
}

interface UploadVariables {
  file: File;
  bucket: string;
}

export function useUpload() {
  const queryClient = useQueryClient();

  return useMutation<UploadResponse, Error, UploadVariables>({
    mutationFn: async ({ file, bucket }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      console.log("Uploading via API:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket,
      });

      const response = await axiosInstance.post<UploadResponse>(
        "/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log("Upload successful:", data);
      toast.success("Image uploaded successfully");

      // Invalidate relevant queries based on bucket
      if (variables.bucket === "blog-images") {
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
      } else if (variables.bucket === "category-images") {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else if (variables.bucket === "product-images") {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else if (variables.bucket === "testimonial-images") {
        queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      }
    },
    onError: (error: any) => {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.error || "Failed to upload image");
    },
  });
}

interface DeleteVariables {
  imageUrl: string;
  bucket: string;
}

export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, DeleteVariables>({
    mutationFn: async ({ imageUrl, bucket }) => {
      console.log("Deleting via API:", { imageUrl, bucket });

      const response = await axiosInstance.delete<{ success: boolean }>(
        "/api/upload",
        {
          data: { imageUrl, bucket },
        },
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      console.log("Delete successful");
      toast.success("Image deleted successfully");

      // Invalidate relevant queries based on bucket
      if (variables.bucket === "blog-images") {
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
      } else if (variables.bucket === "category-images") {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else if (variables.bucket === "product-images") {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else if (variables.bucket === "testimonial-images") {
        queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      }
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Failed to delete image");
    },
  });
}

"use client";

import { useState, useEffect } from "react";
import { Upload, X, Star, Save } from "lucide-react";
import Image from "next/image";
import { useUpdateTestimonial } from "@/hooks/useTestimonials";
import { useUpload } from "@/hooks/useUpload";
import { useDeleteImage } from "@/hooks/useUpload";
import { Database } from "@/types/database.types";
import MDEditor from "@uiw/react-md-editor";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
type TestimonialUpdate = Database["public"]["Tables"]["testimonials"]["Update"];

interface EditTestimonialFormProps {
  testimonial: Testimonial;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditTestimonialForm({
  testimonial,
  onSuccess,
  onCancel,
}: EditTestimonialFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const updateMutation = useUpdateTestimonial();
  const uploadMutation = useUpload();
  const deleteMutation = useDeleteImage();

  const [formData, setFormData] = useState<{
    name: string;
    role: string;
    rating: number;
    content: string;
    status: string;
  }>({
    name: "",
    role: "",
    rating: 5,
    content: "",
    status: "active",
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name,
        role: testimonial.role || "",
        rating: testimonial.rating || 5,
        content: testimonial.content,
        status: testimonial.status || "active",
      });
      setImagePreview(testimonial.image || "");
    }
  }, [testimonial]);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const result = await uploadMutation.mutateAsync({
        file,
        bucket: "testimonial-images"
      });
      return result.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const deleteImage = async (imageUrl: string): Promise<void> => {
    if (!imageUrl) return;

    try {
      await deleteMutation.mutateAsync({
        imageUrl,
        bucket: "testimonial-images"
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      // Don't throw - allow operation to continue
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const publicUrl = await uploadImage(file);
      setImagePreview(publicUrl || "");
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if image has changed and delete old image
      if (
        testimonial.image &&
        testimonial.image !== imagePreview
      ) {
        try {
          await deleteImage(testimonial.image);
        } catch (imageError) {
          console.warn("Failed to delete old testimonial image:", imageError);
          // Don't throw - continue with update
        }
      }

      // Update existing testimonial
      const updateData: TestimonialUpdate = {
        name: formData.name,
        role: formData.role,
        rating: formData.rating,
        content: formData.content,
        image: imagePreview || null,
        status: formData.status,
      };

      updateMutation.mutate(
        { id: testimonial.id, ...updateData },
        {
          onSuccess: () => {
            onSuccess();
          },
          onError: (error: any) => {
            console.error("Error updating testimonial:", error);
          },
          onSettled: () => {
            setLoading(false);
          }
        }
      );
    } catch (error) {
      console.error("Error saving testimonial:", error);
      setLoading(false);
    }
  };

  const removeImage = () => {
    // Clean up the object URL to prevent memory leaks
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setImageFile(null);
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter client name"
            required
          />
        </div>

        {/* Client Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client Role
          </label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter client role/title"
            required
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rating
        </label>
        {renderStars(formData.rating, (rating) =>
          setFormData({ ...formData, rating })
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Testimonial Content
        </label>
        <MDEditor
          value={formData.content}
          onChange={(value) =>
            setFormData({ ...formData, content: value || "" })
          }
          height={200}
          preview="edit"
          hideToolbar={false}
          visibleDragbar={false}
        />
      </div>

      {/* Client Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Client Image
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
          <div className="space-y-1 text-center">
            {imagePreview ? (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Client preview"
                  width={200}
                  height={200}
                  className="mx-auto h-32 w-32 object-cover rounded-full"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                htmlFor="client-image-upload"
                className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
              >
                <span>Upload a file</span>
                <input
                  id="client-image-upload"
                  name="client-image-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={loading || uploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 10MB. Square image recommended.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {loading ? "Updating..." : uploading ? "Uploading..." : "Update Testimonial"}
        </button>
      </div>
    </form>
  );
}

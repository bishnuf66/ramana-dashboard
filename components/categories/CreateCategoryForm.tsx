"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { generateSlug } from "@/lib/utils";
import Image from "next/image";
import MDEditor from "@uiw/react-md-editor";
import { Database } from "@/types/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryFormData = Omit<Category, "id" | "created_at" | "updated_at">;

interface CreateCategoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateCategoryForm({
  onSuccess,
  onCancel,
}: CreateCategoryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    picture: null,
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // Auto-generate slug from name whenever name changes
    if (formData.name) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.name),
      }));
    }
  }, [formData.name]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, picture: null }));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      console.log("Starting image upload for:", file.name);
      const fileName = `category-${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("category-images")
        .upload(fileName, file);

      if (error) {
        console.error("Storage upload error:", error);
        throw error;
      }

      console.log("File uploaded successfully:", data);

      const {
        data: { publicUrl },
      } = supabase.storage.from("category-images").getPublicUrl(fileName);

      console.log("Public URL generated:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error; // Re-throw to stop form submission
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);

    try {
      let pictureUrl = formData.picture;

      // Upload image if provided
      if (imageFile) {
        console.log("Image file detected, starting upload...");
        try {
          const uploadedUrl = await uploadImage(imageFile);
          if (uploadedUrl) {
            pictureUrl = uploadedUrl;
            console.log("Image upload completed successfully");
          }
        } catch (uploadError: any) {
          console.error("Image upload failed:", uploadError);
          toast.error(
            "Failed to upload image. Please try again or remove the image.",
          );
          return; // Stop form submission if image upload fails
        }
      }

      console.log("Creating category with payload...");
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description || null,
        picture: pictureUrl,
        created_at: new Date().toISOString(),
      };

      console.log("Payload:", payload);

      // Create new category
      const { error } = await (supabase as any)
        .from("categories")
        .insert([payload]);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Category created successfully");
      toast.success("Category created successfully!");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard?section=categories");
      }
    } catch (error: any) {
      console.error("Error creating category:", error);
      console.error("Form data:", formData);
      console.error("Image file:", imageFile);

      // More specific error handling
      if (error.message?.includes("toLocaleLowerCase")) {
        toast.error("Error with form data. Please try again.");
      } else if (
        error.message?.includes("storage") ||
        error.message?.includes("upload")
      ) {
        toast.error("Error uploading image. Please try again.");
      } else {
        toast.error(error.message || "Failed to create category");
      }
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Category
        </h1>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Category Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter category name"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            placeholder="category-url-slug"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Auto-generated from category name (read-only)
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Description
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <MDEditor
              value={formData.description?.toString() || ""}
              onChange={(val: any) =>
                setFormData((prev) => ({ ...prev, description: val || "" }))
              }
              height={200}
              className="min-h-[200px]"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Rich text description of the category for SEO and user understanding
          </p>
        </div>

        {/* Category Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Image (Optional)
          </label>

          {imagePreview ? (
            <div className="relative">
              <Image
                src={imagePreview}
                alt="Category preview"
                width={192}
                height={192}
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="category-image"
              />
              <label htmlFor="category-image" className="cursor-pointer">
                <div className="text-gray-500 dark:text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm">Click to upload image</p>
                  <p className="text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}

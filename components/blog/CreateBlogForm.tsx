"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Upload, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import MDEditor from "@uiw/react-md-editor";
import Link from "next/link";
import type { Database } from "@/types/database.types";
import { useCreateBlog } from "@/hooks/useBlogs";

type BlogPost = Database["public"]["Tables"]["blogs"]["Row"];

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string;
  published: boolean;
  created_by: string | null;
  cover_image_url: string | null;
  read_min: number | null;
  tags: string[] | null;
}

interface CreateBlogFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateBlogForm({ onSuccess, onCancel }: CreateBlogFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [tagInput, setTagInput] = useState("");

  const createBlogMutation = useCreateBlog();
  const loading = createBlogMutation.isPending;

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: null,
    content_md: "",
    published: false,
    created_by: null,
    cover_image_url: null,
    read_min: null,
    tags: null,
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      console.log("Starting image upload for:", file.name);
      const fileName = `blog-${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("blog-images")
        .upload(fileName, file);

      if (error) {
        console.error("Storage upload error:", error);
        throw error;
      }

      console.log("File uploaded successfully:", data);

      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-images").getPublicUrl(fileName);

      console.log("Public URL generated:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error; // Re-throw to stop form submission
    }
  };

  const deleteImage = async (imageUrl: string): Promise<void> => {
    if (!imageUrl) return;

    try {
      // Extract path from URL
      // Supabase Storage URLs look like: https://[project].supabase.co/storage/v1/object/public/blog-images/path/to/file.jpg
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/");
      const pathIndex = pathParts.indexOf("blog-images");

      if (pathIndex === -1) {
        // If it's not a Supabase Storage URL, skip deletion
        console.log("Skipping deletion - not a Supabase Storage URL:", imageUrl);
        return;
      }

      const filePath = pathParts.slice(pathIndex + 1).join("/");

      const { error } = await supabase.storage
        .from("blog-images")
        .remove([filePath]);

      if (error) {
        console.error("Failed to delete image:", error);
        // Don't throw - allow operation to continue even if deletion fails
      } else {
        console.log("Successfully deleted image:", filePath);
      }
    } catch (error) {
      console.error("Error parsing image URL:", error);
      // Don't throw - allow operation to continue
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), trimmedTag],
      });
    }
    setTagInput("");
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((_, i) => i !== index),
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    } else if (
      e.key === "Backspace" &&
      tagInput === "" &&
      formData.tags &&
      formData.tags.length > 0
    ) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(formData.tags.length - 1);
    }
  };

  const handleTagInputBlur = () => {
    if (tagInput.trim()) {
      addTag(tagInput);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    setFormData((prev) => ({
      ...prev,
      title,
      slug: slug, // Always update slug when title changes
    }));
  };

  const handleInsertImage = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        content_md: `${prev.content_md}\n\n![](${url})\n`,
      }));
    } catch (error: any) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.slug.trim() ||
      !formData.created_by?.trim()
    ) {
      return;
    }

    try {
      let coverImageUrl = formData.cover_image_url;

      if (coverImageFile) {
        console.log("Uploading cover image...");
        coverImageUrl = await uploadImage(coverImageFile);
        if (!coverImageUrl) {
          throw new Error("Failed to upload cover image");
        }
        console.log("Cover image uploaded successfully:", coverImageUrl);
      }

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt?.trim() || null,
        content_md: formData.content_md || "",
        cover_image_url: coverImageUrl || null,
        published: formData.published,
        created_by: formData.created_by?.trim() || "Admin",
        read_min: formData.read_min,
        tags: formData.tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      createBlogMutation.mutate(payload);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard?section=blog");
      }
    } catch (error: any) {
      console.error("Error submitting blog:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard?section=blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog Manager
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Blog Post
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter blog post title"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="blog-post-slug"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              URL-friendly version of title (auto-generated from title)
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt || ""}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Brief summary of the blog post"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image
            </label>
            {coverImagePreview ? (
              <div className="relative">
                <Image
                  src={coverImagePreview}
                  alt="Cover image preview"
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImageFile(null);
                    setCoverImagePreview("");
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                  id="cover-image"
                />
                <label htmlFor="cover-image" className="cursor-pointer">
                  <div className="text-gray-500 dark:text-gray-400">
                    <Upload className="mx-auto h-12 w-12 mb-3" />
                    <p className="text-sm">Click to upload cover image</p>
                    <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <MDEditor
                value={formData.content_md}
                onChange={(val: any) =>
                  setFormData({ ...formData, content_md: val || "" })
                }
                height={400}
                className="min-h-[400px]"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[48px]">
                {formData.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={handleTagInputBlur}
                  placeholder="Add tag..."
                  className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Reading Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reading Time (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={formData.read_min || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  read_min: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Estimated reading time"
            />
          </div>

          {/* Published */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) =>
                setFormData({ ...formData, published: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Publish immediately
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : uploading ? "Uploading..." : "Create Blog Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

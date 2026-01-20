"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { uploadImage, generateBlogImagePath } from "@/lib/supabase/storage";
import { Upload, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import MDEditor from "@uiw/react-md-editor";
import Link from "next/link";

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content_md: "",
    published: false,
    created_by: "",
  });

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
      slug: prev.slug || slug,
    }));
  };

  const handleInsertImage = async (file: File) => {
    setUploading(true);
    try {
      const path = generateBlogImagePath("draft", file.name, "inline");
      const url = await uploadImage(file, path, "blog-images");
      setFormData((prev) => ({
        ...prev,
        content_md: `${prev.content_md}\n\n![](${url})\n`,
      }));
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.slug.trim() ||
      !formData.created_by.trim()
    ) {
      toast.error("Title, slug, and created by are required");
      return;
    }

    setLoading(true);
    try {
      let coverImageUrl = "";

      if (coverImageFile) {
        const path = generateBlogImagePath(
          "draft",
          coverImageFile.name,
          "cover",
        );
        coverImageUrl = await uploadImage(coverImageFile, path, "blog-images");
      }

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim() || null,
        content_md: formData.content_md || "",
        cover_image_url: coverImageUrl || null,
        published: formData.published,
        created_by: formData.created_by.trim() || "Admin",
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any).from("blogs").insert([payload]);

      if (error) throw error;

      toast.success("Blog post created successfully!");
      router.push("/dashboard?section=blog");
    } catch (error: any) {
      toast.error(error.message || "Failed to create blog post");
    } finally {
      setLoading(false);
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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter blog post title"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="blog-post-slug"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              URL-friendly version of the title (auto-generated from title)
            </p>
          </div>

          {/* Created By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Created By
            </label>
            <input
              type="text"
              value={formData.created_by}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, created_by: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Author name"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Brief excerpt"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="w-full text-sm text-gray-700 dark:text-gray-300"
            />
            {coverImagePreview && (
              <div className="mt-3">
                <Image
                  src={coverImagePreview}
                  alt="Cover preview"
                  width={200}
                  height={150}
                  className="object-cover rounded"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content (Markdown)
            </label>
            <div className="mb-2">
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) handleInsertImage(file);
                  };
                  input.click();
                }}
                disabled={uploading}
                className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Insert Image"}
              </button>
            </div>
            <MDEditor
              value={formData.content_md}
              onChange={(val: any) =>
                setFormData((prev) => ({ ...prev, content_md: val || "" }))
              }
              height={400}
            />
          </div>

          {/* Published */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  published: e.target.checked,
                }))
              }
              className="rounded"
            />
            <label
              htmlFor="published"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Published
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Blog Post"}
            </button>
            <Link
              href="/dashboard?section=blog"
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { uploadImage, generateBlogImagePath } from "@/lib/supabase/storage";
import { Upload, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import MDEditor from "@uiw/react-md-editor";
import Link from "next/link";

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content_md: string;
  published: boolean;
  created_by: string;
  cover_image_url: string;
}

interface BlogFormProps {
  blogId?: string;
  initialData?: any;
}

export default function BlogForm({ blogId, initialData }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content_md: "",
    published: false,
    created_by: "",
    cover_image_url: "",
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      if (initialData.cover_image_url) {
        setCoverImagePreview(initialData.cover_image_url);
      }
    }
  }, [initialData]);

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
      const path = generateBlogImagePath(
        blogId || "draft",
        file.name,
        "inline",
      );
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
      let coverImageUrl = formData.cover_image_url;

      if (coverImageFile) {
        const path = generateBlogImagePath(
          blogId || "draft",
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

      let result;
      if (blogId) {
        // Update existing blog
        result = await (supabase as any)
          .from("blogs")
          .update(payload)
          .eq("id", blogId);
      } else {
        // Create new blog
        result = await (supabase as any).from("blogs").insert([payload]);
      }

      const { error } = result;
      if (error) throw error;

      toast.success(
        blogId
          ? "Blog post updated successfully!"
          : "Blog post created successfully!",
      );
      router.push("/dashboard?section=blog");
    } catch (error: any) {
      toast.error(
        error.message || `Failed to ${blogId ? "update" : "create"} blog post`,
      );
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!blogId;

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
            {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
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
              Title
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
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="blog-post-slug"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              URL-friendly version of title (auto-generated from title)
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="Brief excerpt"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:rounded-lg file:border-0 file:bg-gray-50 file:text-gray-700 dark:file:bg-gray-800 dark:file:text-gray-300 cursor-pointer"
              />
              {coverImagePreview && (
                <div className="relative group">
                  <Image
                    src={coverImagePreview}
                    alt="Cover preview"
                    width={400}
                    height={200}
                    className="w-full h-auto object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImageFile(null);
                      setCoverImagePreview("");
                      setFormData((prev) => ({ ...prev, cover_image_url: "" }));
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content (Markdown)
            </label>
            <div className="mb-3">
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
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                {uploading ? "Uploading..." : "Insert Image"}
              </button>
            </div>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <MDEditor
                value={formData.content_md}
                onChange={(val: any) =>
                  setFormData((prev) => ({ ...prev, content_md: val || "" }))
                }
                height={400}
                className="min-h-[400px]"
              />
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
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
              className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="published"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
            >
              Published
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8 8 0 018 0z"
                    ></path>
                  </svg>
                  {isEditing ? "Updating..." : "Creating..."}
                </span>
              ) : isEditing ? (
                "Update Blog Post"
              ) : (
                "Create Blog Post"
              )}
            </button>
            <Link
              href="/dashboard?section=blog"
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

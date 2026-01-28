import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Edit, Trash2, Eye, Calendar, User } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import Link from "next/link";
import ActionButtons from "@/components/ui/ActionButtons";
import { generateBlogImagePath, uploadImage } from "@/lib/supabase/storage";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string;
  cover_image_url: string | null;
  published: boolean;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface BlogListProps {
  onEdit?: (post: BlogPost) => void;
  onDelete?: (id: string) => void;
  showViewButton?: boolean;
  showCreateButton?: boolean;
}

type BlogDraft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content_md: string;
  cover_image_url: string;
  published: boolean;
  created_by: string;
};

export default function BlogList({
  onEdit,
  onDelete,
  showViewButton = true,
  showCreateButton = true,
}: BlogListProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogForm, setBlogForm] = useState<BlogDraft>({
    title: "",
    slug: "",
    excerpt: "",
    content_md: "",
    cover_image_url: "",
    published: false,
    created_by: "",
  });
  const [blogSaving, setBlogSaving] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("blogs")
          .select(
            "id, title, slug, excerpt, content_md, cover_image_url, published, created_at, updated_at",
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        setBlogs((data as any) || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load blogs");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const handleSaveBlog = async () => {
    if (
      !blogForm.title.trim() ||
      !blogForm.slug.trim() ||
      !blogForm.created_by.trim()
    ) {
      toast.error("Title, slug, and created by are required");
      return;
    }

    setBlogSaving(true);
    try {
      const payload = {
        title: blogForm.title.trim(),
        slug: blogForm.slug.trim(),
        excerpt: blogForm.excerpt.trim() || null,
        content_md: blogForm.content_md || "",
        cover_image_url: blogForm.cover_image_url || null,
        published: blogForm.published,
        created_by: blogForm.created_by.trim() || "Admin",
        updated_at: new Date().toISOString(),
      };

      if (editingBlogId) {
        const { error } = await (supabase as any)
          .from("blogs")
          .update(payload)
          .eq("id", editingBlogId);
        if (error) throw error;
        toast.success("Blog updated");
      } else {
        const { error } = await (supabase as any).from("blogs").insert({
          ...payload,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
        toast.success("Blog created");
      }

      const { data, error: reloadError } = await (supabase as any)
        .from("blogs")
        .select(
          "id, title, slug, excerpt, content_md, cover_image_url, published, created_at, updated_at",
        )
        .order("created_at", { ascending: false });
      if (reloadError) throw reloadError;
      setBlogs(data || []);

      resetBlogForm();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save blog");
    } finally {
      setBlogSaving(false);
    }
  };

  const resetBlogForm = () => {
    setBlogForm({
      title: "",
      slug: "",
      excerpt: "",
      content_md: "",
      cover_image_url: "",
      published: false,
      created_by: "",
    });
    setEditingBlogId(null);
  };

  const uploadBlogCover = async (file: File) => {
    const blogId = editingBlogId || "draft";
    const path = generateBlogImagePath(blogId, file.name, "cover");
    const url = await uploadImage(file, path, "blog-images");
    setBlogForm((prev) => ({ ...prev, cover_image_url: url }));
  };

  const insertInlineImage = async (file: File) => {
    const blogId = editingBlogId || "draft";
    const path = generateBlogImagePath(blogId, file.name, "inline");
    const url = await uploadImage(file, path, "blog-images");
    setBlogForm((prev) => ({
      ...prev,
      content_md: `${prev.content_md}\n\n![](${url})\n`,
    }));
  };

  const startEditBlog = (post: BlogPost) => {
    setBlogForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content_md: post.content_md,
      cover_image_url: post.cover_image_url || "",
      published: post.published,
      created_by: post.created_by || "",
    });
    setEditingBlogId(post.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const { error } = await (supabase as any)
        .from("blogs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Blog post deleted successfully!");
      setBlogs((prev) => prev.filter((blog) => blog.id !== id));

      if (onDelete) {
        onDelete(id);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete blog post");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Blog Posts
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {blogs.length} {blogs.length === 1 ? "post" : "posts"}
          </p>
        </div>

        {showCreateButton && (
          <Link
            href="/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m0 0H8m0 0v16h8m-4 4l4 4m0 0l4-4m0 0v16"
              />
            </svg>
            Create New Blog
          </Link>
        )}
      </div>

      {/* Blog Posts Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m-7 7a7 7 0 014 0h14a7 7 0 014 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 0h2m0 0v2h2m-4 4l4 4m0 0v2h2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Blog Posts Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start creating your first blog post to see it appear here.
              </p>
              <Link
                href="/blog/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Blog
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              {/* Cover Image */}
              {post.cover_image_url && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {post.title}
                </h3>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.created_by || "Unknown"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.created_at
                      ? new Date(post.created_at).toLocaleDateString()
                      : "No date"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.published
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                )}

                {/* Content Preview */}
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={
                    {
                      __html:
                        post.content_md.length > 200
                          ? post.content_md.substring(0, 200) + "..."
                          : post.content_md,
                    } as any
                  }
                />
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <ActionButtons
                  id={post.id}
                  type="blog"
                  style="icons"
                  onDelete={handleDelete}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

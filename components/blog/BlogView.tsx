import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Eye,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import Link from "next/link";
import ActionButtons from "@/components/ui/ActionButtons";
import type { Database } from "@/types/database.types";

type BlogPost = Database["public"]["Tables"]["blogs"]["Row"];

interface BlogViewProps {
  blogId?: string;
  showBackButton?: boolean;
  showActions?: boolean;
}

export default function BlogView({
  blogId,
  showBackButton = true,
  showActions = true,
}: BlogViewProps) {
  const router = useRouter();
  const params = useParams();
  const id = blogId || (params.id as string);

  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadBlog = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("blogs")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Blog post not found");

        setBlog(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load blog post");
        if (showBackButton) {
          router.push("/dashboard?section=blog");
        }
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [id, router, showBackButton]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    setDeleting(true);
    try {
      const { error } = await (supabase as any)
        .from("blogs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Blog post deleted successfully!");
      router.push("/dashboard?section=blog");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete blog post");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">
          Loading blog post...
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Blog Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The blog post you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          {showBackButton && (
            <Link
              href="/dashboard?section=blog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog Manager
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        {showBackButton && (
          <div className="mb-8">
            <Link
              href="/dashboard?section=blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog Manager
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {blog.created_by || "Unknown"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {blog.created_at
                  ? new Date(blog.created_at).toLocaleDateString()
                  : "No date"}
              </span>
              {blog.read_min && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {blog.read_min} min read
                </span>
              )}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  blog.published
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}
              >
                {blog.published ? "Published" : "Draft"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <ActionButtons
              id={blog.id}
              type="blog"
              style="pills"
              onDelete={handleDelete}
              showView={false}
            />
          )}
        </div>

        {/* Cover Image */}
        {blog.cover_image_url && (
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <Image
                src={blog.cover_image_url}
                alt={blog.title}
                width={1200}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Excerpt */}
        {blog.excerpt && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-600 dark:border-blue-400 rounded-r-lg">
            <div className="flex items-start gap-2">
              <div className="w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              <p className="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed">
                {blog.excerpt}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
          <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
            <div
              className="text-gray-800 dark:text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: blog.content_md.replace(/\n/g, "<br>"),
              }}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {blog.published
                  ? "Publicly visible"
                  : "Draft - not publicly visible"}
              </span>
            </div>
            <div>
              {blog.updated_at && blog.updated_at !== blog.created_at && (
                <span>
                  Last updated: {new Date(blog.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

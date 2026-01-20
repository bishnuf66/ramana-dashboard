"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Edit, Trash2, Calendar, User, Eye } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import Link from "next/link";

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

export default function BlogViewPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadBlog = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("blogs")
          .select("*")
          .eq("id", blogId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Blog post not found");

        setBlog(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load blog post");
        router.push("/dashboard?section=blog");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [blogId, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    setDeleting(true);
    try {
      const { error } = await (supabase as any)
        .from("blogs")
        .delete()
        .eq("id", blogId);

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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Blog Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The blog post you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            href="/dashboard?section=blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog Manager
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard?section=blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog Manager
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
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
            <div className="flex gap-2">
              <Link
                href={`/blog/${blog.id}/edit`}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {blog.cover_image_url && (
          <div className="mb-8">
            <Image
              src={blog.cover_image_url}
              alt={blog.title}
              width={800}
              height={400}
              className="w-full h-auto object-cover rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Excerpt */}
        {blog.excerpt && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-400 rounded">
            <p className="text-gray-700 dark:text-gray-300 italic">
              {blog.excerpt}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: blog.content_md.replace(/\n/g, "<br>"),
              }}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
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

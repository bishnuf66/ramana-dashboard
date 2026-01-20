"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import BlogForm from "@/components/blog/BlogForm";

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

export default function EditBlogPage() {
  const params = useParams();
  const blogId = params.id as string;
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<BlogPost> | null>(
    null,
  );

  // Load existing blog data
  const loadBlog = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("blogs")
        .select("*")
        .eq("id", blogId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Blog post not found");

      setInitialData(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load blog post");
      setInitialData(null);
    } finally {
      setInitialLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    loadBlog();
  }, [blogId, loadBlog]);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">
          Loading blog post...
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Blog Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The blog post you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
        </div>
      </div>
    );
  }

  return <BlogForm blogId={blogId} initialData={initialData} />;
}

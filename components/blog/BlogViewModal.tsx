"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Edit, Calendar, User, Clock, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DeleteModal from "@/components/ui/DeleteModal";
import { useDeleteBlog } from "@/hooks/useBlogs";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type BlogPost = Database["public"]["Tables"]["blogs"]["Row"];

interface BlogViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: BlogPost | null;
  onEdit?: (blog: BlogPost) => void;
  onDelete?: (blogId: string) => void;
  showActions?: boolean;
}

export default function BlogViewModal({
  isOpen,
  onClose,
  blog,
  onEdit,
  onDelete,
  showActions = true,
}: BlogViewModalProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteBlogMutation = useDeleteBlog();

  const handleDelete = async () => {
    if (!blog) return;

    try {
      await deleteBlogMutation.mutateAsync(blog.id);
      setShowDeleteModal(false);
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (!isOpen || !blog) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Blog Post Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Cover Image */}
            {blog.cover_image_url && (
              <div className="relative h-64 w-full">
                <Image
                  src={blog.cover_image_url}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-6">
              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {blog.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {blog.created_by || "Unknown"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {blog.created_at
                    ? new Date(blog.created_at).toLocaleDateString()
                    : "No date"}
                </span>
                {blog.read_min && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {blog.read_min} min read
                  </span>
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

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Excerpt */}
              {blog.excerpt && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Excerpt
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {blog.excerpt}
                  </p>
                </div>
              )}

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Content
                </h3>
                <div
                  className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{
                    __html: blog.content_md || "",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex gap-3">
                <Link
                  href={`/blog/${blog.id}/edit?section=blog`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Delete
                </button>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        description="Are you sure you want to delete"
        itemName={blog.title}
        itemsToDelete={[
          "Blog post and all content",
          "Cover image (if exists)",
          "SEO metadata and tags",
        ]}
        isLoading={deleteBlogMutation.isPending}
      />
    </>
  );
}

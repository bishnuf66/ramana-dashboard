"use client";
import { useState, useEffect } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import SearchFilterSort from "@/components/ui/SearchFilterSort";
import BlogViewModal from "./BlogViewModal";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/database.types";
import {
  useBlogs,
  useDeleteBlog,
  useCreateBlog,
  useUpdateBlog,
  useBlogsCount,
} from "@/hooks/useBlogs";

type BlogPost = Database["public"]["Tables"]["blogs"]["Row"];

interface BlogListProps {
  onEdit?: (post: BlogPost) => void;
  onDelete?: (id: string) => void;
  showViewButton?: boolean;
  showCreateButton?: boolean;
}

export default function BlogList({
  onEdit,
  onDelete,
  showViewButton = true,
  showCreateButton = true,
}: BlogListProps) {
  const queryClient = useQueryClient();

  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "published" | "draft"
  >("all");
  const [sortBy, setSortBy] = useState<"created_at" | "title" | "updated_at">(
    "created_at",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Invalidate cache when component mounts to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["blogs"] });
    queryClient.invalidateQueries({ queryKey: ["blogs-count"] });
  }, [queryClient]);

  // Mutations
  const deleteBlogMutation = useDeleteBlog();
  const createBlogMutation = useCreateBlog();
  const updateBlogMutation = useUpdateBlog();

  // Queries
  const {
    data: blogs = [],
    isLoading,
    error,
  } = useBlogs({
    search: searchTerm,
    status: selectedStatus,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  });

  const { data: totalCount = 0 } = useBlogsCount({
    search: searchTerm,
    status: selectedStatus,
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    deleteBlogMutation.mutate(id);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status as "all" | "published" | "draft");
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (field: "created_at" | "title" | "updated_at") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleView = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setShowViewModal(true);
  };

  const handleEdit = (blog: BlogPost) => {
    if (onEdit) {
      onEdit(blog);
    }
  };

  const handleModalDelete = (blogId: string) => {
    setShowViewModal(false);
    handleDelete(blogId);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">
          Failed to load blog posts. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(value) => {
          const [field, order] = value.split("-");
          handleSortChange(field as "created_at" | "title" | "updated_at");
          if (field !== sortBy) {
            setSortOrder(order as "asc" | "desc");
          }
        }}
        status={selectedStatus}
        onStatusChange={handleStatusChange}
        showStatusFilter={true}
        placeholder="Search blogs..."
        sortOptions={[
          { value: "created_at-desc", label: "Newest First" },
          { value: "created_at-asc", label: "Oldest First" },
          { value: "title-asc", label: "Title A-Z" },
          { value: "title-desc", label: "Title Z-A" },
          { value: "updated_at-desc", label: "Recently Updated" },
          { value: "updated_at-asc", label: "Least Recently Updated" },
        ]}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Blog Posts
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalCount} {totalCount === 1 ? "post" : "posts"}
          </p>
        </div>

        {showCreateButton && (
          <Link
            href="/dashboard/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            Create New Blog
          </Link>
        )}
      </div>

      {/* Blog Posts Grid */}
      {totalCount === 0 ? (
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
                href="/dashboard/blog/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Blog
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Blog Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Read Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {blogs.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {post.cover_image_url && (
                          <div className="flex-shrink-0 h-12 w-12">
                            <Image
                              src={post.cover_image_url}
                              alt={post.title}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {post.title}
                          </p>
                          {post.excerpt && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {post.created_by || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString()
                        : "No date"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {post.read_min ? `${post.read_min} min` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.tags && post.tags.length > 0 ? (
                          post.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            -
                          </span>
                        )}
                        {post.tags && post.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs font-medium">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.published
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(post)}
                          className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="View blog post"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/dashboard/blog/${post.id}/edit`}
                          className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          title="Edit blog post"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete blog post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {blogs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPageSelector={true}
        />
      )}

      {/* Blog View Modal */}
      <BlogViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        blog={selectedBlog}
        onEdit={handleEdit}
        onDelete={handleModalDelete}
      />
    </div>
  );
}

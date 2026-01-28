import { useState, useMemo } from "react";
import { Edit, Trash2, Eye, Calendar, User, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ActionButtons from "@/components/ui/ActionButtons";
import Pagination from "@/components/ui/Pagination";
import SearchFilterSort from "@/components/ui/SearchFilterSort";
import { generateBlogImagePath, uploadImage } from "@/lib/supabase/storage";
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
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
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
                  {post.read_min && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.read_min} min
                    </span>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs font-medium">
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          showItemsPerPageSelector={false}
        />
      )}
    </div>
  );
}

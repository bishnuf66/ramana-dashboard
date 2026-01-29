"use client";

import { useState } from "react";
import { Plus, Eye, Edit, Trash2, Star, MessageSquare } from "lucide-react";
import DeleteModal from "@/components/ui/DeleteModal";
import TestimonialViewModal from "./TestimonialViewModal";
import Pagination from "@/components/ui/Pagination";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import SearchFilterSort from "@/components/ui/SearchFilterSort";
import type { Database } from "@/types/database.types";
import {
  useTestimonials,
  useTestimonialsCount,
  useDeleteTestimonial,
} from "@/hooks/useTestimonials";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

const TestimonialList = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] =
    useState<Testimonial | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [testimonialToView, setTestimonialToView] =
    useState<Testimonial | null>(null);

  const deleteImage = async (imageUrl: string): Promise<void> => {
    if (!imageUrl) return;

    try {
      console.log("Deleting testimonial image via API:", imageUrl);

      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          bucket: "testimonial-images",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API delete error:", errorData);
        // Don't throw - allow operation to continue even if deletion fails
      } else {
        console.log(
          "Testimonial image deleted successfully via API:",
          imageUrl,
        );
      }
    } catch (error) {
      console.error("Error deleting testimonial image via API:", error);
      // Don't throw - allow operation to continue
    }
  };

  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "published" | "draft"
  >("all");
  const [sortBy, setSortBy] = useState<"created_at" | "rating">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // TanStack Query hooks
  const { data: testimonials = [], isLoading } = useTestimonials({
    search: searchTerm,
    status: selectedStatus,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  });

  const { data: total = 0 } = useTestimonialsCount({
    search: searchTerm,
    status: selectedStatus,
  });

  const deleteTestimonialMutation = useDeleteTestimonial();

  // Check if any filters are applied
  const hasFilters: boolean =
    !!searchTerm ||
    selectedStatus !== "all" ||
    sortBy !== "created_at" ||
    sortOrder !== "desc" ||
    itemsPerPage !== 10 ||
    currentPage !== 1;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as "all" | "published" | "draft");
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split("-");
    setSortBy(sort as any);
    setSortOrder(order as "asc" | "desc");
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortBy("created_at");
    setSortOrder("desc");
    setItemsPerPage(10);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!testimonialToDelete) return;

    try {
      // Delete image from storage if it exists
      if (testimonialToDelete.image) {
        try {
          await deleteImage(testimonialToDelete.image);
        } catch (imageError) {
          console.warn("Failed to delete testimonial image:", imageError);
        }
      }

      // Delete testimonial using mutation
      deleteTestimonialMutation.mutate(testimonialToDelete.id);

      setShowDeleteModal(false);
      setTestimonialToDelete(null);
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial");
    }
  };

  const renderStars = (rating: number | null) => {
    const safeRating = rating || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= safeRating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Testimonials
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer testimonials and reviews
          </p>
        </div>
        <Link
          href="/testimonials/new?section=testimonials"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Link>
      </div>

      {/* Filters */}
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        status={selectedStatus}
        onStatusChange={handleStatusChange}
        sortBy={`${sortBy}-${sortOrder}`}
        onSortChange={handleSortChange}
        showStatusFilter={true}
        showClearAll={hasFilters}
        onClearAll={handleClearAll}
        statusOptions={[
          { value: "all", label: "All Status" },
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
        ]}
        sortOptions={[
          { value: "created_at-desc", label: "Newest First" },
          { value: "created_at-asc", label: "Oldest First" },
          { value: "rating-desc", label: "Highest Rating" },
          { value: "rating-asc", label: "Lowest Rating" },
        ]}
        placeholder="Search testimonials..."
        statusLabel="Status"
      />

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            Showing {testimonials.length} of {total} testimonials
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : testimonials.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No testimonials found
                  </td>
                </tr>
              ) : (
                testimonials.map((testimonial) => (
                  <tr
                    key={testimonial.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {testimonial.image ? (
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {testimonial.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {testimonial.name}
                          </div>
                          {testimonial.role && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {testimonial.role}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                        {testimonial.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(testimonial.rating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          testimonial.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {testimonial.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.created_at
                        ? new Date(testimonial.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setTestimonialToView(testimonial);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/testimonials/${testimonial.id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          onClick={(e) => {
                            e.preventDefault();
                            setTestimonialToView(testimonial);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/testimonials/${testimonial.id}/edit?section=testimonials`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          onClick={() =>
                            console.log("Edit testimonial ID:", testimonial.id)
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setTestimonialToDelete(testimonial);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {testimonials.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={total}
          showItemsPerPageSelector={true}
        />
      )}

      {/* Modals */}
      {showViewModal && testimonialToView && (
        <TestimonialViewModal
          testimonial={testimonialToView}
          onClose={() => {
            setShowViewModal(false);
            setTestimonialToView(null);
          }}
        />
      )}

      {showDeleteModal && testimonialToDelete && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setTestimonialToDelete(null);
          }}
          onConfirm={handleDelete}
          title="Delete Testimonial"
          description={`Are you sure you want to delete the testimonial from ${testimonialToDelete.name}? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default TestimonialList;

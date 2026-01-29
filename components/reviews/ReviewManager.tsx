"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Star, Search, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ReviewViewModal from "./ReviewViewModal";
import Pagination from "@/components/ui/Pagination";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import {
  useReviews,
  useApproveReview,
  useRejectReview,
  useDeleteReview,
  type Review,
} from "@/hooks/useReviews";
import DeleteModal from "@/components/ui/DeleteModal";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import Image from "next/image";

type ProductReviewRow = Database["public"]["Tables"]["product_reviews"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

// Extended interface that adds UI-specific fields while keeping generated fields
type Review = ProductReviewRow & {
  products: Pick<ProductRow, "id" | "title" | "cover_image"> | null;
  // UI-specific computed fields
  product_name: string;
  product_image: string;
  title: string;
  content: string;
  verified_purchase: boolean;
  status: "pending" | "approved" | "rejected";
};

export default function ReviewManager() {
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [reviewToView, setReviewToView] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  // Get reviews data using hooks
  const {
    data: reviews = [],
    isLoading,
    error,
    refetch,
  } = useReviews({
    sortBy: "newest",
    rating: ratingFilter || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Mutations for review actions
  const approveReviewMutation = useApproveReview();
  const rejectReviewMutation = useRejectReview();
  const deleteReviewMutation = useDeleteReview();

  // Handle review actions
  const handleApproveReview = async (reviewId: string) => {
    await approveReviewMutation.mutateAsync(reviewId);
  };

  const handleRejectReview = async (reviewId: string) => {
    await rejectReviewMutation.mutateAsync(reviewId);
  };

  const handleDeleteReview = async (reviewId: string) => {
    await deleteReviewMutation.mutateAsync(reviewId);
    setShowDeleteModal(false);
    setSelectedReview(null);
  };

  const handleViewReview = (review: any) => {
    setReviewToView(review);
    setShowViewModal(true);
  };

  const openDeleteModal = (review: any) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  // Filter reviews based on status
  const filteredReviews = reviews.filter((review: any) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "approved") return review.status === "approved";
    if (statusFilter === "pending") return review.status === "pending";
    if (statusFilter === "rejected") return review.status === "rejected";
    return true;
  });

  // Search filter
  const searchedReviews = filteredReviews.filter(
    (review: any) =>
      review.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pagination calculations
  const totalPages = Math.ceil(searchedReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = searchedReviews.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          {error instanceof Error ? error.message : "Failed to fetch reviews"}
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: Review["status"]) => {
    const styles = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Review Management
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {reviews.length} total reviews
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={ratingFilter || ""}
            onChange={(e) =>
              setRatingFilter(e.target.value ? parseInt(e.target.value) : null)
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading reviews...
          </div>
        ) : paginatedReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No reviews found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedReviews.map((review) => (
                  <motion.tr
                    key={review.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={review.product_image}
                          alt={review.product_name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {review.product_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {review.product_id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {review.user_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {review.user_email}
                        </div>
                        {review.verified_purchase && (
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            ✓ Verified
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">{renderStars(review.rating)}</td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {review.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {review.content}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(review.status)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : "No date"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewReview(review)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="View review"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {review.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveReview(review.id)}
                              className="p-1 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectReview(review.id)}
                              className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {review.status === "approved" && (
                          <button
                            onClick={() => handleRejectReview(review.id)}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                            title="Unverify"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => openDeleteModal(review)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {reviews.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={reviews.length}
            />
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      <AnimatePresence>
        {showViewModal && reviewToView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Review Details
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setReviewToView(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {reviewToView && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        reviewToView.product_image || "/api/placeholder/100/100"
                      }
                      alt={reviewToView.product_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {reviewToView.product_name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {reviewToView.user_name} • {reviewToView.user_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStars(reviewToView.rating)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {reviewToView.rating} stars
                    </span>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Review
                    </h5>
                    <p className="text-gray-700 dark:text-gray-300">
                      {reviewToView.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      Status:{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reviewToView.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : reviewToView.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {reviewToView.status}
                      </span>
                    </span>
                    <span>
                      Date:{" "}
                      {new Date(reviewToView.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {reviewToView.status === "pending" && (
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => {
                          handleApproveReview(reviewToView.id);
                          setShowViewModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          handleRejectReview(reviewToView.id);
                          setShowViewModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedReview(null);
        }}
        onConfirm={() => handleDeleteReview(selectedReview.id)}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        itemName={
          selectedReview
            ? `${selectedReview.product_name} - By ${selectedReview.user_name}`
            : undefined
        }
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Star,
  Search,
  Filter,
  Trash2,
  Eye,
  Edit,
  Flag,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ActionButtons from "@/components/ui/ActionButtons";
import ReviewViewModal from "./ReviewViewModal";
import Pagination from "@/components/ui/Pagination";
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [reviewToView, setReviewToView] = useState<Review | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch directly from Supabase using browser client
      let query = supabase.from("product_reviews").select(`
          *,
          products!inner(
            id,
            title,
            cover_image
          )
        `);

      // Apply filters at database level
      if (statusFilter !== "all") {
        // Filter by is_verified column instead of status
        if (statusFilter === "approved") {
          query = query.eq("is_verified", true);
        } else if (statusFilter === "pending") {
          query = query.eq("is_verified", false);
        }
        // Note: "rejected" status doesn't exist in is_verified, so we'll handle it client-side
      }
      if (ratingFilter) {
        query = query.eq("rating", ratingFilter);
      }

      // Apply sorting
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw new Error("Failed to fetch reviews from database");
      }

      if (!data || data.length === 0) {
        setReviews([]);
        return;
      }

      // Transform data to match expected format using only generated types
      const transformedReviews = (data as any[]).map((review): Review => {
        // Extract product data from the join
        const product = review.products;

        return {
          ...review,
          products: product,
          // Map database fields to expected UI fields
          product_name: product?.title || `Product ${review.product_id}`,
          product_image: product?.cover_image || "/api/placeholder/100/100",
          title: "Review", // Since database uses 'comment' instead of 'title'
          content: review.comment || "",
          verified_purchase: review.is_verified || false,
          status: review.is_verified ? "approved" : "pending", // Use is_verified to determine status
        };
      });

      // Apply client-side search filter (since it's text-based)
      let filteredReviews = transformedReviews;

      // Apply status filter client-side since status column doesn't exist yet
      if (statusFilter !== "all") {
        filteredReviews = filteredReviews.filter(
          (r: Review) => r.status === statusFilter,
        );
      }

      setReviews(filteredReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews from database");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, ratingFilter, searchQuery]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Pagination logic
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return reviews.slice(startIndex, endIndex);
  }, [reviews, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, ratingFilter, itemsPerPage]);

  const handleStatusUpdate = async (
    reviewId: string,
    status: "approved" | "pending" | "rejected",
  ) => {
    try {
      // Update is_verified column instead of status
      const isVerified = status === "approved";

      const response = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, is_verified: isVerified }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to update review status");
      }

      // Update local state
      setReviews(
        reviews.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                verified_purchase: isVerified,
                status: isVerified ? "approved" : "pending",
                created_at: r.created_at || new Date().toISOString(),
              }
            : r,
        ),
      );
      toast.success(`Review ${status} successfully`);

      // Ensure UI stays in sync with DB (and join fields)
      fetchReviews();
    } catch (error) {
      console.error("Error updating review status:", error);
      toast.error("Failed to update review status");
    }
  };

  const handleViewReview = (review: Review) => {
    setReviewToView(review);
    setShowViewModal(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this review? This action cannot be undone.",
      )
    )
      return;

    try {
      // Delete from Supabase database
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) {
        console.error("Database delete error:", error);
        throw new Error("Failed to delete review from database");
      }

      // Update local state
      setReviews(reviews.filter((r) => r.id !== reviewId));
      toast.success("Review deleted successfully");

      if (selectedReview?.id === reviewId) {
        setSelectedReview(null);
        setShowReviewModal(false);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

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
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
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
                              onClick={() =>
                                handleStatusUpdate(review.id, "approved")
                              }
                              className="p-1 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(review.id, "rejected")
                              }
                              className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {review.status === "approved" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(review.id, "pending")
                            }
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                            title="Unverify"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <ActionButtons
                          id={review.id}
                          type="review"
                          onDelete={() => handleDeleteReview(review.id)}
                          showView={false}
                          showEdit={false}
                        />
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
        {showReviewModal && selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Review Details
                    </h3>
                    {getStatusBadge(selectedReview.status)}
                  </div>
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedReview(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Product Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Image
                      src={selectedReview.product_image}
                      alt={selectedReview.product_name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedReview.product_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Product ID: {selectedReview.product_id}
                      </div>
                    </div>
                  </div>

                  {/* Reviewer Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Reviewer Information
                    </h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Name:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedReview.user_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Email:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedReview.user_email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Verified Purchase:
                        </span>
                        <span
                          className={
                            selectedReview.verified_purchase
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          {selectedReview.verified_purchase ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Review Content
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {renderStars(selectedReview.rating)}
                        <span className="text-gray-500 dark:text-gray-400">
                          {selectedReview.rating} out of 5
                        </span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {selectedReview.title}
                        </h5>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedReview.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedReview.status === "pending" && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedReview.id, "approved");
                          setShowReviewModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve Review
                      </button>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedReview.id, "rejected");
                          setShowReviewModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review View Modal */}
      <ReviewViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        review={reviewToView}
        onDelete={(reviewId) => {
          handleDeleteReview(reviewId);
        }}
      />
    </div>
  );
}

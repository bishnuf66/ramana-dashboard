"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  X,
  Package,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DeleteModal from "@/components/ui/DeleteModal";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type ProductReviewRow = Database["public"]["Tables"]["product_reviews"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductReviewWithProduct = ProductReviewRow & {
  products: Pick<ProductRow, "id" | "title" | "cover_image"> | null;
};

interface ReviewViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ProductReviewWithProduct | null;
  onEdit?: (review: ProductReviewWithProduct) => void;
  onDelete?: (reviewId: string) => void;
  showActions?: boolean;
}

export default function ReviewViewModal({
  isOpen,
  onClose,
  review,
  onEdit,
  onDelete,
  showActions = true,
}: ReviewViewModalProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!review || !isOpen) return null;

  const handleDelete = async () => {
    if (!review) return;

    try {
      setDeleteLoading(true);

      // Step 1: Delete review images from storage if they exist
      if (review.review_images && review.review_images.length > 0) {
        for (const imageUrl of review.review_images) {
          if (imageUrl && imageUrl.includes("supabase")) {
            const filePath = imageUrl.split("/").pop();
            if (filePath) {
              const { error: storageError } = await supabase.storage
                .from("review-images")
                .remove([filePath]);
              if (storageError) {
                console.warn("Failed to delete review image:", storageError);
              }
            }
          }
        }
      }

      // Step 2: Delete the review
      const { error: deleteError } = await (supabase as any)
        .from("product_reviews")
        .delete()
        .eq("id", review.id);

      if (deleteError) {
        throw deleteError;
      }

      // Step 3: Close modals and notify parent
      setShowDeleteModal(false);
      onClose();

      if (onDelete) {
        onDelete(review.id);
      }

      toast.success("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to delete review: " + errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating
            ? "text-yellow-500 fill-current"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Review Details
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(review.is_verified ? "approved" : "pending")}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      review.is_verified ? "approved" : "pending",
                    )}`}
                  >
                    {review.is_verified ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Left Column - Review Content */}
              <div className="space-y-6">
                {/* Rating */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Rating
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {review.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      / 5.0
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Review Content
                  </h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {review.comment || "No comment provided"}
                    </p>
                  </div>
                </div>

                {/* Review Images */}
                {review.review_images && review.review_images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Review Images
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {review.review_images.map((image, index) => (
                        <div
                          key={index}
                          className="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                        >
                          <Image
                            src={image}
                            alt={`Review image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Helpfulness */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Helpfulness
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900 dark:text-white">
                        {review.helpful_count}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                      <span className="text-gray-900 dark:text-white">
                        {review.dislike_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Product & Reviewer Info */}
              <div className="space-y-6">
                {/* Product Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Product Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {review.products?.cover_image ? (
                        <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={review.products.cover_image}
                            alt={review.products.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {review.products?.title || "Unknown Product"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Product ID: {review.product_id}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviewer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Reviewer Information
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Name:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {review.user_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Email:
                      </span>
                      <span className="text-gray-900 dark:text-white text-sm truncate">
                        {review.user_email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Verified Purchase:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          review.is_verified
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {review.is_verified ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Created:
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">
                          {formatDate(review.created_at || "")}
                        </span>
                      </div>
                    </div>
                    {review.updated_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Updated:
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(review.updated_at)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {showActions && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/reviews/${review.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Review"
        description="Are you sure you want to delete"
        itemName={`Review by ${review.user_name}`}
        itemsToDelete={[
          "Review from database",
          "Review images from storage",
          "Helpfulness votes",
          "Product rating contribution",
        ]}
        isLoading={deleteLoading}
      />
    </>
  );
}

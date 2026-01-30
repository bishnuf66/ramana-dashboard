"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Edit, Trash2, Star, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DeleteModal from "@/components/ui/DeleteModal";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductReviewRow = Database["public"]["Tables"]["product_reviews"]["Row"];

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductRow | null;
  onEdit?: (product: ProductRow) => void;
  onDelete?: (productId: string) => void;
  showActions?: boolean;
  categoriesList?: { id: string; name: string }[];
}

export default function ProductViewModal({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete,
  showActions = true,
  categoriesList = [],
}: ProductViewModalProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  // Fetch reviews for this product
  useEffect(() => {
    if (product && isOpen) {
      fetchReviews();
    }
  }, [product, isOpen, reviewsPage]);

  const fetchReviews = async (page = 1) => {
    if (!product) return;

    try {
      setReviewsLoading(true);
      const itemsPerPage = 5;
      const startIndex = (page - 1) * itemsPerPage;

      // Get total count first
      const { count: totalCount, error: countError } = await supabase
        .from("product_reviews")
        .select("*", { count: "exact", head: true })
        .eq("product_id", product.id)
        .eq("is_verified", true);

      if (countError) throw countError;
      setTotalReviews(totalCount || 0);

      // Get paginated reviews
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", product.id)
        .eq("is_verified", true)
        .order("created_at", { ascending: false })
        .range(startIndex, startIndex + itemsPerPage - 1);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      setTotalReviews(0);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewsPageChange = (newPage: number) => {
    setReviewsPage(newPage);
  };

  // Calculate average rating from reviews
  const calculatedRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  // Debug: Log product data and reviews
  useEffect(() => {
    if (product) {
      console.log("Product data:", product);
      console.log("Reviews data:", reviews);
      console.log("Calculated rating:", calculatedRating);
    }
  }, [product, reviews, calculatedRating]);

  if (!product || !isOpen) return null;

  const handleDelete = async () => {
    if (!product) return;

    try {
      setDeleteLoading(true);

      // Step 1: Delete product images from storage
      const imagesToDelete = [];

      console.log("Starting image deletion for product:", product.id);

      // Add cover image
      if (product.cover_image) {
        imagesToDelete.push(product.cover_image);
        console.log("Found cover image:", product.cover_image);
      }

      // Add gallery images - handle both string and object formats
      if (product.gallery_images) {
        console.log("Processing gallery images:", product.gallery_images);

        if (Array.isArray(product.gallery_images)) {
          product.gallery_images.forEach((img: any) => {
            if (typeof img === "string") {
              imagesToDelete.push(img);
              console.log("Added gallery image (string format):", img);
            } else if (img && img.url) {
              imagesToDelete.push(img.url);
              console.log("Added gallery image (object format):", img.url);
            } else if (
              img &&
              typeof img === "object" &&
              Object.keys(img).length > 0
            ) {
              // Handle nested objects - check for common image properties
              if (img.url) {
                imagesToDelete.push(img.url);
                console.log("Added gallery image (nested object):", img.url);
              } else if (img.image) {
                imagesToDelete.push(img.image);
                console.log("Added gallery image (image property):", img.image);
              } else if (img.src) {
                imagesToDelete.push(img.src);
                console.log("Added gallery image (src property):", img.src);
              }
            }
          });
        } else if (typeof product.gallery_images === "string") {
          // Handle JSON string format
          try {
            const parsed = JSON.parse(product.gallery_images);
            if (Array.isArray(parsed)) {
              parsed.forEach((img: any) => {
                if (typeof img === "string") {
                  imagesToDelete.push(img);
                  console.log("Added gallery image (parsed string):", img);
                } else if (img && img.url) {
                  imagesToDelete.push(img.url);
                  console.log("Added gallery image (parsed object):", img.url);
                }
              });
            }
          } catch (e) {
            console.warn("Failed to parse gallery_images JSON:", e);
          }
        }
      }

      console.log("Total images to delete:", imagesToDelete.length);

      // Delete images from storage
      let deletedCount = 0;
      for (const imageUrl of imagesToDelete) {
        if (imageUrl && imageUrl.includes("supabase")) {
          const filePath = imageUrl.split("/").pop();
          console.log("Attempting to delete file:", filePath);

          if (filePath) {
            try {
              const { error: storageError } = await supabase.storage
                .from("product-images")
                .remove([filePath]);

              if (storageError) {
                console.error("Failed to delete image:", storageError);
              } else {
                console.log("Successfully deleted image:", filePath);
                deletedCount++;
              }
            } catch (deleteError) {
              console.error("Exception during image deletion:", deleteError);
            }
          }
        } else {
          console.log("Skipping non-supabase image:", imageUrl);
        }
      }

      console.log(
        `Deleted ${deletedCount} out of ${imagesToDelete.length} images`,
      );

      // Step 2: Delete related records (cascade)
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) {
        throw deleteError;
      }

      // Step 3: Close modals and notify parent
      setShowDeleteModal(false);
      onClose();

      if (onDelete) {
        onDelete(product.id);
      }

      toast.success("Product and all related data deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to delete product: " + errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categoriesList.find((cat) => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getStockStatus = (stock: number) => {
    if (stock > 10)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (stock > 0)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {product.title}
            </h2>
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
              {/* Left Column - Images */}
              <div className="space-y-4">
                {/* Cover Image */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Product Image
                  </h3>
                  <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {product.cover_image ? (
                      <Image
                        src={product.cover_image}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Images */}
                {(() => {
                  let galleryImages = product.gallery_images;

                  // Handle case where gallery_images might be a JSON string
                  if (typeof galleryImages === "string") {
                    try {
                      galleryImages = JSON.parse(galleryImages);
                    } catch (e) {
                      console.error("Failed to parse gallery_images JSON:", e);
                      galleryImages = null;
                    }
                  }

                  console.log("Gallery images debug:", {
                    gallery_images: product.gallery_images,
                    parsedGalleryImages: galleryImages,
                    isArray: Array.isArray(galleryImages),
                    length: Array.isArray(galleryImages)
                      ? galleryImages.length
                      : 0,
                    type: typeof galleryImages,
                  });

                  return (
                    galleryImages &&
                    Array.isArray(galleryImages) &&
                    galleryImages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Gallery Images ({galleryImages.length})
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {(galleryImages as any[]).map(
                            (image: any, index: number) => (
                              <div
                                key={index}
                                className="relative w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                              >
                                <Image
                                  src={
                                    typeof image === "string"
                                      ? image
                                      : image.url
                                  }
                                  alt={`${product.title} - Gallery ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    console.error(
                                      "Failed to load gallery image:",
                                      image,
                                      e,
                                    );
                                  }}
                                />
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Product Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Price:
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatPrice(product.discount_price || product.price)}
                        </div>
                        {product.discount_price && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Stock:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStockStatus(product.stock || 0)}`}
                      >
                        {product.stock || 0} units
                      </span>
                    </div>

                    {/* Dimensions */}
                    {(product.weight_gram ||
                      product.height_cm ||
                      product.width_cm ||
                      product.length_cm) && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Dimensions
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {product.weight_gram && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Weight:
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {product.weight_gram}g
                              </span>
                            </div>
                          )}
                          {product.height_cm && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Height:
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {product.height_cm}cm
                              </span>
                            </div>
                          )}
                          {product.width_cm && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Width:
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {product.width_cm}cm
                              </span>
                            </div>
                          )}
                          {product.length_cm && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Length:
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {product.length_cm}cm
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Rating:
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {calculatedRating > 0
                            ? `${calculatedRating.toFixed(1)} / 5`
                            : "No rating"}
                        </span>
                        {totalReviews > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({totalReviews}{" "}
                            {totalReviews === 1 ? "review" : "reviews"})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          Customer Reviews:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {totalReviews} total reviews
                          </span>
                          {totalReviews > 5 && (
                            <button
                              onClick={() => setShowAllReviews(!showAllReviews)}
                              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                              {showAllReviews ? "Show Less" : "View All"}
                            </button>
                          )}
                        </div>
                      </div>

                      {reviewsLoading ? (
                        <div className="text-center py-4">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-4">
                          <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No reviews yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {reviews.map((review) => (
                            <div
                              key={review.id}
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              onClick={() => setSelectedReview(review)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {review.user_name
                                      ?.charAt(0)
                                      .toUpperCase() || "U"}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {review.user_name || "Anonymous"}
                                    </p>
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < review.rating
                                              ? "text-yellow-500 fill-current"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(
                                      review.created_at,
                                    ).toLocaleDateString()}
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>👍 {review.helpful_count || 0}</span>
                                    <span>
                                      👎 {review.not_helpful_count || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                {review.comment}
                              </p>
                            </div>
                          ))}

                          {/* Pagination for Reviews */}
                          {totalReviews > 5 && (
                            <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <button
                                onClick={() =>
                                  handleReviewsPageChange(reviewsPage - 1)
                                }
                                disabled={reviewsPage === 1}
                                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-500"
                              >
                                Previous
                              </button>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Page {reviewsPage} of{" "}
                                {Math.ceil(totalReviews / 5)}
                              </span>
                              <button
                                onClick={() =>
                                  handleReviewsPageChange(reviewsPage + 1)
                                }
                                disabled={
                                  reviewsPage >= Math.ceil(totalReviews / 5)
                                }
                                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-500"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Category:
                      </span>
                      <span className="text-gray-900 dark:text-white capitalize">
                        {getCategoryName(product.category_id)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Status:
                      </span>
                      <div className="flex items-center gap-2">
                        {product.is_featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Created:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(product.created_at || "")}
                      </span>
                    </div>

                    {/* Tags */}
                    {product.tags &&
                      Array.isArray(product.tags) &&
                      product.tags.length > 0 && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Tags
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Description
                    </h3>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{
                        __html: product.description || "",
                      }}
                    />
                  </div>
                )}

                {/* Actions */}
                {showActions && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/products/${product.id}/edit`}
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
        title="Delete Product"
        description="Are you sure you want to delete"
        itemName={product.title}
        itemsToDelete={[
          "Product from catalog",
          "Cover image and gallery images",
          "All customer reviews",
          "Related order items",
          "Discount associations",
        ]}
        isLoading={deleteLoading}
      />

      {/* Detailed Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Review Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Customer Review
              </h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Review Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Reviewer Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                    {selectedReview.user_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedReview.user_name || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedReview.user_email || "No email provided"}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < selectedReview.rating
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedReview.rating}/5
                  </span>
                </div>

                {/* Review Date */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Reviewed on{" "}
                  {new Date(selectedReview.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </div>

                {/* Review Comment */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review:
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedReview.comment}
                  </p>
                </div>

                {/* Review Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span>👍</span>
                    <span>{selectedReview.helpful_count || 0} helpful</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👎</span>
                    <span>
                      {selectedReview.not_helpful_count || 0} not helpful
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>✅</span>
                    <span>Verified Purchase</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Review for:{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {product.title}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Review ID:{" "}
                    <span className="font-mono text-xs">
                      {selectedReview.id}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Review Modal Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

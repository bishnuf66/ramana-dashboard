"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, Camera, X, Upload, User } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import {
  ProductReview,
  ReviewFormData,
  ReviewFilters,
} from "../../types/review";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({
  productId,
  productName,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [userReview, setUserReview] = useState<ProductReview | null>(null);

  // Review form state
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 0,
    comment: "",
    reviewImages: [],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, [productId, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId);

      // Apply filters
      if (filters.rating) {
        query = query.eq("rating", filters.rating);
      }
      if (filters.hasImages) {
        query = query.not("review_images", "is", null);
      }
      if (filters.verified) {
        query = query.eq("is_verified", true);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "highest":
          query = query.order("rating", { ascending: false });
          break;
        case "lowest":
          query = query.order("rating", { ascending: true });
          break;
        case "most-helpful":
          query = query.order("helpful_count", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      const convertedReviews: ProductReview[] = (data || []).map((review) => ({
        id: review.id,
        productId: review.product_id,
        userId: review.user_id,
        userName: review.user_name,
        userEmail: review.user_email,
        rating: review.rating,
        comment: review.comment || "",
        reviewImages: review.review_images || [],
        isVerified: review.is_verified,
        helpfulCount: review.helpful_count,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      }));

      setReviews(convertedReviews);

      // Check if current user has already reviewed
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const userReview = convertedReviews.find((r) => r.userId === user.id);
        setUserReview(userReview || null);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + reviewForm.reviewImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error("Only image files under 5MB are allowed");
    }

    setReviewForm((prev) => ({
      ...prev,
      reviewImages: [...prev.reviewImages, ...validFiles],
    }));

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setReviewForm((prev) => ({
      ...prev,
      reviewImages: prev.reviewImages.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please log in to submit a review");
        return;
      }

      // Upload images first
      let uploadedImageUrls: string[] = [];
      if (reviewForm.reviewImages.length > 0) {
        for (const image of reviewForm.reviewImages) {
          const fileName = `reviews/${productId}/${user.id}/${Date.now()}-${image.name}`;
          const { error: uploadError } = await supabase.storage
            .from("review-images")
            .upload(fileName, image);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("review-images").getPublicUrl(fileName);

          uploadedImageUrls.push(publicUrl);
        }
      }

      const reviewData = {
        product_id: productId, // Now guaranteed to be a valid UUID
        user_id: user.id,
        user_name:
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Anonymous",
        user_email: user.email || "",
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        review_images: uploadedImageUrls,
        is_verified: false,
      };

      const { error } = await supabase
        .from("product_reviews")
        .insert(reviewData);

      if (error) throw error;

      toast.success("Review submitted successfully!");
      setShowReviewForm(false);
      setReviewForm({ rating: 0, comment: "", reviewImages: [] });
      setImagePreviews([]);
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulClick = async (reviewId: string) => {
    try {
      const { error } = await supabase.rpc("increment_helpful_count", {
        review_id: reviewId,
      });

      if (error) {
        // Fallback: update helpful count directly
        const currentReview = reviews.find((r) => r.id === reviewId);
        if (currentReview) {
          await supabase
            .from("product_reviews")
            .update({ helpful_count: currentReview.helpfulCount + 1 })
            .eq("id", reviewId);
        }
      }

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? { ...review, helpfulCount: review.helpfulCount + 1 }
            : review,
        ),
      );

      toast.success("Marked as helpful!");
    } catch (error) {
      console.error("Error marking helpful:", error);
      toast.error("Failed to mark as helpful");
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onRatingChange?: (rating: number) => void,
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? "hover:scale-110 transition-transform" : ""} ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            <Star
              className={`w-5 h-5 ${star <= rating ? "fill-current" : ""}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(
    (rating) => reviews.filter((review) => review.rating === rating).length,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Customer Reviews
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Rating Summary */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(averageRating))}
            <div className="text-gray-600 dark:text-gray-400 mt-2">
              {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating, index) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                  {rating}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width:
                        reviews.length > 0
                          ? (ratingCounts[index] / reviews.length) * 100
                          : 0,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                  {ratingCounts[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      {!userReview && (
        <div className="text-center">
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Write a Review
          </button>
        </div>
      )}

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Review: {productName}
                </h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating *
                  </label>
                  {renderStars(reviewForm.rating, true, (rating) =>
                    setReviewForm((prev) => ({ ...prev, rating })),
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review *
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Images (Optional - Max 5 images)
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p>Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {review.userName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {review.isVerified && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <div className="mb-3">{renderStars(review.rating)}</div>

              {review.comment && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {review.comment}
                </p>
              )}

              {review.reviewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {review.reviewImages.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`Review image ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleHelpfulClick(review.id)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulCount})
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  Plus,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-toastify";
import ActionButtons from "@/components/ui/ActionButtons";

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  user_avatar?: string;
  rating: number;
  title: string;
  content: string;
  helpful_count: number;
  not_helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
  updated_at?: string;
}

interface ReviewSystemProps {
  productId: string;
  userId?: string;
  productName: string;
  averageRating?: number;
  totalReviews?: number;
}

export default function ReviewSystem({
  productId,
  userId,
  productName,
  averageRating = 0,
  totalReviews = 0,
}: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    content: "",
  });

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        productId,
        sortBy,
        ...(filterRating && { rating: filterRating.toString() }),
      });

      const response = await fetch(`/api/reviews?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
      // Fallback to mock data if API fails
      const mockReviews: Review[] = [
        {
          id: "1",
          product_id: productId,
          user_id: "user1",
          user_name: "Sarah Johnson",
          user_email: "sarah@example.com",
          rating: 5,
          title: "Absolutely beautiful!",
          content:
            "The bouquet exceeded my expectations. Fresh flowers, beautifully arranged, and delivered on time. Will definitely order again!",
          helpful_count: 12,
          not_helpful_count: 1,
          verified_purchase: true,
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          product_id: productId,
          user_id: "user2",
          user_name: "Michael Chen",
          rating: 4,
          title: "Great quality",
          content:
            "Really nice flowers and good value for money. The only reason I'm not giving 5 stars is that one of the roses was slightly wilted.",
          helpful_count: 8,
          not_helpful_count: 2,
          verified_purchase: true,
          created_at: "2024-01-10T14:20:00Z",
        },
        {
          id: "3",
          product_id: productId,
          user_id: "user3",
          user_name: "Emily Davis",
          rating: 5,
          title: "Perfect for anniversary",
          content:
            "Ordered this for our anniversary and it was perfect. My wife loved it! The arrangement was exactly as pictured.",
          helpful_count: 15,
          not_helpful_count: 0,
          verified_purchase: true,
          created_at: "2024-01-05T09:15:00Z",
        },
      ];
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  }, [productId, sortBy, filterRating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingReview) {
        // Update existing review
        const response = await fetch("/api/reviews", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewId: editingReview.id,
            userId: userId || "guest",
            rating: formData.rating,
            title: formData.title,
            content: formData.content,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update review");
        }

        const data = await response.json();
        setReviews(
          reviews.map((r) => (r.id === editingReview.id ? data.review : r)),
        );
        toast.success("Review updated successfully");
      } else {
        // Add new review
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            userId: userId || "guest",
            rating: formData.rating,
            title: formData.title,
            content: formData.content,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create review");
        }

        const data = await response.json();
        setReviews([data.review, ...reviews]);
        toast.success("Review added successfully");
      }

      // Reset form
      setFormData({ rating: 5, title: "", content: "" });
      setShowAddReview(false);
      setEditingReview(null);
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(
        `/api/reviews?reviewId=${reviewId}&userId=${userId || "guest"}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      setReviews(reviews.filter((r) => r.id !== reviewId));
      toast.success("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      setReviews(
        reviews.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                helpful_count: helpful ? r.helpful_count + 1 : r.helpful_count,
                not_helpful_count: !helpful
                  ? r.not_helpful_count + 1
                  : r.not_helpful_count,
              }
            : r,
        ),
      );
    } catch (error) {
      toast.error("Failed to update helpful count");
    }
  };

  const startEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title,
      content: review.content,
    });
    setShowAddReview(true);
  };

  const renderStars = (rating: number, size = "sm") => {
    const starSize =
      size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingInput = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= formData.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Customer Reviews
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(averageRating), "lg")}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {totalReviews} reviews
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => r.rating === rating).length;
              const percentage =
                totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-3">
                    {rating}
                  </span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-10 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Review Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>

          <select
            value={filterRating || ""}
            onChange={(e) =>
              setFilterRating(e.target.value ? parseInt(e.target.value) : null)
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddReview(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Write Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {review.user_avatar ? (
                    <Image
                      src={review.user_avatar}
                      alt={review.user_name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {review.user_name}
                    </div>
                    {review.verified_purchase && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {review.title}
              </h4>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {review.content}
              </p>

              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button
                    onClick={() => handleHelpful(review.id, true)}
                    className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful_count})
                  </button>
                  <button
                    onClick={() => handleHelpful(review.id, false)}
                    className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Not Helpful ({review.not_helpful_count})
                  </button>
                </div>

                {userId === review.user_id && (
                  <ActionButtons
                    id={review.id}
                    type="review"
                    onEdit={() => startEdit(review)}
                    onDelete={() => handleDeleteReview(review.id)}
                    showView={false}
                  />
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Review Modal */}
      <AnimatePresence>
        {(showAddReview || editingReview) && (
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
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {editingReview ? "Edit Review" : "Write a Review"}
                </h3>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating
                    </label>
                    {renderRatingInput()}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Review Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Summarize your experience"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Review
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Tell us about your experience with this product"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {editingReview ? "Update Review" : "Submit Review"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddReview(false);
                        setEditingReview(null);
                        setFormData({ rating: 5, title: "", content: "" });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

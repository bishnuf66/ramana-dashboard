export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  reviewImages: string[];
  isVerified: boolean;
  helpfulCount: number;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
  reviewImages: File[];
}

export interface ReviewFilters {
  rating?: number;
  hasImages?: boolean;
  verified?: boolean;
  sortBy?: "newest" | "oldest" | "highest" | "lowest" | "most-helpful";
}

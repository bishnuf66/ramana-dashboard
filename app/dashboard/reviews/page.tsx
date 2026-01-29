"use client";

import ReviewManager from "@/components/reviews/ReviewManager";

export default function ReviewsDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Review Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage customer reviews and ratings
        </p>
      </div>
      <ReviewManager />
    </div>
  );
}

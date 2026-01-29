"use client";

import CategoryList from "@/components/categories/CategoryList";

export default function CategoriesDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Category Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage product categories
        </p>
      </div>
      <CategoryList />
    </div>
  );
}

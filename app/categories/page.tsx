"use client";

import CategoryList from "@/components/categories/CategoryList";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CategoryList />
      </div>
    </div>
  );
}

"use client";

import CreateCategoryForm from "@/components/categories/CreateCategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CreateCategoryForm />
      </div>
    </div>
  );
}

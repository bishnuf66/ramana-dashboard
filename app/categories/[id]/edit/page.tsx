"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import CategoryForm from "@/components/categories/CategoryForm";
import { Category } from "@/types/category";

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<Category> | null>(
    null,
  );

  // Load existing category data
  const loadCategory = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Category not found");

      setInitialData(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load category");
      setInitialData(null);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">
          Loading category...
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Category Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The category you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CategoryForm categoryId={categoryId} initialData={initialData} />
      </div>
    </div>
  );
}

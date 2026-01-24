import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { Category } from "@/types/category";
import ActionButtons from "@/components/ui/ActionButtons";
import DeleteModal from "@/components/ui/DeleteModal";
import Link from "next/link";
import Image from "next/image";

interface CategoryListProps {
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
  showCreateButton?: boolean;
}

export default function CategoryList({
  onEdit,
  onDelete,
  showCreateButton = true,
}: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("categories")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCategories((data as any) || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load categories");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteById = (id: string) => {
    const category = categories.find((cat) => cat.id === id);
    if (category) {
      handleDeleteClick(category);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleteLoading(true);
      const { error } = await (supabase as any)
        .from("categories")
        .delete()
        .eq("id", categoryToDelete.id);

      if (error) throw error;

      toast.success("Category deleted successfully!");
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryToDelete.id),
      );
      setShowDeleteModal(false);
      setCategoryToDelete(null);

      if (onDelete) {
        onDelete(categoryToDelete.id);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Categories
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"}
          </p>
        </div>

        {showCreateButton && (
          <Link
            href="/categories/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m0 0H8m0 0v16h8m-4 4l4 4m0 0l4-4m0 0v16"
              />
            </svg>
            Create New Category
          </Link>
        )}
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m-7 7a7 7 0 014 0h14a7 7 0 014 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 0h2m0 0v2h2m-4 4l4 4m0 0v2h2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Categories Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start creating your first category to organize your products.
              </p>
              <Link
                href="/categories/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Category
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              {/* Category Image */}
              {category.picture ? (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={category.picture}
                    alt={category.name}
                    width={300}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <svg
                        className="w-16 h-16 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <p className="text-sm font-medium">No Image</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Name */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>

                {/* Slug */}
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    /{category.slug}
                  </span>
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created: {new Date(category.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <ActionButtons
                  id={category.id}
                  type="category"
                  style="icons"
                  onDelete={handleDeleteById}
                  showView={false}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete"
        itemName={categoryToDelete?.name || ""}
        itemsToDelete={[
          "Category from catalog",
          "All products in this category",
          "Related discounts and associations",
        ]}
        isLoading={deleteLoading}
      />
    </div>
  );
}

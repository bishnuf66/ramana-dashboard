import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { Category } from "@/types/category";
import ActionButtons from "@/components/ui/ActionButtons";
import CategoryViewModal from "./CategoryViewModal";
import Pagination from "@/components/ui/Pagination";
import DeleteModal from "@/components/ui/DeleteModal";

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
  const [showViewModal, setShowViewModal] = useState(false);
  const [categoryToView, setCategoryToView] = useState<Category | null>(null);
  const [productCounts, setProductCounts] = useState<Record<string, number>>(
    {},
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9); // Grid layout, so 9 items (3x3)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("categories")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        const categoriesData = (data as any) || [];
        setCategories(categoriesData);

        // Load product counts for each category
        const counts: Record<string, number> = {};
        for (const category of categoriesData) {
          const { data: products, error: productsError } = await supabase
            .from("products")
            .select("id")
            .eq("category", category.name);

          if (!productsError) {
            counts[category.id] = products?.length || 0;
          } else {
            counts[category.id] = 0;
          }
        }
        setProductCounts(counts);
      } catch (error: any) {
        toast.error(error.message || "Failed to load categories");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Pagination logic
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return categories.slice(startIndex, endIndex);
  }, [categories, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleViewCategory = (category: Category) => {
    setCategoryToView(category);
    setShowViewModal(true);
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
          {paginatedCategories.map((category) => (
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewCategory(category)}
                      className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      title="View category"
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
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <Link
                      href={`/categories/${category.id}/edit`}
                      className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                      title="Edit category"
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
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Delete category"
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
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {categories.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={categories.length}
          />
        </div>
      )}
      {/* Category View Modal */}
      <CategoryViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        category={categoryToView}
        onDelete={(categoryId) => {
          // Handle deletion from view modal
          const category = categories.find((c) => c.id === categoryId);
          if (category) {
            handleDeleteClick(category);
          }
        }}
        productCount={
          categoryToView ? productCounts[categoryToView.id] || 0 : 0
        }
      />

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

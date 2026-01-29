"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Edit,
  Trash2,
  Package,
  Calendar,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DeleteModal from "@/components/ui/DeleteModal";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { Database } from "@/types/database.types";
type Category = Database["public"]["Tables"]["categories"]["Row"];

interface CategoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
  showActions?: boolean;
  productCount?: number;
}

export default function CategoryViewModal({
  isOpen,
  onClose,
  category,
  onEdit,
  onDelete,
  showActions = true,
  productCount = 0,
}: CategoryViewModalProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!category || !isOpen) return null;

  const handleDelete = async () => {
    if (!category) return;

    try {
      setDeleteLoading(true);

      // Step 1: Delete category image from storage if it exists
      if (category.picture && category.picture.includes("supabase")) {
        const filePath = category.picture.split("/").pop();
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("categories")
            .remove([filePath]);
          if (storageError) {
            console.warn("Failed to delete category image:", storageError);
          }
        }
      }

      // Step 2: Update products in this category to null category
      const { error: updateError } = await (supabase as any)
        .from("products")
        .update({ category: null })
        .eq("category", category.name);

      if (updateError) {
        console.warn("Failed to update products in category:", updateError);
      }

      // Step 3: Delete the category
      const { error: deleteError } = await (supabase as any)
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (deleteError) {
        throw deleteError;
      }

      // Step 4: Close modals and notify parent
      setShowDeleteModal(false);
      onClose();

      if (onDelete) {
        onDelete(category.id);
      }

      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to delete category: " + errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {category.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Left Column - Image */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Category Image
                  </h3>
                  <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {category.picture ? (
                      <Image
                        src={category.picture}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Category Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Name:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {category.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Slug:
                      </span>
                      <span className="text-gray-900 dark:text-white font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {category.slug}
                      </span>
                    </div>

                    {category.description && (
                      <div className="col-span-2">
                        <div className="flex items-start justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Description:
                          </span>
                          <span className="text-gray-900 dark:text-white text-sm text-right max-w-xs">
                            {category.description}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Products:
                      </span>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {productCount} products
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Created:
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">
                          {formatDate(category.created_at)}
                        </span>
                      </div>
                    </div>

                    {category.updated_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Updated:
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(category.updated_at)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {showActions && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/categories/${category.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete"
        itemName={category.name}
        itemsToDelete={[
          "Category from catalog",
          "Category image from storage",
          "All products in this category will be uncategorized",
          "Related discounts and associations",
        ]}
        isLoading={deleteLoading}
      />
    </>
  );
}

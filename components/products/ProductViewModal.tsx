"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Edit,
  Trash2,
  Star,
  Package,
  Calendar,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DeleteModal from "@/components/ui/DeleteModal";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";

type DbProduct = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  cover_image: string;
  gallery_images: (string | { url: string; title?: string })[] | null;
  rating: number;
  category: string | null;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: DbProduct | null;
  onEdit?: (product: DbProduct) => void;
  onDelete?: (productId: string) => void;
  showActions?: boolean;
}

export default function ProductViewModal({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete,
  showActions = true,
}: ProductViewModalProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!product || !isOpen) return null;

  const handleDelete = async () => {
    if (!product) return;

    try {
      setDeleteLoading(true);

      // Step 1: Delete product images from storage
      const imagesToDelete = [];

      // Add cover image
      if (product.cover_image) {
        imagesToDelete.push(product.cover_image);
      }

      // Add gallery images
      if (product.gallery_images) {
        product.gallery_images.forEach((img) => {
          if (typeof img === "string") {
            imagesToDelete.push(img);
          } else if (img.url) {
            imagesToDelete.push(img.url);
          }
        });
      }

      // Delete images from storage
      for (const imageUrl of imagesToDelete) {
        if (imageUrl && imageUrl.includes("supabase")) {
          const filePath = imageUrl.split("/").pop();
          if (filePath) {
            const { error: storageError } = await supabase.storage
              .from("products")
              .remove([filePath]);
            if (storageError) {
              console.warn("Failed to delete image:", storageError);
            }
          }
        }
      }

      // Step 2: Delete related records (cascade)
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) {
        throw deleteError;
      }

      // Step 3: Close modals and notify parent
      setShowDeleteModal(false);
      onClose();

      if (onDelete) {
        onDelete(product.id);
      }

      toast.success("Product and all related data deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to delete product: " + errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock > 10)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (stock > 0)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {product.title}
            </h2>
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
              {/* Left Column - Images */}
              <div className="space-y-4">
                {/* Cover Image */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Product Image
                  </h3>
                  <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <Image
                      src={product.cover_image}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Gallery Images */}
                {product.gallery_images &&
                  product.gallery_images.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Gallery Images
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {product.gallery_images.map((image, index) => (
                          <div
                            key={index}
                            className="relative w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                          >
                            <Image
                              src={
                                typeof image === "string" ? image : image.url
                              }
                              alt={`${product.title} - Gallery ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Product Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Price:
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatPrice(product.discount_price || product.price)}
                        </div>
                        {product.discount_price && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Stock:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStockStatus(product.stock)}`}
                      >
                        {product.stock} units
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Rating:
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {product.rating.toFixed(1)} / 5
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Category:
                      </span>
                      <span className="text-gray-900 dark:text-white capitalize">
                        {product.category || "Uncategorized"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Status:
                      </span>
                      <div className="flex items-center gap-2">
                        {product.is_featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Created:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(product.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Description
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {product.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {showActions && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/products/${product.id}/edit`}
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
        title="Delete Product"
        description="Are you sure you want to delete"
        itemName={product.title}
        itemsToDelete={[
          "Product from catalog",
          "Cover image and gallery images",
          "All customer reviews",
          "Related order items",
          "Discount associations",
        ]}
        isLoading={deleteLoading}
      />
    </>
  );
}

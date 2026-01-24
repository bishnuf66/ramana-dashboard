"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import DeleteModal from "@/components/ui/DeleteModal";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

interface DiscountViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: Coupon | null;
  onEdit?: (discount: Coupon) => void;
  onDelete?: (discountId: string) => void;
  showActions?: boolean;
  usageData?: {
    totalUsage: number;
    uniqueUsers: number;
    totalSavings: number;
  };
}

export default function DiscountViewModal({
  isOpen,
  onClose,
  discount,
  onEdit,
  onDelete,
  showActions = true,
  usageData,
}: DiscountViewModalProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!discount || !isOpen) return null;

  const handleDelete = async () => {
    if (!discount) return;

    try {
      setDeleteLoading(true);

      // Step 1: Delete coupon usage records
      const { error: usageError } = await (supabase as any)
        .from("coupon_usage")
        .delete()
        .eq("coupon_id", discount.id);

      if (usageError) {
        console.warn("Failed to delete coupon usage records:", usageError);
      }

      // Step 2: Delete coupon product associations
      const { error: productError } = await (supabase as any)
        .from("coupon_products")
        .delete()
        .eq("coupon_id", discount.id);

      if (productError) {
        console.warn(
          "Failed to delete coupon product associations:",
          productError,
        );
      }

      // Step 3: Delete the coupon
      const { error: deleteError } = await (supabase as any)
        .from("coupons")
        .delete()
        .eq("id", discount.id);

      if (deleteError) {
        throw deleteError;
      }

      // Step 4: Close modals and notify parent
      setShowDeleteModal(false);
      onClose();

      if (onDelete) {
        onDelete(discount.id);
      }

      toast.success("Discount deleted successfully");
    } catch (error) {
      console.error("Error deleting discount:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to delete discount: " + errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const isExpired = discount.expires_at
    ? new Date(discount.expires_at) < new Date()
    : false;
  const isUsageLimitReached = discount.usage_limit
    ? (discount.usage_count || 0) >= discount.usage_limit
    : false;
  const status = !discount.is_active
    ? "Inactive"
    : isExpired
      ? "Expired"
      : isUsageLimitReached
        ? "Usage Limit Reached"
        : "Active";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "Usage Limit Reached":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="w-4 h-4" />;
      case "Expired":
        return <XCircle className="w-4 h-4" />;
      case "Inactive":
        return <XCircle className="w-4 h-4" />;
      case "Usage Limit Reached":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {discount.code}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(status)}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                  >
                    {status}
                  </span>
                </div>
              </div>
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
              {/* Left Column - Discount Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Discount Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Discount Type:
                      </span>
                      <div className="flex items-center gap-1">
                        {discount.discount_type === "percentage" ? (
                          <Percent className="w-4 h-4 text-purple-500" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-gray-900 dark:text-white font-medium capitalize">
                          {discount.discount_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Discount Value:
                      </span>
                      <span className="text-gray-900 dark:text-white font-bold text-lg">
                        {discount.discount_type === "percentage"
                          ? `${discount.discount_value}%`
                          : formatCurrency(discount.discount_value)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Minimum Order:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {discount.minimum_order_amount &&
                        discount.minimum_order_amount > 0
                          ? formatCurrency(discount.minimum_order_amount)
                          : "No minimum"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Usage Limit:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {discount.usage_limit
                            ? `${discount.usage_count || 0}/${discount.usage_limit}`
                            : "Unlimited"}
                        </span>
                        {discount.usage_limit && (
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{
                                width: `${((discount.usage_count || 0) / discount.usage_limit) * 100}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        First Time Only:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          discount.first_time_only
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {discount.first_time_only ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Product Specific:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          discount.is_product_specific
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {discount.is_product_specific ? "Yes" : "All Products"}
                      </span>
                    </div>

                    {discount.expires_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Expires:
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(discount.expires_at || "")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {discount.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Description
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {discount.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Usage & Dates */}
              <div className="space-y-6">
                {/* Usage Statistics */}
                {usageData && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Usage Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Total Usage:
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {usageData.totalUsage} times
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Unique Users:
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {usageData.uniqueUsers} users
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Total Savings:
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {formatCurrency(usageData.totalSavings)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Created:
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">
                          {formatDate(discount.created_at || "")}
                        </span>
                      </div>
                    </div>
                    {discount.updated_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Updated:
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(discount.updated_at || "")}
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
                      href={`/discounts/${discount.id}/edit`}
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
        title="Delete Discount"
        description="Are you sure you want to delete"
        itemName={discount.code}
        itemsToDelete={[
          "Discount coupon",
          "All usage records",
          "Product associations",
          "Customer discount history",
        ]}
        isLoading={deleteLoading}
      />
    </>
  );
}

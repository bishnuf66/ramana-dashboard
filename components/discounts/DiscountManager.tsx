"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Tag,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Users,
  TrendingUp,
  Package,
  Filter,
  CheckSquare,
  XSquare,
} from "lucide-react";
import {
  DiscountService,
  type Coupon,
  type CouponProduct,
} from "@/lib/discounts/DiscountService";
import ActionButtons from "@/components/ui/ActionButtons";
import DiscountViewModal from "./DiscountViewModal";
import Pagination from "@/components/ui/Pagination";
import { useDiscounts, useDeleteDiscount } from "@/hooks/useDiscounts";
import SearchFilterSort from "@/components/ui/SearchFilterSort";
import type { Database } from "@/types/database.types";
import Image from "next/image";
import { useDiscountsCount } from "@/hooks/useDiscounts";
import Link from "next/link";

type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];
type CouponInsert = Database["public"]["Tables"]["coupons"]["Insert"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface CouponFormData {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  discount_value: number;
  minimum_order_amount: number;
  usage_limit: number | null;
  first_time_only: boolean;
  is_active: boolean;
  expires_at: string;
  is_product_specific: boolean;
  product_inclusion_type: "include" | "exclude";
}

export default function DiscountManager() {
  const [showViewModal, setShowViewModal] = useState(false);
  const [couponToView, setCouponToView] = useState<CouponRow | null>(null);

  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedType, setSelectedType] = useState<
    "all" | "percentage" | "fixed_amount" | "free_shipping"
  >("all");
  const [sortBy, setSortBy] = useState<
    "created_at" | "expires_at" | "discount_value"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // TanStack Query for fetching discounts
  const { data: coupons = [], isLoading } = useDiscounts({
    search: searchTerm,
    status: selectedStatus,
    type: selectedType,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  });

  const deleteDiscountMutation = useDeleteDiscount();

  const { data: total = 0 } = useDiscountsCount({
    search: searchTerm,
    status: selectedStatus,
    type: selectedType,
  });

  const totalPages = Math.ceil(total / itemsPerPage);

  const handleClearAll = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedType("all");
    setSortBy("created_at");
    setSortOrder("desc");
    setItemsPerPage(10);
    setCurrentPage(1);
  };

  const handleView = (coupon: CouponRow) => {
    setCouponToView(coupon);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await deleteDiscountMutation.mutateAsync(id);
      setCurrentPage(1);
    } catch (error: any) {
      console.error("Delete error:", error);
    }
  };

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="w-4 h-4" />;
      case "fixed_amount":
        return <DollarSign className="w-4 h-4" />;
      case "free_shipping":
        return <Truck className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getUsagePercentage = (coupon: CouponRow) => {
    if (!coupon.usage_limit) return 0;
    return ((coupon.usage_count || 0) / coupon.usage_limit) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Coupon Management
        </h2>
        <Link
          href="/discounts/new?section=discounts"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </Link>
      </div>

      {/* Search, Filter, and Sort */}
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        status={selectedStatus}
        onStatusChange={(value: string) =>
          setSelectedStatus(value as "all" | "active" | "inactive")
        }
        sortBy={`${sortBy}-${sortOrder}`}
        onSortChange={(value) => {
          const [field, order] = value.split("-");
          setSortBy(field as "created_at" | "expires_at" | "discount_value");
          setSortOrder(order as "asc" | "desc");
        }}
        showStatusFilter={true}
        showClearAll={true}
        onClearAll={handleClearAll}
        statusOptions={[
          { value: "all", label: "All Status" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        sortOptions={[
          { value: "created_at-desc", label: "Newest First" },
          { value: "created_at-asc", label: "Oldest First" },
          { value: "expires_at-desc", label: "Expiring Soon" },
          { value: "expires_at-asc", label: "Expires Later" },
          { value: "discount_value-desc", label: "Highest Discount First" },
          { value: "discount_value-asc", label: "Lowest Discount First" },
        ]}
        placeholder="Search by coupon code or description..."
        statusLabel="Coupon Status"
      />

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {coupons.length} of {total} coupons
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Coupons
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {coupons.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {coupons.filter((c: CouponRow) => c.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                First-Time
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {coupons.filter((c: CouponRow) => c.first_time_only).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expired
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {
                  coupons.filter(
                    (c: CouponRow) =>
                      c.expires_at && new Date(c.expires_at) < new Date(),
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {coupons.map((coupon: CouponRow) => (
                <tr
                  key={coupon.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getDiscountIcon(coupon.discount_type)}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {coupon.code}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {coupon.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {coupon.discount_type === "percentage" &&
                        `${coupon.discount_value}%`}
                      {coupon.discount_type === "fixed_amount" &&
                        `$${coupon.discount_value}`}
                      {coupon.discount_type === "free_shipping" &&
                        "Free Shipping"}
                    </div>
                    {coupon.minimum_order_amount &&
                      coupon.minimum_order_amount > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Min: ${coupon.minimum_order_amount}
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {coupon.first_time_only && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          First-Time Only
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {coupon.usage_count}
                      {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                    </div>
                    {coupon.usage_limit && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${getUsagePercentage(coupon)}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {coupon.is_active ? "Active" : "Inactive"}
                    </span>
                    {coupon.expires_at &&
                      new Date(coupon.expires_at) < new Date() && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          Expired
                        </span>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(coupon)}
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/discounts/${coupon.id}/edit?section=discounts`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {coupons.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={total}
              showItemsPerPageSelector={true}
            />
          </div>
        )}
      </div>

      {/* Discount View Modal */}
      <DiscountViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        coupon={couponToView}
        onDelete={(couponId) => {
          handleDelete(couponId);
        }}
      />
    </div>
  );
}

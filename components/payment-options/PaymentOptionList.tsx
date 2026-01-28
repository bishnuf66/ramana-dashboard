"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Smartphone,
  Building,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import PaymentOptionForm from "./PaymentOptionForm";
import { Database } from "@/types/database.types";
type PaymentOption = Database["public"]["Tables"]["payment_options"]["Row"];
import Pagination from "@/components/ui/Pagination";
import SearchFilterSort from "@/components/ui/SearchFilterSort";
import {
  usePaymentOptions,
  useDeletePaymentOption,
  usePaymentOptionsCount,
} from "@/hooks/usePaymentOptions";

export default function PaymentOptionList() {
  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<"created_at" | "name" | "updated_at">(
    "created_at",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingOption, setEditingOption] = useState<PaymentOption | null>(
    null,
  );

  // Mutations and queries
  const deletePaymentOptionMutation = useDeletePaymentOption();
  const {
    data: paymentOptions = [],
    isLoading,
    error,
  } = usePaymentOptions({
    search: searchTerm,
    status: selectedStatus,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  });

  const { data: totalCount = 0 } = usePaymentOptionsCount({
    search: searchTerm,
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment option?"))
      return;
    deletePaymentOptionMutation.mutate(id);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status as "all" | "active" | "inactive");
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field as "created_at" | "name" | "updated_at");
    setSortOrder(order as "asc" | "desc");
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleEdit = (option: PaymentOption) => {
    setEditingOption(option);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingOption(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingOption(null);
  };

  const handleToggleStatus = (option: PaymentOption) => {
    // This would be handled by a mutation hook in a real implementation
    console.log("Toggle status for:", option.id);
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "esewa":
        return <Smartphone className="w-5 h-5" />;
      case "khalti":
        return <CreditCard className="w-5 h-5" />;
      case "bank_transfer":
        return <Building className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case "esewa":
        return "eSewa";
      case "khalti":
        return "Khalti";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string | null) => {
    return status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  if (showForm) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <PaymentOptionForm
          paymentOption={editingOption || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        {/* Search and Filters */}
        <SearchFilterSort
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          status={selectedStatus}
          onStatusChange={handleStatusChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          showStatusFilter={true}
          placeholder="Search payment options..."
          statusOptions={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          sortOptions={[
            { value: "created_at-desc", label: "Newest First" },
            { value: "created_at-asc", label: "Oldest First" },
            { value: "name-asc", label: "Name A-Z" },
            { value: "name-desc", label: "Name Z-A" },
            { value: "updated_at-desc", label: "Recently Updated" },
            { value: "updated_at-asc", label: "Least Recently Updated" },
          ]}
        />
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400">
              Failed to load payment options. Please try again.
            </div>
          </div>
        ) : paymentOptions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No payment options yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add your first payment option to get started
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Payment Option
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentOptions.map((option) => (
              <div
                key={option.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        option.payment_type === "esewa"
                          ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                          : option.payment_type === "khalti"
                            ? "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
                            : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {getPaymentIcon(option.payment_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {getPaymentLabel(option.payment_type)}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadge(option.status)}`}
                      >
                        {option.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {option.payment_type === "bank_transfer"
                        ? "Account Number"
                        : "Phone Number"}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.payment_number}
                    </p>
                  </div>

                  {option.qr_image_url && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        QR Code
                      </p>
                      <div className="relative w-full h-32 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <Image
                          src={option.qr_image_url}
                          alt={`${getPaymentLabel(option.payment_type)} QR Code`}
                          fill
                          className="object-contain bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEdit(option)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggleStatus(option)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-sm text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20 rounded transition-colors"
                  >
                    {option.status === "active" ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        Show
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(option.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          showItemsPerPageSelector={false}
        />
      )}
    </div>
  );
}

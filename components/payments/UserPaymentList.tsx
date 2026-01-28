"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import PaymentViewModal from "./PaymentViewModal";
import PaymentActionButtons from "./PaymentActionButtons";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Pagination from "@/components/ui/Pagination";
import SearchFilterSort from "@/components/ui/SearchFilterSort";
import type { Database } from "@/types/database.types";
import {
  useUserPayments,
  useVerifyPayment,
  useUserPaymentsCount,
} from "@/hooks/useUserPayments";

type UserPayment = Database["public"]["Tables"]["user_payments"]["Row"];
type PaymentOption = Database["public"]["Tables"]["payment_options"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];

interface UserPaymentWithDetails extends UserPayment {
  payment_option?: PaymentOption | null;
  order?: {
    id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    order_status: string;
  } | null;
}

// Create a more compatible interface for the component
interface UserPaymentDisplay {
  id: string;
  order_id: string;
  payment_option_id: string;
  amount: number;
  is_verified: boolean;
  transaction_id?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  payment_option?: PaymentOption | null;
  order?: {
    id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    order_status: string;
  } | null;
}

interface UserPaymentListProps {
  orderId?: string;
  limit?: number;
  showFilters?: boolean;
  onPaymentSelect?: (payment: UserPaymentDisplay) => void;
  onPaymentEdit?: (payment: UserPaymentDisplay) => void;
  onPaymentDelete?: (payment: UserPaymentDisplay) => void;
}

export default function UserPaymentList({
  orderId,
  limit,
  showFilters = true,
  onPaymentSelect,
  onPaymentEdit,
  onPaymentDelete,
}: UserPaymentListProps) {
  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "verified" | "pending" | "rejected"
  >("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "amount" | "updated_at">(
    "created_at",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [paymentToVerify, setPaymentToVerify] = useState<any>(null);
  const [verifyAction, setVerifyAction] = useState<"verify" | "unverify">(
    "verify",
  );

  // Mutations and queries
  const verifyPaymentMutation = useVerifyPayment();
  const {
    data: userPayments = [],
    isLoading,
    error,
  } = useUserPayments({
    search: searchTerm,
    status: selectedStatus,
    paymentMethod: selectedPaymentMethod,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  });

  const { data: totalCount = 0 } = useUserPaymentsCount({
    search: searchTerm,
    status: selectedStatus,
    paymentMethod: selectedPaymentMethod,
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleDeletePayment = (payment: UserPaymentDisplay) => {
    // Call the parent delete handler
    // onPaymentDelete?.(payment);
  };

  const handleVerifyPayment = () => {
    if (!paymentToVerify) return;

    verifyPaymentMutation.mutate({
      id: paymentToVerify.id,
      verified: verifyAction === "verify",
    });

    setShowVerifyModal(false);
    setPaymentToVerify(null);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status as "all" | "verified" | "pending" | "rejected");
    setCurrentPage(1);
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field as "created_at" | "amount" | "updated_at");
    setSortOrder(order as "asc" | "desc");
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleExport = () => {
    const csvContent = [
      [
        "Payment ID",
        "Order ID",
        "Customer",
        "Amount",
        "Payment Method",
        "Status",
        "Date",
      ],
      ...userPayments.map((payment) => [
        payment.id.slice(0, 8),
        payment.order_id.slice(0, 8),
        payment.order?.customer_name || "N/A",
        payment.amount.toString(),
        payment.payment_option?.payment_type || "N/A",
        payment.is_verified ? "Verified" : "Pending",
        new Date(payment.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">
          Failed to load payments. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Payments
          </h3>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search and Filters */}
          <SearchFilterSort
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            status={selectedStatus}
            onStatusChange={handleStatusChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            showStatusFilter={true}
            placeholder="Search payments..."
            statusOptions={[
              { value: "all", label: "All Status" },
              { value: "verified", label: "Verified" },
              { value: "pending", label: "Pending" },
              { value: "rejected", label: "Rejected" },
            ]}
            sortOptions={[
              { value: "created_at-desc", label: "Newest First" },
              { value: "created_at-asc", label: "Oldest First" },
              { value: "amount-desc", label: "Highest Amount" },
              { value: "amount-asc", label: "Lowest Amount" },
              { value: "updated_at-desc", label: "Recently Updated" },
              { value: "updated_at-asc", label: "Least Recently Updated" },
            ]}
          />

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Method:
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payment ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {userPayments.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  #{payment.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  #{payment.order_id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.order?.customer_name || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {payment.order?.customer_email || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {payment.amount ? payment.amount.toString() : "0"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {payment.payment_option?.payment_type || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {payment.is_verified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                    {payment.is_verified ? (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(payment.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <PaymentActionButtons
                    payment={payment}
                    onView={() => {
                      setSelectedPayment(payment);
                      setShowViewModal(true);
                    }}
                    onEdit={() => {
                      // Navigate to edit page or open edit modal
                      console.log("Edit payment:", payment.id);
                    }}
                    onDelete={() => {
                      // Handle delete action
                      console.log("Delete payment:", payment.id);
                    }}
                    onVerify={(payment: any) => {
                      setPaymentToVerify(payment);
                      setVerifyAction("verify");
                      setShowVerifyModal(true);
                    }}
                    onUnverify={(payment: any) => {
                      setPaymentToVerify(payment);
                      setVerifyAction("unverify");
                      setShowVerifyModal(true);
                    }}
                    size="sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {userPayments.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No user payments found.
        </div>
      )}

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

      {/* Payment View Modal */}
      <PaymentViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        payment={selectedPayment as any}
        onEdit={() => {}}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete Payment"
        message={`Are you sure you want to delete payment ? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        loading={verifyPaymentMutation.isPending}
      />
    </div>
  );
}

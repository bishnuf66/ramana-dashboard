"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
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

interface UserPayment {
  id: string;
  order_id: string;
  payment_option_id: string;
  amount: number;
  is_verified: boolean;
  transaction_id?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  payment_option?: {
    id: string;
    payment_type: string;
  };
  order?: {
    id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    order_status: string;
  };
}

interface UserPaymentListProps {
  orderId?: string;
  limit?: number;
  showFilters?: boolean;
  onPaymentSelect?: (payment: UserPayment) => void;
  onPaymentEdit?: (payment: UserPayment) => void;
  onPaymentDelete?: (payment: UserPayment) => void;
}

export default function UserPaymentList({
  orderId,
  limit = 50,
  showFilters = true,
  onPaymentSelect,
  onPaymentEdit,
  onPaymentDelete,
}: UserPaymentListProps) {
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "verified" | "pending"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<UserPayment | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<UserPayment | null>(
    null,
  );

  const currency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "Rs.0.00";
    }
    try {
      return new Intl.NumberFormat("en-NP", {
        style: "currency",
        currency: "NPR",
      }).format(value);
    } catch {
      return `Rs.${value.toFixed(2)}`;
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let query = (supabase as any).from("user_payments").select(
        `
          *,
          payment_option:payment_options(*),
          order:orders(id, customer_name, customer_email, total_amount, order_status)
        `,
        { count: "exact" },
      );

      // Apply filters
      if (orderId) {
        query = query.eq("order_id", orderId);
      }

      if (statusFilter !== "all") {
        query = query.eq("is_verified", statusFilter === "verified");
      }

      if (searchTerm) {
        query = query.or(`
          transaction_id.ilike.%${searchTerm}%,
          payment_method.ilike.%${searchTerm}%,
          order.customer_name.ilike.%${searchTerm}%,
          order.customer_email.ilike.%${searchTerm}%
        `);
      }

      // Apply pagination
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to).order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      setPayments(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (error) {
      console.error("Failed to fetch user payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [orderId, statusFilter, searchTerm, currentPage]);

  const getStatusIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <Clock className="w-4 h-4 text-yellow-600" />
    );
  };

  const getStatusBadge = (isVerified: boolean) => {
    return isVerified ? (
      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
        Verified
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">
        Pending
      </span>
    );
  };

  const handleViewPayment = (payment: UserPayment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
    onPaymentSelect?.(payment);
  };

  const handleEditPayment = (payment: UserPayment) => {
    onPaymentEdit?.(payment);
  };

  const handleDeletePayment = (payment: UserPayment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;

    setDeleteLoading(true);
    try {
      // Call the parent delete handler
      onPaymentDelete?.(paymentToDelete);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Refresh the list
      fetchPayments();

      setShowDeleteModal(false);
      setPaymentToDelete(null);
    } catch (error) {
      console.error("Failed to delete payment:", error);
    } finally {
      setDeleteLoading(false);
    }
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
      ...payments.map((payment) => [
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Payments {orderId && `for Order #${orderId.slice(0, 8)}`}
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
      {showFilters && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by transaction ID, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      )}

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
            {payments.map((payment) => (
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
                  {currency(payment.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {payment.payment_option?.payment_type || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(payment.is_verified)}
                    {getStatusBadge(payment.is_verified)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(payment.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <PaymentActionButtons
                    payment={payment}
                    onView={handleViewPayment}
                    onEdit={handleEditPayment}
                    onDelete={handleDeletePayment}
                    size="sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {payments.length === 0 && (
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
          itemsPerPage={limit}
          onPageChange={setCurrentPage}
          showItemsPerPageSelector={false}
        />
      )}

      {/* Payment View Modal */}
      <PaymentViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        payment={selectedPayment}
        onEdit={handleEditPayment}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPaymentToDelete(null);
        }}
        onConfirm={confirmDeletePayment}
        title="Delete Payment"
        message={`Are you sure you want to delete payment ${paymentToDelete?.id.slice(0, 8)}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        loading={deleteLoading}
      />
    </div>
  );
}

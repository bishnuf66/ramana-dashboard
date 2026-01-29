"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  useDeletePayment,
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
  paid_amount: number; // Use paid_amount instead of amount
  amount: number; // Add amount property for compatibility
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
  const router = useRouter();
  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "verified" | "pending"
  >("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [sortBy, setSortBy] = useState<
    "created_at" | "paid_amount" | "updated_at"
  >("created_at");
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);

  // State for storing fetched orders
  const [ordersMap, setOrdersMap] = useState<Map<string, Order>>(new Map());

  // Mutations and queries
  const verifyPaymentMutation = useVerifyPayment();
  const deletePaymentMutation = useDeletePayment();
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

  // Fetch orders when userPayments data changes
  useEffect(() => {
    const fetchOrders = async () => {
      if (userPayments.length === 0) return;

      const uniqueOrderIds = [
        ...new Set(
          userPayments.map((p: UserPayment) => p.order_id).filter(Boolean),
        ),
      ];

      if (uniqueOrderIds.length > 0) {
        try {
          const ordersResponse = await fetch(
            `/api/orders?ids=${uniqueOrderIds.join(",")}`,
          );
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            const newOrdersMap = new Map<string, Order>();
            ordersData.orders?.forEach((order: Order) => {
              newOrdersMap.set(order.id, order);
            });
            setOrdersMap(newOrdersMap);
          }
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        }
      }
    };

    fetchOrders();
  }, [userPayments]);

  const handleDeletePayment = (payment: UserPaymentDisplay) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
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

  const handleDeleteConfirm = () => {
    if (!paymentToDelete) return;

    deletePaymentMutation.mutate(paymentToDelete.id);

    setShowDeleteModal(false);
    setPaymentToDelete(null);
  };

  const handleEditPayment = (payment: UserPaymentDisplay) => {
    router.push(`/payments/${payment.id}/edit?section=payments`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status as "all" | "verified" | "pending");
    setCurrentPage(1);
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field as "created_at" | "paid_amount" | "updated_at");
    setSortOrder(order as "asc" | "desc");
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    if (userPayments.length === 0) {
      // toast.error("No data to export");
      return;
    }

    // Fetch related data for all payments (only orders needed now)
    const ordersMap = new Map<string, Order>();

    // Fetch all unique orders
    const uniqueOrderIds = [
      ...new Set(
        userPayments.map((p: UserPayment) => p.order_id).filter(Boolean),
      ),
    ];
    if (uniqueOrderIds.length > 0) {
      try {
        const ordersResponse = await fetch(
          `/api/orders?ids=${uniqueOrderIds.join(",")}`,
        );
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          ordersData.orders?.forEach((order: Order) => {
            ordersMap.set(order.id, order);
          });
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    }

    const csvContent = [
      [
        "Payment ID",
        "Order ID",
        "Customer",
        "Amount",
        "Payment Type",
        "Status",
        "Date",
      ],
      ...userPayments.map((payment: UserPayment) => {
        const order = ordersMap.get(payment.order_id);

        return [
          payment.id.slice(0, 8),
          payment.order_id.slice(0, 8),
          order?.customer_name || "N/A",
          `NRS ${payment.paid_amount ? payment.paid_amount.toString() : "0"}`,
          payment.payment_type || "N/A", // Use payment_type directly from user_payments
          payment.is_verified ? "Verified" : "Pending",
          new Date(payment.created_at).toLocaleDateString(),
        ];
      }),
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
            showStatusFilter={true}
            statusLabel="Payment Verification Status"
            placeholder="Search payments..."
            statusOptions={[
              { value: "all", label: "All Verification Status" },
              { value: "verified", label: "Verified" },
              { value: "pending", label: "Pending" },
            ]}
            sortOptions={[
              { value: "created_at", label: "Created Date" },
              { value: "paid_amount", label: "Paid Amount" },
              { value: "updated_at", label: "Updated Date" },
            ]}
          />
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
                Payment Verification Status
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
            {userPayments.map((payment: UserPayment) => (
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
                <td className="px-6 py-4">
                  {(() => {
                    const order = ordersMap.get(payment.order_id);
                    return (
                      <>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order?.customer_name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order?.customer_email || "N/A"}
                        </div>
                        {order?.total_amount && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Order Total: NRS {order.total_amount}
                          </div>
                        )}
                        {order?.order_status && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Status: {order.order_status}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  <div className="font-medium">
                    NRS{" "}
                    {payment.paid_amount ? payment.paid_amount.toString() : "0"}
                  </div>
                  {(() => {
                    const order = ordersMap.get(payment.order_id);
                    return order?.total_amount && payment.paid_amount ? (
                      <>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          of NRS {order.total_amount}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min((payment.paid_amount / order.total_amount) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </>
                    ) : null;
                  })()}
                  {payment.paid_amount_percentage && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {payment.paid_amount_percentage}% paid
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <div className="font-medium">
                    {payment.payment_type || "N/A"}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {payment.payment_option_id || "N/A"}
                  </div>
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
                    payment={{
                      ...payment,
                      amount: payment.paid_amount, // Map paid_amount to amount for compatibility
                      updated_at: payment.updated_at || "", // Handle null case for string requirement
                    }}
                    onView={() => {
                      setSelectedPayment(payment);
                      setShowViewModal(true);
                    }}
                    onEdit={() =>
                      handleEditPayment({
                        ...payment,
                        amount: payment.paid_amount,
                        updated_at: payment.updated_at || "",
                      })
                    }
                    onDelete={() =>
                      handleDeletePayment({
                        ...payment,
                        amount: payment.paid_amount, // Map paid_amount to amount
                        updated_at: payment.updated_at || "",
                      })
                    }
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
      {userPayments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPageSelector={true}
        />
      )}

      {/* Payment View Modal */}
      <PaymentViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        payment={selectedPayment as any}
        onEdit={() => {}}
        onDelete={(payment) => {
          setPaymentToDelete(payment);
          setShowDeleteModal(true);
        }}
        onVerify={(payment) => {
          // Call the verify mutation directly
          verifyPaymentMutation.mutate({
            id: payment.id,
            verified: true,
          });
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment"
        message={`Are you sure you want to delete payment #${paymentToDelete?.id?.slice(0, 8) || ""}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        loading={deletePaymentMutation.isPending}
      />
    </div>
  );
}

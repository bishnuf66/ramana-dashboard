import type { Database } from "@/types/database.types";
type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

import ActionButtons from "@/components/ui/ActionButtons";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Pagination from "@/components/ui/Pagination";
import SearchFilterSort from "@/components/ui/SearchFilterSort";
import {
  useOrders,
  useOrdersCount,
  useUpdateOrderStatus,
} from "@/hooks/useOrders";

function OrderTable({
  handleUpdateOrderStatus,
  onViewOrder,
  handleVerifyPayment,
}: {
  handleUpdateOrderStatus?: (id: string, status: OrderStatus) => void;
  onViewOrder?: (order: Order) => void;
  handleVerifyPayment?: (orderId: string) => void;
}) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: string;
    status: OrderStatus;
  } | null>(null);

  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">(
    "all",
  );
  const [sortBy, setSortBy] = useState<
    "created_at" | "updated_at" | "total_amount"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // TanStack Query hooks
  const {
    data: orders = [],
    isLoading,
    error,
  } = useOrders({
    search: searchTerm,
    status: selectedStatus,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  });

  const { data: total = 0 } = useOrdersCount({
    search: searchTerm,
    status: selectedStatus,
  });

  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Check if any filters are applied
  const hasFilters: boolean =
    !!searchTerm ||
    selectedStatus !== "all" ||
    sortBy !== "created_at" ||
    sortOrder !== "desc" ||
    itemsPerPage !== 10 ||
    currentPage !== 1;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setSelectedStatus(value as OrderStatus | "all");
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split("-");
    setSortBy(sort as any);
    setSortOrder(order as "asc" | "desc");
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortBy("created_at");
    setSortOrder("desc");
    setItemsPerPage(10);
    setCurrentPage(1);
  };

  const handleStatusChange = (id: string, status: OrderStatus) => {
    setPendingStatusChange({ id, status });
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      updateOrderStatusMutation.mutate({
        orderId: pendingStatusChange.id,
        status: pendingStatusChange.status,
      });
      setTimeout(() => {
        setShowStatusModal(false);
        setPendingStatusChange(null);
      }, 500);
    }
  };

  const currency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "NRS 0.00";
    }
    try {
      return new Intl.NumberFormat("en-NP", {
        style: "currency",
        currency: "NPR",
      })
        .format(value)
        .replace("NPR", "NRS");
    } catch {
      return `NRS ${value.toFixed(2)}`;
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          {error instanceof Error ? error.message : "Failed to fetch orders"}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
        Order Management
      </h2>

      {/* Search, Filter, and Sort */}
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        status={selectedStatus}
        onStatusChange={handleStatusFilterChange}
        sortBy={`${sortBy}-${sortOrder}`}
        onSortChange={handleSortChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        showStatusFilter={true}
        showClearAll={hasFilters}
        onClearAll={handleClearAll}
        statusOptions={[
          { value: "all", label: "All Status" },
          { value: "pending", label: "Pending" },
          { value: "processing", label: "Processing" },
          { value: "shipped", label: "Shipped" },
          { value: "delivered", label: "Delivered" },
          { value: "cancelled", label: "Cancelled" },
          { value: "returned", label: "Returned" },
        ]}
        sortOptions={[
          { value: "created_at-desc", label: "Newest First" },
          { value: "created_at-asc", label: "Oldest First" },
          { value: "total_amount-desc", label: "Highest Total First" },
          { value: "total_amount-asc", label: "Lowest Total First" },
          { value: "updated_at-desc", label: "Recently Updated" },
          { value: "updated_at-asc", label: "Least Recently Updated" },
        ]}
        placeholder="Search by customer name, email, or order ID..."
        statusLabel="Order Status"
      />

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            Showing {orders.length} of {total} orders
          </>
        )}
      </div>

      {/* Orders Table - Responsive */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subtotal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Shipping
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cancellation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
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
              {orders.map((order: any, index: number) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.customer_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {order.customer_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {currency(order.subtotal_amount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {currency(order.discount_amount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {currency(order.delivery_charge || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {currency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.order_status}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as OrderStatus,
                        )
                      }
                      className={`text-xs font-semibold px-3 py-1 rounded-full border-0 ${
                        order.order_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.order_status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : order.order_status === "shipped"
                              ? "bg-purple-100 text-purple-800"
                              : order.order_status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.order_status === "returned"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.cancellation_request ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-medium">
                          Requested
                        </span>
                        {order.cancellation_requested_at && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(
                              order.cancellation_requested_at,
                            ).toLocaleDateString()}
                          </div>
                        )}
                        {order.cancellation_reason && (
                          <div
                            className="text-xs text-gray-600 dark:text-gray-300 max-w-xs truncate"
                            title={order.cancellation_reason}
                          >
                            Reason: {order.cancellation_reason}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        No request
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            order.payment_status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : order.payment_status === "failed"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {currency(order.total_amount)}
                        </span>
                      </div>
                      {order.payment_status === "pending" &&
                        handleVerifyPayment && (
                          <button
                            onClick={() => handleVerifyPayment(order.id)}
                            className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                          >
                            Verify Payment
                          </button>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "Unknown date"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {onViewOrder && (
                      <ActionButtons
                        id={order.id}
                        type="order"
                        onView={() => onViewOrder(order)}
                        showEdit={false}
                        showDelete={false}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Cards */}
        <div className="lg:hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order) => (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.customer_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.customer_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Subtotal: {currency(order.subtotal_amount || 0)}
                    </div>
                    {order.discount_amount && order.discount_amount > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Discount: -{currency(order.discount_amount)}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Shipping: {currency(order.delivery_charge || 0)}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      Total: {currency(order.total_amount)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "Unknown date"}
                    </div>
                  </div>
                </div>

                {/* Cancellation Info */}
                {order.cancellation_request && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-medium">
                        Cancellation Requested
                      </span>
                      {order.cancellation_requested_at && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(
                            order.cancellation_requested_at,
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {order.cancellation_reason && (
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        <strong>Reason:</strong> {order.cancellation_reason}
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Info */}
                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Payment Status:
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : order.payment_status === "failed"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {currency(order.subtotal_amount || 0)}
                    </span>
                  </div>
                  {order.discount_amount && order.discount_amount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Discount:
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        -{currency(order.discount_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Shipping:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {currency(order.delivery_charge || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {currency(order.total_amount)}
                    </span>
                  </div>
                  {order.payment_status === "pending" &&
                    handleVerifyPayment && (
                      <button
                        onClick={() => handleVerifyPayment(order.id)}
                        className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                      >
                        Verify Payment
                      </button>
                    )}
                </div>

                <div className="flex justify-between items-center">
                  <select
                    value={order.order_status}
                    onChange={(e) =>
                      handleStatusChange(
                        order.id,
                        e.target.value as OrderStatus,
                      )
                    }
                    className={`text-xs font-semibold px-3 py-1 rounded-full border-0 ${
                      order.order_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.order_status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.order_status === "shipped"
                            ? "bg-purple-100 text-purple-800"
                            : order.order_status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.order_status === "returned"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="returned">Returned</option>
                  </select>

                  {onViewOrder && (
                    <ActionButtons
                      id={order.id}
                      type="order"
                      onView={() => onViewOrder(order)}
                      showEdit={false}
                      showDelete={false}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No orders found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          showItemsPerPageSelector={false}
        />
      )}

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setPendingStatusChange(null);
        }}
        onConfirm={confirmStatusChange}
        title="Change Order Status"
        message={`Are you sure you want to change the order status to ${pendingStatusChange?.status}?`}
        confirmText="Change Status"
        cancelText="Cancel"
        type="status"
        loading={updateOrderStatusMutation.isPending}
      />
    </div>
  );
}

export default OrderTable;

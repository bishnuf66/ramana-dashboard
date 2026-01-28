import { Order, OrderStatus } from "@/app/dashboard/page";

import ActionButtons from "@/components/ui/ActionButtons";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Pagination from "@/components/ui/Pagination";

function OrderTable({
  orders,
  handleUpdateOrderStatus,
  onViewOrder,
  handleVerifyPayment,
}: {
  orders: Order[];
  handleUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  onViewOrder?: (order: Order) => void;
  handleVerifyPayment?: (orderId: string) => void;
}) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: string;
    status: OrderStatus;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Pagination logic
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handleStatusChange = (id: string, status: OrderStatus) => {
    setPendingStatusChange({ id, status });
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      setLoading(true);
      handleUpdateOrderStatus(
        pendingStatusChange.id,
        pendingStatusChange.status,
      );
      setTimeout(() => {
        setLoading(false);
        setShowStatusModal(false);
        setPendingStatusChange(null);
      }, 500);
    }
  };
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
        Order Management
      </h2>

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
              {paginatedOrders.map((order) => (
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
          totalItems={orders.length}
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
        loading={loading}
      />
    </div>
  );
}

export default OrderTable;

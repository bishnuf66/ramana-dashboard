"use client";

import { motion } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Send,
} from "lucide-react";
import Image from "next/image";
import { Order, OrderItem, OrderStatus } from "@/app/dashboard/page";
import type { Database } from "@/types/database.types";
import { EmailService } from "@/lib/emails/EmailService";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import PaymentDetail from "@/components/orders/PaymentDetail";
import PaymentList from "@/components/payments/PaymentList";
import UserPaymentList from "@/components/payments/UserPaymentList";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

type PaymentStatus = Database["public"]["Enums"]["payment_status_enum"];

interface OrderViewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (orderId: string, newStatus: OrderStatus) => void;
  onPaymentStatusUpdate?: (orderId: string, newStatus: PaymentStatus) => void;
}

export default function OrderViewModal({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
  onPaymentStatusUpdate,
}: OrderViewModalProps) {
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] =
    useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<
    Database["public"]["Tables"]["payment_options"]["Row"][]
  >([]);
  const [userPayment, setUserPayment] = useState<any>(null);
  const [userPayments, setUserPayments] = useState<any[]>([]);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Fetch payment options
  useEffect(() => {
    const fetchPaymentOptions = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("payment_options")
          .select("id, payment_type")
          .order("payment_type");

        if (error) throw error;
        setPaymentOptions(data || []);
      } catch (error) {
        console.error("Failed to fetch payment options:", error);
      }
    };

    fetchPaymentOptions();
  }, []);

  // Fetch user payment information when order changes
  useEffect(() => {
    const fetchUserPayments = async () => {
      if (!order) {
        setUserPayments([]);
        setUserPayment(null);
        return;
      }

      try {
        const { data, error } = await (supabase as any)
          .from("user_payments")
          .select(
            `
            *,
            payment_option:payment_options(*)
          `,
          )
          .eq("order_id", order.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to fetch user payments:", error);
          setUserPayments([]);
          setUserPayment(null);
          return;
        }

        setUserPayments(data || []);
        // Set the first payment as the primary one for backward compatibility
        setUserPayment(data && data.length > 0 ? data[0] : null);
      } catch (error) {
        console.error("Failed to fetch user payments:", error);
        setUserPayments([]);
        setUserPayment(null);
      }
    };

    fetchUserPayments();
  }, [order]);

  // Handle payment verification
  const handleVerifyPayment = async (paymentId: string) => {
    try {
      setIsVerifyingPayment(true);

      const { error } = await (supabase as any)
        .from("user_payments")
        .update({
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (error) throw error;

      // Update local state for both single payment and payments array
      setUserPayments((prev: any[]) =>
        prev.map((payment: any) =>
          payment.id === paymentId
            ? {
                ...payment,
                is_verified: true,
                updated_at: new Date().toISOString(),
              }
            : payment,
        ),
      );

      setUserPayment((prev: any) =>
        prev && prev.id === paymentId
          ? { ...prev, is_verified: true, updated_at: new Date().toISOString() }
          : prev,
      );

      // Check if all payments are verified to update order status
      const updatedPayments = userPayments.map((payment) =>
        payment.id === paymentId ? { ...payment, is_verified: true } : payment,
      );

      const allVerified =
        updatedPayments.length > 0 &&
        updatedPayments.every((p) => p.is_verified);

      // Update order payment status to "paid" if all payments are verified
      if (order && onPaymentStatusUpdate && allVerified) {
        onPaymentStatusUpdate(order.id, "paid");
      }
    } catch (error: any) {
      console.error("Failed to verify payment:", error);
      // You could add a toast notification here
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Send email notification for status change
  const handleStatusChangeWithEmail = async (newStatus: OrderStatus) => {
    if (!onStatusUpdate || !order) return;

    // Show confirmation modal first
    setPendingStatusChange(newStatus);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange || !onStatusUpdate || !order) return;

    setLoading(true);

    // First update the status
    onStatusUpdate(order.id, pendingStatusChange);

    // Then send email notification
    try {
      setEmailLoading(true);
      // Safely handle order.items which is Json type
      const itemsArray = Array.isArray(order.items) ? order.items : [];
      const orderItems = itemsArray.map((item: any) => ({
        name: item.product_name || "Product",
        quantity: item.quantity || 1,
        price: item.unit_price || 0,
      }));

      const result = await EmailService.sendOrderStatusUpdate(
        order.customer_email,
        order.customer_name,
        order.id,
        pendingStatusChange as any, // Type assertion to handle "returned" status
        orderItems,
        order.total_amount || 0,
        {
          trackingNumber:
            pendingStatusChange === "shipped" ? "TRACK123456" : undefined, // You can add tracking number logic here
          estimatedDelivery:
            pendingStatusChange === "shipped" ? "3-5 business days" : undefined,
          cancellationReason:
            pendingStatusChange === "cancelled"
              ? "Order cancelled by customer request"
              : undefined,
        },
      );

      if (result.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000); // Hide success message after 3 seconds
      }
    } catch (error) {
      console.error("Failed to send email notification:", error);
    } finally {
      setEmailLoading(false);
      setLoading(false);
      setShowStatusModal(false);
      setPendingStatusChange(null);
    }
  };

  if (!order || !isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "returned":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "refunded":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPaymentOptionName = (paymentMethod: string) => {
    const option = paymentOptions.find((opt) => opt.id === paymentMethod);
    return option?.payment_type || paymentMethod;
  };

  const getPaymentMethodName = () => {
    if (!userPayment) return "Not specified";

    if (userPayment.payment_option?.payment_type) {
      return userPayment.payment_option.payment_type;
    }

    // Fallback to payment_options lookup
    const option = paymentOptions.find(
      (opt) => opt.id === userPayment.payment_option_id,
    );
    return option?.payment_type || "Unknown";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      case "returned":
        return <AlertCircle className="w-4 h-4" />;
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      case "refunded":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Order Details
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              #{order.id.slice(0, 8)} • Placed on{" "}
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString()
                : "Unknown date"}{" "}
              at{" "}
              {order.created_at
                ? new Date(order.created_at).toLocaleTimeString()
                : "Unknown time"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {order.customer_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {order.customer_email}
                    </span>
                  </div>
                  {order.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {order.customer_phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-900 dark:text-white break-words">
                      {order.shipping_address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Status
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    {onStatusUpdate ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={order.order_status}
                          onChange={(e) =>
                            handleStatusChangeWithEmail(
                              e.target.value as OrderStatus,
                            )
                          }
                          className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${getStatusColor(
                            order.order_status,
                          )}`}
                          disabled={emailLoading || loading}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="returned">Returned</option>
                        </select>
                        {emailLoading && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                        {emailSent && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Send className="w-3 h-3" />
                            <span className="text-xs">Email sent</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.order_status,
                        )}`}
                      >
                        {getStatusIcon(order.order_status)}
                        {order.order_status}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Payment:
                    </span>
                    {onPaymentStatusUpdate ? (
                      <select
                        value={order.payment_status}
                        onChange={(e) =>
                          onPaymentStatusUpdate(
                            order.id,
                            e.target.value as PaymentStatus,
                          )
                        }
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${getPaymentStatusColor(
                          order.payment_status,
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                          order.payment_status,
                        )}`}
                      >
                        {getStatusIcon(order.payment_status)}
                        {order.payment_status}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Method:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {getPaymentMethodName()}
                    </span>
                  </div>

                  {/* User Payments Section */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      User Payment History
                    </h4>
                    <UserPaymentList
                      orderId={order.id}
                      limit={5}
                      showFilters={false}
                      onPaymentSelect={(payment) => {
                        // Handle payment selection if needed
                        console.log("Selected payment:", payment);
                      }}
                    />
                  </div>

                  {/* Payment Details Component */}
                  <PaymentList
                    userPayments={userPayments}
                    onVerifyPayment={handleVerifyPayment}
                    isVerifying={isVerifyingPayment}
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Order Date:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "Unknown date"}
                    </span>
                  </div>
                  {order.cancellation_request && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Cancellation:
                      </span>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-medium">
                          Requested
                        </span>
                        {order.cancellation_requested_at && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(
                              order.cancellation_requested_at,
                            ).toLocaleDateString()}
                          </div>
                        )}
                        {order.cancellation_reason && (
                          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-xs">
                            Reason: {order.cancellation_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {order.return_request && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Return:
                      </span>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-medium">
                          Requested
                        </span>
                        {order.return_requested_at && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(
                              order.return_requested_at,
                            ).toLocaleDateString()}
                          </div>
                        )}
                        {order.return_reason && (
                          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-xs">
                            Reason: {order.return_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {order.coupon_code && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Coupon:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {order.coupon_code}
                      </span>
                    </div>
                  )}
                  {order.notes && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Notes:
                      </span>
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs text-right">
                        {order.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cancellation Information */}
            {order.cancellation_request && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Cancellation Request
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700 dark:text-orange-300">
                      Requested:
                    </span>
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      {order.cancellation_requested_at
                        ? new Date(
                            order.cancellation_requested_at,
                          ).toLocaleDateString() +
                          " " +
                          new Date(
                            order.cancellation_requested_at,
                          ).toLocaleTimeString()
                        : "N/A"}
                    </span>
                  </div>
                  {order.cancellation_reason && (
                    <div className="pt-2 border-t border-orange-200 dark:border-orange-700">
                      <span className="text-sm text-orange-700 dark:text-orange-300 block mb-1">
                        Reason:
                      </span>
                      <p className="text-sm text-orange-900 dark:text-orange-100 bg-white dark:bg-gray-800 p-2 rounded border border-orange-100 dark:border-orange-700">
                        {order.cancellation_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items & Summary */}
            <div className="lg:col-span-2 space-y-4">
              {/* Order Items */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Items (
                  {Array.isArray(order.items) ? order.items.length : 0})
                </h4>
                <div className="space-y-3">
                  {Array.isArray(order.items) ? (
                    order.items.map((item: any, index: number) => (
                      <div
                        key={item.id || `item-${index}`}
                        className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.cover_image || "/placeholder.jpg"}
                            alt={item.product_name || "Product image"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.product_name || "Unknown Product"}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity: {item.quantity || 0} ×{" "}
                            {currency(item.unit_price || item.price || 0)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {currency(
                              item.total_price ||
                                (item.quantity || 0) *
                                  (item.unit_price || item.price || 0),
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No items found
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Order Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {currency(order.subtotal_amount || 0)}
                    </span>
                  </div>
                  {order.discount_amount && order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Discount:
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        -{currency(order.discount_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Shipping:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {currency(order.delivery_charge || 0)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Total Amount:
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        {currency(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Order Notes
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          {onStatusUpdate && (
            <button
              onClick={() => {
                if (order.order_status !== "delivered") {
                  onStatusUpdate(order.id, "delivered");
                }
              }}
              disabled={order.order_status === "delivered"}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {order.order_status === "delivered"
                ? "Delivered"
                : "Mark as Delivered"}
            </button>
          )}
        </div>

        {/* Status Change Confirmation Modal */}
        <ConfirmationModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setPendingStatusChange(null);
          }}
          onConfirm={confirmStatusChange}
          title="Change Order Status"
          message={`Are you sure you want to change the order status to ${pendingStatusChange}? This will send an email notification to the customer.`}
          confirmText="Change Status"
          cancelText="Cancel"
          type="status"
          loading={loading}
        />
      </motion.div>
    </div>
  );
}

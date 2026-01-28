import { X, Eye, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useVerifyPayment } from "@/hooks/useUserPayments";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type UserPayment = Database["public"]["Tables"]["user_payments"]["Row"];
type PaymentOption = Database["public"]["Tables"]["payment_options"]["Row"];

interface UserPaymentDisplay {
  id: string;
  order_id: string;
  payment_option_id: string;
  paid_amount: number;
  remaining_amount: number;
  payment_type: string;
  paid_amount_percentage: number;
  remaining_amount_percentage: number;
  is_verified: boolean;
  transaction_id?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  payment_option?: PaymentOption | null;
  orders?: {
    id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    order_status: string;
    created_at: string;
    updated_at: string;
    items?: Array<{
      id: string;
      slug: string;
      price: number;
      title: string;
      quantity: number;
      cover_image: string;
      discount_price?: number;
    }>;
  } | null;
}

interface PaymentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: UserPaymentDisplay | null;
  onEdit?: (payment: UserPaymentDisplay) => void;
  onDelete?: (payment: UserPaymentDisplay) => void;
  onVerify?: (payment: UserPaymentDisplay) => void;
}

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

export default function PaymentViewModal({
  isOpen,
  onClose,
  payment,
  onEdit,
  onDelete,
  onVerify,
}: PaymentViewModalProps) {
  const router = useRouter();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [verifyAction, setVerifyAction] = useState<"verify" | "unverify">(
    "verify",
  );
  const verifyPaymentMutation = useVerifyPayment();

  // Debug: Log the payment data to see what's being passed
  console.log("PaymentViewModal payment data:", payment);
  console.log("Payment is_verified:", payment?.is_verified);

  const handleVerify = () => {
    if (!payment) return;

    verifyPaymentMutation.mutate({
      id: payment.id,
      verified: verifyAction === "verify",
    });

    setShowVerifyModal(false);
  };

  const handleDelete = () => {
    if (onDelete && payment) {
      onDelete(payment);
    }
    setShowDeleteModal(false);
  };

  const handleEdit = () => {
    if (payment) {
      router.push(`/payments/${payment.id}/edit`);
    }
    onClose();
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Payment Details
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Payment ID: #{payment.id.slice(0, 8)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Payment Information */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Payment Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment ID
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    #{payment.id.slice(0, 8)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Order ID
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    #{payment.order_id.slice(0, 8)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Paid Amount
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {currency(payment.paid_amount)}
                  </p>
                </div>
                {payment.remaining_amount > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Remaining Amount
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {currency(payment.remaining_amount)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment Type
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payment.payment_type || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment Method
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payment.payment_option?.payment_type || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </p>
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
                </div>
                {payment.transaction_id && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Transaction ID
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payment.transaction_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Information */}
            {payment.orders && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Order Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customer Name
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payment.orders.customer_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customer Email
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payment.orders.customer_email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Order Total
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {currency(payment.orders.total_amount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Order Status
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payment.orders.order_status || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            {payment.orders?.items && payment.orders.items.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Order Items ({payment.orders.items.length})
                </h4>
                <div className="space-y-3">
                  {payment.orders.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.png";
                        }}
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Slug: {item.slug}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity: {item.quantity}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {currency(item.price)}
                          </span>
                          {item.discount_price && (
                            <span className="text-sm text-green-600 dark:text-green-400">
                              Discount: {currency(item.discount_price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {currency(item.price * item.quantity)}
                        </p>
                        {item.discount_price && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {currency(item.discount_price * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Timestamps
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Created At
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(payment.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Updated At
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(payment.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          {!payment.is_verified && (
            <button
              onClick={() => {
                setVerifyAction("verify");
                setShowVerifyModal(true);
              }}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Verify Payment
            </button>
          )}
          {payment.is_verified && (
            <button
              onClick={() => {
                setVerifyAction("unverify");
                setShowVerifyModal(true);
              }}
              className="px-6 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Unverify Payment
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Payment
            </button>
          )}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Payment
            </button>
          )}
        </div>

        {/* Verification Confirmation Modal */}
        <ConfirmationModal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          onConfirm={handleVerify}
          title={
            verifyAction === "verify" ? "Verify Payment" : "Unverify Payment"
          }
          message={`Are you sure you want to ${verifyAction} this payment? ${
            verifyAction === "verify"
              ? "This will mark the payment as verified and approved."
              : "This will mark the payment as pending verification."
          }`}
          confirmText={verifyAction === "verify" ? "Verify" : "Unverify"}
          cancelText="Cancel"
          type="status"
          loading={verifyPaymentMutation.isPending}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Payment"
          message={`Are you sure you want to delete this payment? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
        />
      </div>
    </div>
  );
}

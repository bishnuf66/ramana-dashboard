import { X, Eye, CheckCircle, Clock } from "lucide-react";
import type { Database } from "@/types/database.types";

type UserPayment = Database["public"]["Tables"]["user_payments"]["Row"];
type PaymentOption = Database["public"]["Tables"]["payment_options"]["Row"];

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

interface PaymentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: UserPaymentDisplay | null;
  onEdit?: (payment: UserPaymentDisplay) => void;
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
}: PaymentViewModalProps) {
  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
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
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Payment Information
              </h4>
              <div className="space-y-3">
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
                    Amount
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {currency(payment.amount)}
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
                    {getStatusIcon(payment.is_verified)}
                    {getStatusBadge(payment.is_verified)}
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
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Order Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customer Name
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payment.order?.customer_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customer Email
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payment.order?.customer_email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Order Total
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {currency(payment.order?.total_amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Order Status
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payment.order?.order_status || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
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

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onEdit(payment);
                onClose();
              }}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

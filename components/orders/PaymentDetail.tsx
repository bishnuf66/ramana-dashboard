"use client";

import { CheckCircle, Clock, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

interface PaymentDetailProps {
  userPayment:
    | (Database["public"]["Tables"]["user_payments"]["Row"] & {
        payment_option?:
          | Database["public"]["Tables"]["payment_options"]["Row"]
          | null;
      })
    | null;
  onVerifyPayment?: (paymentId: string) => void;
  isVerifying?: boolean;
}

export default function PaymentDetail({
  userPayment,
  onVerifyPayment,
  isVerifying = false,
}: PaymentDetailProps) {
  const [localIsVerifying, setLocalIsVerifying] = useState(false);

  const handleVerifyPayment = async (paymentId: string) => {
    setLocalIsVerifying(true);

    try {
      console.log("PaymentDetail: Verifying payment via API:", {
        paymentId,
        verified: true,
      });

      // Call API endpoint that uses service role key
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: paymentId, verified: true }),
      });

      const data = await response.json();

      console.log("PaymentDetail: API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify payment");
      }

      toast.success("Payment verified successfully!");

      // Call the original onVerifyPayment if provided
      if (onVerifyPayment) {
        onVerifyPayment(paymentId);
      }
    } catch (error: any) {
      console.error("PaymentDetail: Verify payment error:", error);
      toast.error(error.message || "Failed to verify payment");
    } finally {
      setLocalIsVerifying(false);
    }
  };
  if (!userPayment) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          No payment information available
        </p>
      </div>
    );
  }

  const getPaymentMethodName = () => {
    if (userPayment.payment_option?.payment_type) {
      return userPayment.payment_option.payment_type;
    }

    // Fallback to payment_type field if available
    return userPayment.payment_type || "Unknown";
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Payment Details
        </h4>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              userPayment.is_verified
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            }`}
          >
            {userPayment.is_verified ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Not Verified
              </>
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Payment Method:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
            {getPaymentMethodName()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Paid Amount:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            ${userPayment.paid_amount.toFixed(2)}
          </span>
        </div>

        {userPayment.paid_amount_percentage && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Paid Percentage:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {userPayment.paid_amount_percentage}%
            </span>
          </div>
        )}

        {userPayment.remaining_amount !== undefined &&
          userPayment.remaining_amount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Remaining Amount:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ${userPayment.remaining_amount.toFixed(2)}
              </span>
            </div>
          )}

        {userPayment.payment_screenshot && (
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Payment Proof:
            </span>
            <div className="text-right">
              <div className="relative group">
                <img
                  src={userPayment.payment_screenshot}
                  alt="Payment Screenshot"
                  className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 dark:border-gray-600"
                  onClick={() =>
                    window.open(userPayment.payment_screenshot, "_blank")
                  }
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="w-4 h-4 text-white bg-black bg-opacity-50 rounded p-1" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Click to view
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Payment Date:
          </span>
          <span className="text-sm text-gray-900 dark:text-white">
            {userPayment.created_at
              ? new Date(userPayment.created_at).toLocaleDateString()
              : "Unknown date"}
          </span>
        </div>
      </div>

      {/* Verify Payment Button */}
      {!userPayment.is_verified && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => handleVerifyPayment(userPayment.id)}
            disabled={localIsVerifying || isVerifying}
            className={`w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              localIsVerifying || isVerifying
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {localIsVerifying || isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Payment
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

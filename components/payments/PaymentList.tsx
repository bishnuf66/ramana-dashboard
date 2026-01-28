"use client";

import { CheckCircle, Clock, Image as ImageIcon, Plus } from "lucide-react";
import type { Database } from "@/types/database.types";
import PaymentDetail from "./PaymentDetail";

interface PaymentListProps {
  userPayments: (Database["public"]["Tables"]["user_payments"]["Row"] & {
    payment_option?: Database["public"]["Tables"]["payment_options"]["Row"] | null;
  })[];
  onVerifyPayment?: (paymentId: string) => void;
  isVerifying?: boolean;
}

export default function PaymentList({
  userPayments,
  onVerifyPayment,
  isVerifying = false,
}: PaymentListProps) {
  if (!userPayments || userPayments.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          No payment information available
        </p>
      </div>
    );
  }

  const totalPaid = userPayments.reduce((sum, payment) => sum + payment.paid_amount, 0);
  const totalVerified = userPayments.filter(p => p.is_verified).length;
  const allVerified = userPayments.length > 0 && userPayments.every(p => p.is_verified);

  return (
    <div className="space-y-4">
      {/* Payment Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Payment Summary
          </h4>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              allVerified 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : totalVerified > 0
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {allVerified ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All Verified
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  {totalVerified}/{userPayments.length} Verified
                </>
              )}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
            <p className="font-semibold text-gray-900 dark:text-white">
              ${totalPaid.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Payments:</span>
            <p className="font-semibold text-gray-900 dark:text-white">
              {userPayments.length}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Payment Details */}
      <div className="space-y-3">
        {userPayments.map((payment, index) => (
          <div key={payment.id} className="relative">
            {index > 0 && (
              <div className="absolute -top-3 left-4 z-10 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Payment #{index + 1}
              </div>
            )}
            <PaymentDetail
              userPayment={payment}
              onVerifyPayment={onVerifyPayment}
              isVerifying={isVerifying}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

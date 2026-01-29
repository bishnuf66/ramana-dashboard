"use client";

import { X, CreditCard, Smartphone, Building } from "lucide-react";
import Image from "next/image";
import { Database } from "@/types/database.types";

type PaymentOption = Database["public"]["Tables"]["payment_options"]["Row"];

interface PaymentOptionViewModalProps {
  paymentOption: PaymentOption | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentOptionViewModal({
  paymentOption,
  isOpen,
  onClose,
}: PaymentOptionViewModalProps) {
  if (!isOpen || !paymentOption) return null;

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "esewa":
        return <Smartphone className="w-6 h-6" />;
      case "khalti":
        return <CreditCard className="w-6 h-6" />;
      case "bank_transfer":
        return <Building className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case "esewa":
        return "eSewa";
      case "khalti":
        return "Khalti";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string | null) => {
    return status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Option Details
            </h3>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Payment Type */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`p-3 rounded-lg ${
                  paymentOption.payment_type === "esewa"
                    ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                    : paymentOption.payment_type === "khalti"
                      ? "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
                      : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                }`}
              >
                {getPaymentIcon(paymentOption.payment_type)}
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {getPaymentLabel(paymentOption.payment_type)}
                </h4>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadge(paymentOption.status)}`}
                >
                  {paymentOption.status || "Unknown"}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {paymentOption.payment_type === "bank_transfer"
                    ? "Account Number"
                    : "Phone Number"}
                </p>
                <p className="text-gray-900 dark:text-white">
                  {paymentOption.payment_number}
                </p>
              </div>

              {/* QR Code */}
              {paymentOption.qr_image_url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    QR Code
                  </p>
                  <div className="relative w-full h-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white">
                    <Image
                      src={paymentOption.qr_image_url}
                      alt={`${getPaymentLabel(paymentOption.payment_type)} QR Code`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Created/Updated Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-gray-900 dark:text-white">
                      {paymentOption.created_at
                        ? new Date(
                            paymentOption.created_at,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Last Updated
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {paymentOption.updated_at
                        ? new Date(
                            paymentOption.updated_at,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

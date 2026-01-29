"use client";

import { AlertTriangle, X } from "lucide-react";
import { Database } from "@/types/database.types";

type PaymentOption = Database["public"]["Tables"]["payment_options"]["Row"];

interface DeletePaymentOptionModalProps {
  paymentOption: PaymentOption | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentOption: PaymentOption) => void;
  isDeleting?: boolean;
}

export default function DeletePaymentOptionModal({
  paymentOption,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeletePaymentOptionModalProps) {
  if (!isOpen || !paymentOption) return null;

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

  const handleConfirm = () => {
    onConfirm(paymentOption);
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Payment Option
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Warning Message */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Are you sure you want to delete this payment option? This action cannot be undone.
                </p>
              </div>

              {/* Payment Option Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {getPaymentLabel(paymentOption.payment_type)}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {paymentOption.payment_number}
                </p>
                {paymentOption.qr_image_url && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    ⚠️ Associated QR code image will also be deleted
                  </p>
                )}
              </div>

              {/* Consequences */}
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 dark:text-white">
                  This will permanently delete:
                </h5>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Payment option configuration</li>
                  {paymentOption.qr_image_url && (
                    <li>Associated QR code image from storage</li>
                  )}
                  <li>All related data and settings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Delete Payment Option
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Edit } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: "delete" | "edit" | "status";
  loading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type,
  loading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case "delete":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          confirmBg: "bg-red-600 hover:bg-red-700",
        };
      case "edit":
        return {
          icon: <Edit className="w-6 h-6 text-blue-600" />,
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          confirmBg: "bg-blue-600 hover:bg-blue-700",
        };
      case "status":
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          confirmBg: "bg-green-600 hover:bg-green-700",
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-gray-600" />,
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800",
          confirmBg: "bg-gray-600 hover:bg-gray-700",
        };
    }
  };

  const { icon, bgColor, borderColor, confirmBg } = getIconAndColors();

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className={`p-6 border-b ${borderColor} dark:border-opacity-50`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${bgColor}`}>
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmBg}`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import EditPaymentOptionForm from "@/components/payment-options/EditPaymentOptionForm";
import { usePaymentOption } from "@/hooks/usePaymentOptions";
import { Suspense } from "react";

function EditPaymentOptionContent() {
  const router = useRouter();
  const params = useParams();
  const paymentOptionId = params.id as string;
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: paymentOption, isLoading, error } = usePaymentOption(paymentOptionId);

  const handleSuccess = () => {
    setIsUpdating(false);
    router.push("/dashboard/payment-options");
  };

  const handleCancel = () => {
    router.push("/dashboard/payment-options");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading payment option...
          </p>
        </div>
      </div>
    );
  }

  if (error || !paymentOption) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Payment option not found
          </p>
          <Link
            href="/dashboard/payment-options"
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            Back to Payment Options
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/payment-options"
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Payment Option
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Update payment method details
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <EditPaymentOptionForm
            paymentOption={paymentOption}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default function EditPaymentOptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <EditPaymentOptionContent />
    </Suspense>
  );
}

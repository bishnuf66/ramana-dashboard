"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import CreatePaymentOptionForm from "@/components/payment-options/CreatePaymentOptionForm";
import { Suspense } from "react";

function CreatePaymentOptionContent() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleSuccess = () => {
    setIsCreating(false);
    router.push("/dashboard/payment-options");
  };

  const handleCancel = () => {
    router.push("/dashboard/payment-options");
  };

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
                Create New Payment Option
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Add a new payment method for customers
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <CreatePaymentOptionForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default function CreatePaymentOptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <CreatePaymentOptionContent />
    </Suspense>
  );
}

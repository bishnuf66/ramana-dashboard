"use client";

import PaymentOptionList from "@/components/payment-options/PaymentOptionList";

export default function PaymentOptionsDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payment Options Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage payment methods and options
        </p>
      </div>
      <PaymentOptionList />
    </div>
  );
}

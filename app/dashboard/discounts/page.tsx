"use client";

import DiscountManager from "@/components/discounts/DiscountManager";

export default function DiscountsDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Discount Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage discount codes and promotions
        </p>
      </div>
      <DiscountManager />
    </div>
  );
}

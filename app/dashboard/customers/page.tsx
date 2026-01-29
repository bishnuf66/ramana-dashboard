"use client";

import CustomersTab from "@/components/customers/CustomersTab";

export default function CustomersDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customer Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage customer accounts and information
        </p>
      </div>
      <CustomersTab />
    </div>
  );
}

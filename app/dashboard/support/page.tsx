"use client";

import Support from "@/components/support/Support";

export default function SupportDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Support Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Help and support resources
        </p>
      </div>
      <Support />
    </div>
  );
}

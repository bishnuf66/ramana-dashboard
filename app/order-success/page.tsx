"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Order Placed
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Thank you! Your order has been placed successfully.
        </p>

        {orderId && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
            <p className="font-mono text-gray-900 dark:text-white break-all">
              {orderId}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/products"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

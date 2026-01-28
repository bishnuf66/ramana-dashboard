"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import SearchFilterSort from "@/components/ui/SearchFilterSort";
import Pagination from "@/components/ui/Pagination";

interface CustomerSummary {
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  orders_count: number;
  total_spent: number;
  last_order_at: string;
  member_since: string;
}

interface RegisteredUser {
  id: string;
  email: string;
  created_at: string | null;
  last_sign_in_at: string | null;
  display_name: string | null;
  role: string;
}

// Fetch customers with TanStack Query
const fetchCustomers = async ({
  search,
  sortBy,
  sortOrder,
  page,
  limit,
  tab,
}: {
  search: string;
  sortBy: string;
  sortOrder: string;
  page: number;
  limit: number;
  tab: string;
}) => {
  const params = new URLSearchParams({
    search,
    sortBy,
    sortOrder,
    page: page.toString(),
    limit: limit.toString(),
    tab,
  });

  const response = await fetch(`/api/customers?${params}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch customers");
  }

  return data;
};

export default function CustomersTabNew() {
  const [activeTab, setActiveTab] = useState<"customers" | "users">("customers");

  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "total_spent" | "orders_count">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // TanStack Query for fetching customers
  const {
    data: customersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customers", searchTerm, sortBy, sortOrder, currentPage, itemsPerPage, activeTab],
    queryFn: () => fetchCustomers({
      search: searchTerm,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: itemsPerPage,
      tab: activeTab,
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const customers = customersData?.data || [];
  const total = customersData?.pagination?.total || 0;

  const handleClearAll = () => {
    setSearchTerm("");
    setSortBy("created_at");
    setSortOrder("desc");
    setItemsPerPage(10);
    setCurrentPage(1);
  };

  const currency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-NP", {
        style: "currency",
        currency: "NPR",
      }).format(value).replace("NPR", "NRS");
    } catch {
      return `NRS ${value.toFixed(2)}`;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            {error instanceof Error ? error.message : "Failed to fetch customers"}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customer Management
          </h1>
        </div>
      </div>

      {/* Search, Filter, and Sort */}
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={`${sortBy}-${sortOrder}`}
        onSortChange={(value) => {
          const [field, order] = value.split("-");
          setSortBy(field as "created_at" | "total_spent" | "orders_count");
          setSortOrder(order as "asc" | "desc");
        }}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        showClearAll={true}
        onClearAll={handleClearAll}
        sortOptions={[
          { value: "created_at-desc", label: "Newest First" },
          { value: "created_at-asc", label: "Oldest First" },
          { value: "total_spent-desc", label: "Highest Spent First" },
          { value: "total_spent-asc", label: "Lowest Spent First" },
          { value: "orders_count-desc", label: "Most Orders First" },
          { value: "orders_count-asc", label: "Least Orders First" },
        ]}
        placeholder="Search by customer name, email, or phone..."
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("customers")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "customers"
              ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Order Customers
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Registered Users
        </button>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {customers.length} of {total} {activeTab === "customers" ? "customers" : "users"}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Data display */}
      {!isLoading && customers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {activeTab === "customers" ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Member Since
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Registered
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {customers.map((item: any, index: number) =>
                  activeTab === "customers" ? (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.customer_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.customer_phone || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.orders_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {currency(item.total_spent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(item.member_since).toLocaleDateString()}
                      </td>
                    </tr>
                  ) : (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && customers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No {activeTab === "customers" ? "customers" : "users"} found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === "customers"
              ? "Customers will appear here once orders are placed."
              : "No registered users found."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {Math.ceil(total / itemsPerPage) > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(total / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import SearchFilterSort from "@/components/ui/SearchFilterSort";
import Pagination from "@/components/ui/Pagination";
import { useCustomers, useCustomersCount } from "@/hooks/useCustomers";
import { useUsers, useUsersCount } from "@/hooks/useUsers";

export default function CustomersTab() {
  const [activeTab, setActiveTab] = useState<"customers" | "users">(
    "customers",
  );

  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "created_at" | "total_amount" | "customer_name" | "customer_email"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Check if any filters are applied
  const hasFilters = !!(
    searchTerm ||
    sortBy !== "created_at" ||
    sortOrder !== "desc" ||
    itemsPerPage !== 10 ||
    currentPage !== 1
  );

  // Use customer hooks
  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    error: customersError,
  } = useCustomers({
    search: searchTerm,
    sortBy: activeTab === "customers" ? sortBy : "created_at",
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  });

  const { data: customersTotal = 0 } = useCustomersCount({
    search: searchTerm,
  });

  // Use users hooks
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useUsers({
    search: searchTerm,
    sortBy: (activeTab === "users" ? sortBy : "created_at") as
      | "created_at"
      | "email"
      | "role",
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  });

  const { data: usersTotal = 0 } = useUsersCount({
    search: searchTerm,
  });

  const isLoading =
    activeTab === "customers" ? isLoadingCustomers : isLoadingUsers;
  const error = activeTab === "customers" ? customersError : usersError;
  const total = activeTab === "customers" ? customersTotal : usersTotal;
  const currentData = activeTab === "customers" ? customers : users;

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [sort, order] = value.split("-");
    setSortBy(sort as any);
    setSortOrder(order as "asc" | "desc");
    setCurrentPage(1);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle clear all filters
  const handleClearAll = () => {
    setSearchTerm("");
    setSortBy("created_at");
    setSortOrder("desc");
    setItemsPerPage(10);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          {error instanceof Error ? error.message : "Failed to fetch customers"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
        Customer Management
      </h2>

      {/* Search, Filter, and Sort */}
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        sortBy={`${sortBy}-${sortOrder}`}
        onSortChange={handleSortChange}
        showStatusFilter={false}
        showClearAll={hasFilters}
        onClearAll={handleClearAll}
        sortOptions={[
          { value: "created_at-desc", label: "Newest First" },
          { value: "created_at-asc", label: "Oldest First" },
          { value: "total_amount-desc", label: "Highest Spending First" },
          { value: "total_amount-asc", label: "Lowest Spending First" },
          { value: "customer_name-asc", label: "Name A-Z" },
          { value: "customer_name-desc", label: "Name Z-A" },
          { value: "customer_email-asc", label: "Email A-Z" },
          { value: "customer_email-desc", label: "Email Z-A" },
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
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            Showing {currentData.length} of {total}{" "}
            {activeTab === "customers" ? "customers" : "users"}
          </>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {activeTab === "customers" ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Order Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Sign In
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "customers" ? 5 : 4}
                    className="px-6 py-12 text-center"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No {activeTab === "customers" ? "Customers" : "Users"}{" "}
                        Found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {hasFilters
                          ? `No ${activeTab === "customers" ? "customers" : "users"} match your current filters.`
                          : activeTab === "customers"
                            ? "No customers have placed orders yet."
                            : "No registered users found."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((item: any, index: number) =>
                  activeTab === "customers" ? (
                    <tr key={`${item.customer_email}-${index}`}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.customer_name || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.customer_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.customer_phone || "Not provided"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {new Intl.NumberFormat("en-NP", {
                          style: "currency",
                          currency: "NPR",
                        })
                          .format(item.total_amount || 0)
                          .replace("NPR", "NRS")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.order_status === "delivered"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : item.order_status === "processing"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : item.order_status === "shipped"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                  : item.order_status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : item.order_status === "cancelled"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {item.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ) : (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {item.role || "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.last_sign_in_at
                          ? new Date(item.last_sign_in_at).toLocaleDateString()
                          : "Never"}
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(total / itemsPerPage)}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
}

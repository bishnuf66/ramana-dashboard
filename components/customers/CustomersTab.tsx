"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
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
  last_sign_in_at: string | null;
  display_name: string | null;
  role: string;
}

interface RegisteredUser {
  id: string;
  email: string;
  created_at: string | null;
  last_sign_in_at: string | null;
  display_name: string | null;
  role: string;
}

export default function CustomersTab() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<"customers" | "users">(
    "customers",
  );

  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "created_at" | "total_spent" | "orders_count"
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

  // Fetch customers from database with search, filter, and sort
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === "customers") {
        // Build query for customer summaries from orders
        let query = supabase
          .from("orders")
          .select(
            "customer_name, customer_email, customer_phone, total_amount, created_at",
            { count: "exact" },
          );

        // Apply search filter
        if (searchTerm) {
          query = query.or(
            `customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%`,
          );
        }

        // Apply sorting
        const sortColumn =
          sortBy === "total_spent"
            ? "total_amount"
            : sortBy === "orders_count"
              ? "created_at"
              : "created_at";
        query = query.order(sortColumn, { ascending: sortOrder === "asc" });

        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);

        const { data: orders, error, count } = await query;

        if (error) throw error;

        // Process customer data
        const customerMap = new Map<string, CustomerSummary>();

        orders?.forEach((order) => {
          const email = order.customer_email;
          if (!email) return;

          if (!customerMap.has(email)) {
            customerMap.set(email, {
              customer_email: email,
              customer_name: order.customer_name || "Unknown",
              customer_phone: order.customer_phone || null,
              orders_count: 0,
              total_spent: 0,
              last_order_at: order.created_at || "",
              member_since: order.created_at || "",
              last_sign_in_at: null,
              display_name: null,
              role: "",
            });
          }

          const customer = customerMap.get(email)!;
          customer.orders_count += 1;
          customer.total_spent += Number(order.total_amount || 0);

          // Update last order date if this order is more recent
          if (
            order.created_at &&
            new Date(order.created_at) > new Date(customer.last_order_at)
          ) {
            customer.last_order_at = order.created_at;
          }

          // Update member since if this order is older
          if (
            order.created_at &&
            new Date(order.created_at) < new Date(customer.member_since)
          ) {
            customer.member_since = order.created_at;
          }
        });

        const customersList = Array.from(customerMap.values());

        // Apply client-side sorting for total_spent and orders_count
        if (sortBy === "total_spent") {
          customersList.sort((a, b) =>
            sortOrder === "asc"
              ? a.total_spent - b.total_spent
              : b.total_spent - a.total_spent,
          );
        } else if (sortBy === "orders_count") {
          customersList.sort((a, b) =>
            sortOrder === "asc"
              ? a.orders_count - b.orders_count
              : b.orders_count - a.orders_count,
          );
        }

        setCustomers(customersList);
        setTotal(customerMap.size);
      } else {
        // Fetch registered users from admin_users table
        let query = supabase
          .from("admin_users")
          .select("id, email, created_at, role", { count: "exact" });

        // Apply search filter
        if (searchTerm) {
          query = query.or(`email.ilike.%${searchTerm}%`);
        }

        // Apply sorting
        query = query.order("created_at", { ascending: sortOrder === "asc" });

        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);

        const { data: users, error, count } = await query;

        if (error) throw error;

        // Transform data to match expected format
        const transformedUsers: RegisteredUser[] =
          users?.map((user) => ({
            ...user,
            display_name: user.email, // Use email as display name
            last_sign_in_at: null, // Not available in admin_users
          })) || [];

        setRegisteredUsers(transformedUsers);
        setTotal(count || 0);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, sortBy, sortOrder, currentPage, itemsPerPage, activeTab]);

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
      })
        .format(value)
        .replace("NPR", "NRS");
    } catch {
      return `NRS ${value.toFixed(2)}`;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={fetchCustomers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentData = activeTab === "customers" ? customers : registeredUsers;

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
        showClearAll={hasFilters}
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
        Showing {currentData.length} of {total}{" "}
        {activeTab === "customers" ? "customers" : "users"}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Data display */}
      {!loading && currentData.length > 0 && (
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
                {currentData.map((item: any, index: number) =>
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
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && currentData.length === 0 && (
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
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

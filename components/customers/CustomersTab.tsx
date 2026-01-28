"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Users } from "lucide-react";

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
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  user_metadata?: any;
}

export default function CustomersTab() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"customers" | "users">(
    "customers",
  );

  useEffect(() => {
    if (activeTab === "customers") {
      fetchCustomers();
    } else {
      fetchRegisteredUsers();
    }
  }, [activeTab]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(
          "customer_email, customer_name, customer_phone, total_amount, created_at",
        )
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Create customer summary from orders
      const customerMap = new Map<string, CustomerSummary>();

      orders?.forEach((order) => {
        const email = order.customer_email;
        if (!email) return;

        const customerOrders =
          orders?.filter((o: any) => o.customer_email === email) || [];
        const totalSpent = customerOrders.reduce(
          (sum: number, o: any) => sum + (Number(o.total_amount) || 0),
          0,
        );
        const lastOrder = customerOrders[0]; // Most recent order due to sorting
        const firstOrder = customerOrders[customerOrders.length - 1]; // Earliest order

        if (!customerMap.has(email)) {
          customerMap.set(email, {
            customer_email: email,
            customer_name: order.customer_name || "Unknown",
            customer_phone: order.customer_phone || null,
            orders_count: customerOrders.length,
            total_spent: totalSpent,
            last_order_at: lastOrder?.created_at || new Date().toISOString(),
            member_since: firstOrder?.created_at || new Date().toISOString(),
          });
        }
      });

      const customersList = Array.from(customerMap.values()).sort(
        (a, b) => b.orders_count - a.orders_count,
      );

      setCustomers(customersList);
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      setError(error.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users from the API endpoint
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }

      const data = await response.json();
      setRegisteredUsers(data.users || []);
    } catch (error: any) {
      console.error("Error fetching registered users:", error);

      // Fallback: try to get users from orders as a last resort
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("customer_email, customer_name, created_at")
        .order("created_at", { ascending: false });

      if (ordersError) {
        setError(error.message || "Failed to fetch registered users");
        setRegisteredUsers([]);
        return;
      }

      // Create user list from orders (this is limited but better than nothing)
      const uniqueUsers = new Map<string, RegisteredUser>();

      orders?.forEach((order: any) => {
        const email = order.customer_email;
        if (!email || uniqueUsers.has(email)) return;

        uniqueUsers.set(email, {
          id: email, // Use email as ID since we don't have auth ID
          email: email,
          created_at: order.created_at,
          last_sign_in_at: null,
          display_name: order.customer_name || null,
          user_metadata: null,
        });
      });

      setRegisteredUsers(Array.from(uniqueUsers.values()));
    } finally {
      setLoading(false);
    }
  };

  const currency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    } catch {
      return `$${value.toFixed(2)}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading {activeTab === "customers" ? "Customers" : "Users"}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() =>
            activeTab === "customers"
              ? fetchCustomers()
              : fetchRegisteredUsers()
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {activeTab === "customers" ? "All Customers" : "All Users"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeTab === "customers"
              ? `${customers.length} customers from orders`
              : `${registeredUsers.length} registered users`}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "customers"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "users"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Registered Users
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {activeTab === "customers" && customers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No customers found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Customers will appear here once orders are placed.
            </p>
          </div>
        ) : activeTab === "users" && registeredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No registered users found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Registered users will appear here once they sign up.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {activeTab === "customers" ? "Customer" : "User"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  {activeTab === "customers" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Phone
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {activeTab === "customers"
                      ? "Member Since"
                      : "Registered On"}
                  </th>
                  {activeTab === "customers" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Last Order
                      </th>
                    </>
                  )}
                  {activeTab === "users" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Sign In
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activeTab === "customers"
                  ? customers.map((customer) => (
                      <tr
                        key={customer.customer_email}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.customer_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {customer.customer_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {customer.customer_phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {new Date(customer.member_since).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {customer.orders_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {currency(customer.total_spent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {new Date(
                            customer.last_order_at,
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  : registeredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.display_name || "Unknown User"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {user.last_sign_in_at
                            ? new Date(
                                user.last_sign_in_at,
                              ).toLocaleDateString()
                            : "Never"}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

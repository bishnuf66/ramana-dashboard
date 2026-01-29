"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { X, IndianRupee, ShoppingCart, Users, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OrderViewModal from "@/components/orders/OrderViewModal";
import CustomersTab from "@/components/customers/CustomersTab";
import type { Database } from "@/types/database.types";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import ProductsPage from "../../components/products/ProductPage";
import SettingPage from "@/components/setting/SettingPage";
import BlogList from "@/components/blog/BlogList";
import ReviewsManager from "@/components/reviews/ReviewManager";
import DiscountManager from "@/components/discounts/DiscountManager";
import TestimonialList from "@/components/testimonials/TestimonialList";
import PaymentList from "@/components/payments/PaymentList";
import { useUserPayments } from "@/hooks/useUserPayments";
import CategoryList from "@/components/categories/CategoryList";
import ReviewManager from "@/components/reviews/ReviewManager";
import Support from "@/components/support/Support";
import PaymentOptionList from "@/components/payment-options/PaymentOptionList";
import UserPaymentList from "@/components/payments/UserPaymentList";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"] & {
  category?: {
    id: string;
    name: string;
    slug: string;
    picture: string | null;
  } | null;
};

// Define OrderItem interface manually since it might not exist in generated types
export interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Wrapper component that uses useSearchParams
function DashboardContent() {
  const searchParams = useSearchParams();
  const activeSection =
    (searchParams.get("section") as
      | "analytics"
      | "products"
      | "orders"
      | "customers"
      | "reviews"
      | "blog"
      | "categories"
      | "discounts"
      | "testimonials"
      | "payment-options"
      | "payments"
      | "support"
      | "settings") || "analytics";

  // Use TanStack Query hooks
  const {
    data: products = [],
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProducts({ limit: 100 });
  const deleteProductMutation = useDeleteProduct();

  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useOrders({ limit: 100 });
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [adminProfile, setAdminProfile] = useState<{
    user: { id: string; email: string | null; created_at?: string };
    admin: {
      id: string;
      email: string;
      role: string;
      created_at: string | null;
    };
  } | null>(null);

  useEffect(() => {
    if (activeSection !== "settings") return;
    const loadSettings = async () => {
      const current = await getCurrentAdmin();
      if (current) {
        setAdminProfile({
          user: {
            id: current.user.id,
            email: current.user.email ?? null,
            created_at: (current.user as any).created_at,
          },
          admin: current.admin,
        });
      } else {
        setAdminProfile(null);
      }
    };
    loadSettings();
  }, [activeSection]);

  // Refetch products when switching to products tab
  useEffect(() => {
    if (activeSection === "products") {
      refetchProducts();
    }
  }, [activeSection, refetchProducts]);

  useEffect(() => {
    // Refetch orders when switching to orders tab
    if (activeSection === "orders") {
      refetchOrders();
    }
  }, [activeSection, refetchOrders]);

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const deleteImage = async (
    imageUrl: string,
    bucket: string = "product-images",
  ): Promise<void> => {
    if (!imageUrl) return;

    try {
      console.log("Deleting image via API:", imageUrl, "from bucket:", bucket);

      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          bucket,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API delete error:", errorData);
        // Don't throw - allow operation to continue even if deletion fails
      } else {
        console.log("Image deleted successfully via API:", imageUrl);
      }
    } catch (error) {
      console.error("Error deleting image via API:", error);
      // Don't throw - allow operation to continue
    }
  };

  const deleteImages = async (imageUrls: string[]): Promise<void> => {
    await Promise.all(imageUrls.map((url) => deleteImage(url)));
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      // Get product to delete images
      const product = products.find((p) => p.id === id);

      // Delete images from storage
      if (product) {
        const imagesToDelete: string[] = [];
        if (product.cover_image) imagesToDelete.push(product.cover_image);
        const galleryImages = getGalleryImages(product);
        imagesToDelete.push(...galleryImages);

        // Delete images (non-blocking)
        deleteImages(imagesToDelete).catch(console.error);
      }

      // Use TanStack Query mutation with regular mutate
      deleteProductMutation.mutate(id);
    } catch (error: any) {
      console.error("Delete product error:", error);
      // Error is already handled by the mutation
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    updateOrderStatusMutation.mutate({ orderId: id, status });
  };

  const handleVerifyPayment = async (orderId: string) => {
    try {
      const currentAdmin = await getCurrentAdmin();
      if (!currentAdmin) {
        toast.error("You must be logged in to verify payments");
        return;
      }

      const { error } = await (supabase as any)
        .from("orders")
        .update({
          payment_status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Payment verified successfully");
      refetchOrders();
    } catch (error: any) {
      toast.error("Failed to verify payment: " + error.message);
    }
  };

  // Only show loading on initial load, not when switching tabs
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  const currency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-NP", {
        style: "currency",
        currency: "NPR",
      }).format(value);
    } catch {
      return `रू${value.toFixed(2)}`;
    }
  };

  // Helper function to safely get gallery images
  const getGalleryImages = (product: Product): string[] => {
    if (!product.gallery_images) return [];
    if (Array.isArray(product.gallery_images)) {
      return product.gallery_images.filter(
        (item): item is string => typeof item === "string",
      );
    }
    if (
      typeof product.gallery_images === "object" &&
      product.gallery_images !== null
    ) {
      return Object.values(product.gallery_images).filter(
        (item): item is string => typeof item === "string",
      );
    }
    return [];
  };

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.order_status === "delivered");
  const deliveredRevenue = deliveredOrders.reduce(
    (sum, o) => sum + (Number(o.total_amount) || 0),
    0,
  );
  const allRevenue = orders.reduce(
    (sum, o) => sum + (Number(o.total_amount) || 0),
    0,
  );
  const averageOrderValue = totalOrders > 0 ? allRevenue / totalOrders : 0;

  const customersCount = new Set(
    orders
      .map((o) => o.customer_email)
      .filter((v): v is string => typeof v === "string" && v.length > 0),
  ).size;

  const days = 14;
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const salesByDate = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    salesByDate.set(key, 0);
  }

  for (const o of deliveredOrders) {
    const d = o.created_at ? new Date(o.created_at) : null;
    if (!d) continue;
    d.setHours(0, 0, 0, 0);
    if (d < start) continue;
    const key = d.toISOString().slice(0, 10);
    if (!salesByDate.has(key)) continue;
    salesByDate.set(
      key,
      (salesByDate.get(key) || 0) + (Number(o.total_amount) || 0),
    );
  }

  const salesSeries = Array.from(salesByDate.entries()).map(
    ([date, value]) => ({
      date,
      value,
    }),
  );
  const maxSales = Math.max(1, ...salesSeries.map((p) => p.value));

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.order_status] = (acc[o.order_status] || 0) + 1;
      return acc;
    },
    {} as Record<OrderStatus, number>,
  );
  const statusTotal = Math.max(1, totalOrders);
  const statusItems: Array<{
    key: OrderStatus;
    label: string;
    value: number;
    color: string;
  }> = [
    {
      key: "pending",
      label: "Pending",
      value: statusCounts.pending || 0,
      color: "#F59E0B",
    },
    {
      key: "processing",
      label: "Processing",
      value: statusCounts.processing || 0,
      color: "#3B82F6",
    },
    {
      key: "shipped",
      label: "Shipped",
      value: statusCounts.shipped || 0,
      color: "#8B5CF6",
    },
    {
      key: "delivered",
      label: "Delivered",
      value: statusCounts.delivered || 0,
      color: "#10B981",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: statusCounts.cancelled || 0,
      color: "#EF4444",
    },
    {
      key: "returned",
      label: "Returned",
      value: statusCounts.returned || 0,
      color: "#F97316",
    },
  ];

  const donut = {
    r: 44,
    c: 2 * Math.PI * 44,
    segments: statusItems
      .filter((s) => s.value > 0)
      .map((s) => {
        const circumference = 2 * Math.PI * 44;
        const len = (s.value / statusTotal) * circumference;
        return {
          color: s.color,
          dasharray: `${len} ${circumference - len}`,
          dashoffset: -statusItems
            .filter((item) => item.value > 0)
            .slice(0, statusItems.indexOf(s))
            .reduce(
              (acc, item) => acc + (item.value / statusTotal) * circumference,
              0,
            ),
        };
      }),
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Content */}
            {activeSection === "analytics" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Delivered Sales
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {currency(deliveredRevenue)}
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <IndianRupee className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {deliveredOrders.length} delivered orders
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Total Orders
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {totalOrders}
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Avg order: {currency(averageOrderValue)}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Customers
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {customersCount}
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Unique customer emails (from orders)
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Products
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {products.length}
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <Package className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Inventory items
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Sales (last {days} days)
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Delivered orders only
                        </p>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Peak: {currency(maxSales)}
                      </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[520px]">
                        <div className="flex items-end gap-2 h-40">
                          {salesSeries.map((p) => {
                            const height = Math.round(
                              (p.value / maxSales) * 140,
                            );
                            return (
                              <div
                                key={p.date}
                                className="flex-1 flex flex-col items-center justify-end"
                              >
                                <div
                                  title={`${p.date}: ${currency(p.value)}`}
                                  className="w-full rounded-md bg-green-500/80 dark:bg-green-400/80"
                                  style={{ height: `${Math.max(2, height)}px` }}
                                />
                                <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                                  {p.date.slice(5)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Order Status
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Breakdown of all orders
                    </p>

                    <div className="flex items-center gap-6">
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <g transform="translate(60,60)">
                          <circle
                            r={donut.r}
                            fill="transparent"
                            stroke="#E5E7EB"
                            strokeWidth="14"
                          />
                          {donut.segments.map((s, idx) => (
                            <circle
                              key={idx}
                              r={donut.r}
                              fill="transparent"
                              stroke={s.color}
                              strokeWidth="14"
                              strokeDasharray={s.dasharray}
                              strokeDashoffset={s.dashoffset}
                              transform="rotate(-90)"
                            />
                          ))}
                          <text
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-gray-900 dark:fill-white"
                            style={{ fontSize: "14px", fontWeight: 700 }}
                          >
                            {totalOrders}
                          </text>
                          <text
                            y="18"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-gray-500 dark:fill-gray-400"
                            style={{ fontSize: "10px" }}
                          >
                            orders
                          </text>
                        </g>
                      </svg>

                      <div className="space-y-2">
                        {statusItems.map((s) => (
                          <div
                            key={s.key}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: s.color }}
                            />
                            <span className="text-gray-700 dark:text-gray-300 w-24">
                              {s.label}
                            </span>
                            <span className="text-gray-900 dark:text-white font-semibold">
                              {s.value}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              ({Math.round((s.value / statusTotal) * 100)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recent Orders
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Latest 8 orders
                    </p>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.slice(0, 8).map((order) => (
                      <div
                        key={order.id}
                        className="p-4 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {order.customer_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {order.customer_email}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleString()
                              : "Unknown date"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {currency(Number(order.total_amount) || 0)}
                          </div>
                          <div
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              order.order_status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.order_status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.order_status === "shipped"
                                    ? "bg-purple-100 text-purple-800"
                                    : order.order_status === "delivered"
                                      ? "bg-green-100 text-green-800"
                                      : order.order_status === "returned"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.order_status}
                          </div>
                        </div>
                      </div>
                    ))}

                    {orders.length === 0 && (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No orders yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeSection === "products" && (
              <div>
                {productsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Loading products...
                    </span>
                  </div>
                ) : (
                  <ProductsPage />
                )}
              </div>
            )}

            {activeSection === "orders" && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
                  Order Management
                </h2>

                {/* Orders Table - Responsive */}
                <OrderTable
                  handleUpdateOrderStatus={handleUpdateOrderStatus}
                  onViewOrder={handleViewOrder}
                  handleVerifyPayment={handleVerifyPayment}
                />
              </div>
            )}

            {activeSection === "customers" && <CustomersTab />}

            {activeSection === "reviews" && <ReviewManager />}

            {activeSection === "blog" && <BlogList />}

            {activeSection === "categories" && <CategoryList />}

            {activeSection === "discounts" && <DiscountManager />}

            {activeSection === "testimonials" && <TestimonialList />}

            {activeSection === "payment-options" && <PaymentOptionList />}

            {activeSection === "payments" && (
              <div className="p-6">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    User Payments Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    View and manage all user payments, verification status, and
                    transaction history.
                  </p>
                </div>
                <UserPaymentList
                  limit={20}
                  showFilters={true}
                  onPaymentSelect={(payment) => {
                    console.log("Selected payment:", payment);
                  }}
                  onPaymentEdit={(payment) => {
                    console.log("Edit payment:", payment);
                    // TODO: Implement edit functionality
                    toast.info("Edit functionality coming soon!");
                  }}
                  onPaymentDelete={async (payment) => {
                    try {
                      console.log("Deleting payment:", payment);

                      // Delete from database
                      const { error } = await (supabase as any)
                        .from("user_payments")
                        .delete()
                        .eq("id", payment.id);

                      if (error) throw error;

                      toast.success("Payment deleted successfully!");
                    } catch (error: any) {
                      console.error("Failed to delete payment:", error);
                      toast.error("Failed to delete payment: " + error.message);
                    }
                  }}
                />
              </div>
            )}

            {activeSection === "support" && <Support />}

            {activeSection === "settings" && (
              <SettingPage adminProfile={adminProfile} />
            )}
          </div>
        </div>
      </div>

      {/* Order View Modal */}
      <OrderViewModal
        order={selectedOrder}
        isOpen={showOrderModal}
        onClose={handleCloseOrderModal}
        onStatusUpdate={handleUpdateOrderStatus}
      />

      {/* Product View Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedProduct.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs sm:text-sm">
                      {selectedProduct.category?.name || "Uncategorized"}
                    </span>
                    <span>Stock: {selectedProduct.stock}</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseProductModal}
                  className="self-end sm:self-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {selectedProduct.cover_image ? (
                      <Image
                        src={selectedProduct.cover_image}
                        alt={selectedProduct.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  {getGalleryImages(selectedProduct).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {getGalleryImages(selectedProduct).map((image, index) => (
                        <div
                          key={index}
                          className="relative w-full h-16 sm:h-20 rounded overflow-hidden bg-gray-100 dark:bg-gray-700"
                        >
                          <Image
                            src={image}
                            alt={`${selectedProduct.title} - Gallery ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Description
                    </h3>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedProduct.description ||
                        "No description available"}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Pricing
                    </h3>
                    <div className="space-y-1">
                      <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                        $
                        {selectedProduct.discount_price ||
                          selectedProduct.price}
                      </div>
                      {selectedProduct.discount_price && (
                        <div className="text-sm sm:text-lg text-gray-500 dark:text-gray-400 line-through">
                          ${selectedProduct.price}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Product Information
                    </h3>
                    <dl className="space-y-2 text-sm sm:text-base">
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">
                          Category:
                        </dt>
                        <dd className="text-gray-900 dark:text-white capitalize">
                          {selectedProduct.category?.name || "Uncategorized"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">
                          Stock:
                        </dt>
                        <dd className="text-gray-900 dark:text-white">
                          {selectedProduct.stock} units
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">
                          Created:
                        </dt>
                        <dd className="text-gray-900 dark:text-white">
                          {new Date(
                            selectedProduct.created_at as string,
                          ).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Link
                      href={`/products/${selectedProduct.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Product
                    </Link>
                    <button
                      onClick={() => {
                        handleCloseProductModal();
                        handleDeleteProduct(selectedProduct.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main export that wraps the dashboard content in Suspense
export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

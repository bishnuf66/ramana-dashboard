"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { signOutAdmin } from "@/lib/supabase/auth";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  LogOut,
  Edit,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  cover_image: string;
  gallery_images: string[] | null;
  rating: number;
  category: "flowers" | "accessories" | "fruits";
  stock: number;
  created_at: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: any;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "analytics" | "products" | "orders"
  >("analytics");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProducts(), fetchOrders()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch products: " + error.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch orders: " + error.message);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
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
        if (product.gallery_images)
          imagesToDelete.push(...product.gallery_images);

        // Delete images (non-blocking)
        import("@/lib/supabase/storage").then(({ deleteImages }) => {
          deleteImages(imagesToDelete).catch(console.error);
        });
      }

      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error: any) {
      toast.error("Failed to delete product: " + error.message);
    }
  };

  const handleUpdateOrderStatus = async (
    id: string,
    status: Order["status"],
  ) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast.success("Order status updated");
      fetchOrders();
    } catch (error: any) {
      toast.error("Failed to update order: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

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

  const customersCount = new Set(
    orders
      .map((o) => o.customer_email)
      .filter((v): v is string => typeof v === "string" && v.length > 0),
  ).size;

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const deliveredRevenue = deliveredOrders.reduce(
    (sum, o) => sum + (Number(o.total_amount) || 0),
    0,
  );
  const allRevenue = orders.reduce(
    (sum, o) => sum + (Number(o.total_amount) || 0),
    0,
  );
  const averageOrderValue = totalOrders > 0 ? allRevenue / totalOrders : 0;

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
    const d = new Date(o.created_at);
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
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<Order["status"], number>,
  );
  const statusTotal = Math.max(1, totalOrders);
  const statusItems: Array<{
    key: Order["status"];
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
  ];

  const donut = (() => {
    const r = 44;
    const c = 2 * Math.PI * r;
    let offset = 0;
    const segments = statusItems
      .filter((s) => s.value > 0)
      .map((s) => {
        const len = (s.value / statusTotal) * c;
        const seg = {
          color: s.color,
          dasharray: `${len} ${c - len}`,
          dashoffset: -offset,
        };
        offset += len;
        return seg;
      });
    return { r, c, segments };
  })();

  return (
    <div>
      <div className="space-y-4 sm:space-y-6">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 sm:px-6 py-3 font-semibold transition ${
              activeTab === "analytics"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Analytics
            </div>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 sm:px-6 py-3 font-semibold transition ${
              activeTab === "products"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              Products ({products.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 sm:px-6 py-3 font-semibold transition ${
              activeTab === "orders"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              Orders ({orders.length})
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === "analytics" && (
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
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
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
                        const height = Math.round((p.value / maxSales) * 140);
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
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {currency(Number(order.total_amount) || 0)}
                      </div>
                      <div
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "shipped"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
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
        {activeTab === "products" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Product Management
              </h2>
              <Link
                href="/products/new"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add New Product</span>
                <span className="sm:hidden">Add Product</span>
              </Link>
            </div>

            {/* Products Table - Responsive */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Image
                            src={product.cover_image || "/placeholder.jpg"}
                            alt={product.title}
                            width={64}
                            height={64}
                            className="h-16 w-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {product.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            ${product.price}
                          </div>
                          {product.discount_price && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              ${product.discount_price}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <Link
                              href={`/products/${product.id}/edit`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Cards */}
              <div className="lg:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <Image
                          src={product.cover_image || "/placeholder.jpg"}
                          alt={product.title}
                          width={64}
                          height={64}
                          className="h-16 w-16 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {product.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {product.category}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ${product.discount_price || product.price}
                          </div>
                          {product.discount_price && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                              ${product.price}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/products/${product.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {products.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No products found. Add your first product!
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Order Management
            </h2>

            {/* Orders Table - Responsive */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.customer_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.customer_email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${order.total_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(
                                order.id,
                                e.target.value as Order["status"],
                              )
                            }
                            className={`text-xs font-semibold px-3 py-1 rounded-full border-0 ${
                              order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "shipped"
                                    ? "bg-purple-100 text-purple-800"
                                    : order.status === "delivered"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              alert(
                                `Order Details:\n\nCustomer: ${
                                  order.customer_name
                                }\nEmail: ${order.customer_email}\nAddress: ${
                                  order.shipping_address
                                }\nItems: ${JSON.stringify(order.items, null, 2)}`,
                              );
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Cards */}
              <div className="lg:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.customer_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {order.customer_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ${order.total_amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(
                              order.id,
                              e.target.value as Order["status"],
                            )
                          }
                          className={`text-xs font-semibold px-3 py-1 rounded-full border-0 ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "shipped"
                                  ? "bg-purple-100 text-purple-800"
                                  : order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => {
                            alert(
                              `Order Details:\n\nCustomer: ${
                                order.customer_name
                              }\nEmail: ${order.customer_email}\nAddress: ${
                                order.shipping_address
                              }\nItems: ${JSON.stringify(order.items, null, 2)}`,
                            );
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {orders.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No orders found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
                      {selectedProduct.category}
                    </span>
                    <span>Stock: {selectedProduct.stock}</span>
                    <span>Rating: ⭐ {selectedProduct.rating}</span>
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
                    <Image
                      src={selectedProduct.cover_image}
                      alt={selectedProduct.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {selectedProduct.gallery_images &&
                    selectedProduct.gallery_images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedProduct.gallery_images.map((image, index) => (
                          <div
                            key={index}
                            className="relative w-full h-16 sm:h-20 rounded overflow-hidden bg-gray-100 dark:bg-gray-700"
                          >
                            <Image
                              src={image}
                              alt={`Gallery ${index + 1}`}
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
                          {selectedProduct.category}
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
                          Rating:
                        </dt>
                        <dd className="text-gray-900 dark:text-white">
                          ⭐ {selectedProduct.rating}/5
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">
                          Created:
                        </dt>
                        <dd className="text-gray-900 dark:text-white">
                          {new Date(
                            selectedProduct.created_at,
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

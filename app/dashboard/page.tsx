"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { signOutAdmin } from "@/lib/supabase/auth";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import OrderTable from "@/components/orders/OrderTable";
import OrderViewModal from "@/components/orders/OrderViewModal";
import ReviewManager from "@/components/reviews/ReviewManager";
import ActionButtons from "@/components/ui/ActionButtons";
import BlogList from "@/components/blog/BlogList";
import CategoryList from "@/components/categories/CategoryList";
import Support from "@/components/support/Support";
import DiscountManager from "@/components/discounts/DiscountManager";
import type { Database } from "@/types/database.types";
import type { Category } from "@/types/category";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import dynamic from "next/dynamic";
import { generateBlogImagePath, uploadImage } from "@/lib/supabase/storage";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const blogEditor = MDEditor;

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  cover_image: string;
  gallery_images: string[] | null;
  rating: number;
  category_id: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    picture?: string | null;
  } | null;
  stock: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method: string;
  items: OrderItem[];
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

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
  const router = useRouter();
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
      | "support"
      | "settings") || "analytics";
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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

  type BlogDraft = {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content_md: string;
    cover_image_url: string;
    published: boolean;
    created_by: string;
  };

  type BlogRow = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content_md: string;
    cover_image_url: string | null;
    published: boolean;
    created_by: string | null;
    created_at: string | null;
    updated_at: string | null;
  };

  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [blogForm, setBlogForm] = useState<BlogDraft>({
    title: "",
    slug: "",
    excerpt: "",
    content_md: "",
    cover_image_url: "",
    published: false,
    created_by: "",
  });
  const [blogSaving, setBlogSaving] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProducts(), fetchOrders(), fetchCategories()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activeSection !== "blog") return;
    const loadBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from("blogs" as any)
          .select(
            "id, title, slug, excerpt, content_md, cover_image_url, published, created_at, updated_at",
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        setBlogs((data as any) || []);
      } catch (e: any) {
        // blogs table may not exist yet; keep UI but show toast
        toast.error(e?.message || "Failed to load blogs");
        setBlogs([]);
      }
    };
    loadBlogs();
  }, [activeSection]);

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

  const uploadBlogCover = async (file: File) => {
    const blogId = editingBlogId || "draft";
    const path = generateBlogImagePath(blogId, file.name, "cover");
    const url = await uploadImage(file, path, "blog-images");
    setBlogForm((prev) => ({ ...prev, cover_image_url: url }));
  };

  const insertInlineImage = async (file: File) => {
    const blogId = editingBlogId || "draft";
    const path = generateBlogImagePath(blogId, file.name, "inline");
    const url = await uploadImage(file, path, "blog-images");
    setBlogForm((prev) => ({
      ...prev,
      content_md: `${prev.content_md}\n\n![](${url})\n`,
    }));
  };

  const handleSaveBlog = async () => {
    if (
      !blogForm.title.trim() ||
      !blogForm.slug.trim() ||
      !blogForm.created_by.trim()
    ) {
      toast.error("Title, slug, and created by are required");
      return;
    }

    setBlogSaving(true);
    try {
      const payload = {
        title: blogForm.title.trim(),
        slug: blogForm.slug.trim(),
        excerpt: blogForm.excerpt.trim() || null,
        content_md: blogForm.content_md || "",
        cover_image_url: blogForm.cover_image_url || null,
        published: blogForm.published,
        created_by: blogForm.created_by.trim() || "Admin",
        updated_at: new Date().toISOString(),
      };

      if (editingBlogId) {
        const { error } = await (supabase as any)
          .from("blogs")
          .update(payload)
          .eq("id", editingBlogId);
        if (error) throw error;
        toast.success("Blog updated");
      } else {
        const { error } = await (supabase as any).from("blogs").insert({
          ...payload,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
        toast.success("Blog created");
      }

      const { data, error: reloadError } = await (supabase as any)
        .from("blogs")
        .select(
          "id, title, slug, excerpt, content_md, cover_image_url, published, created_at, updated_at",
        )
        .order("created_at", { ascending: false });
      if (reloadError) throw reloadError;
      setBlogs(data || []);

      resetBlogForm();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save blog");
    } finally {
      setBlogSaving(false);
    }
  };

  const resetBlogForm = () => {
    setBlogForm({
      title: "",
      slug: "",
      excerpt: "",
      content_md: "",
      cover_image_url: "",
      published: false,
      created_by: "",
    });
    setEditingBlogId(null);
  };

  const handleBlogCoverImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) uploadBlogCover(file);
  };

  const handleBlogInlineImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) insertInlineImage(file);
    };
    input.click();
  };

  const startEditBlog = (post: BlogRow) => {
    setBlogForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content_md: post.content_md,
      cover_image_url: post.cover_image_url || "",
      published: post.published,
      created_by: post.created_by || "",
    });
    setEditingBlogId(post.id);
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const { error } = await (supabase as any)
        .from("blogs")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Blog deleted");
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete blog");
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories(id, name, slug, picture)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch products: " + error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch categories: " + error.message);
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

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
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
      const updatePayload: Database["public"]["Tables"]["orders"]["Update"] = {
        status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any)
        .from("orders")
        .update(updatePayload)
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

  type CustomerSummary = {
    customer_email: string;
    customer_name: string;
    customer_phone: string | null;
    orders_count: number;
    total_spent: number;
    last_order_at: string;
  };

  const customers: CustomerSummary[] = Array.from(
    orders
      .filter(
        (o) =>
          typeof o.customer_email === "string" && o.customer_email.length > 0,
      )
      .reduce((map, o) => {
        const email = o.customer_email as string;
        const current = map.get(email);
        const totalAmount = Number(o.total_amount) || 0;
        const createdAt = o.created_at || new Date().toISOString();

        if (!current) {
          map.set(email, {
            customer_email: email,
            customer_name: o.customer_name || "Unknown",
            customer_phone: o.customer_phone || null,
            orders_count: 1,
            total_spent: totalAmount,
            last_order_at: createdAt,
          });
          return map;
        }

        const lastOrderAt =
          new Date(createdAt) > new Date(current.last_order_at)
            ? createdAt
            : current.last_order_at;

        map.set(email, {
          ...current,
          customer_name: current.customer_name || o.customer_name || "Unknown",
          customer_phone: current.customer_phone || o.customer_phone || null,
          orders_count: current.orders_count + 1,
          total_spent: current.total_spent + totalAmount,
          last_order_at: lastOrderAt,
        });

        return map;
      }, new Map<string, CustomerSummary>()),
  )
    .map(([, v]) => v)
    .sort((a, b) => b.orders_count - a.orders_count);

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
            {activeSection === "products" && (
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
                                {product.category?.name || "Uncategorized"}
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
                                <ActionButtons
                                  id={product.id}
                                  type="product"
                                  onView={() => handleViewProduct(product)}
                                  onDelete={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                />
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
                                  {product.category?.name || "Uncategorized"}
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
                              <ActionButtons
                                id={product.id}
                                type="product"
                                onView={() => handleViewProduct(product)}
                                onDelete={() => handleDeleteProduct(product.id)}
                              />
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

            {activeSection === "orders" && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
                  Order Management
                </h2>

                {/* Orders Table - Responsive */}
                <OrderTable
                  orders={orders}
                  handleUpdateOrderStatus={handleUpdateOrderStatus}
                  onViewOrder={handleViewOrder}
                />
              </div>
            )}

            {activeSection === "customers" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      Customers
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {customers.length} customers
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  {customers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No customers found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Customers will appear here once orders are placed.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Customer
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
                              Last Order
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {customers.map((c) => (
                            <tr
                              key={c.customer_email}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {c.customer_name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {c.customer_email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {c.customer_phone || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {c.orders_count}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {currency(c.total_spent)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {new Date(c.last_order_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === "reviews" && <ReviewManager />}

            {activeSection === "blog" && (
              <BlogList onDelete={(id) => handleDeleteBlog(id)} />
            )}

            {activeSection === "categories" && <CategoryList />}

            {activeSection === "discounts" && <DiscountManager />}

            {activeSection === "support" && <Support />}

            {activeSection === "settings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Settings
                  </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Admin Details
                  </h3>
                  {adminProfile ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Email
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {adminProfile.admin.email}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Role
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {adminProfile.admin.role}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Admin ID
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white break-all">
                          {adminProfile.admin.id}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Created
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {adminProfile.admin.created_at
                            ? new Date(
                                adminProfile.admin.created_at as string,
                              ).toLocaleString()
                            : "-"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Not logged in as admin.
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      System Info
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Environment
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Production
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Version
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        1.0.0
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page Footer */}
            <div className="mt-8 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                © 2026 Ramana Dashboard. All rights reserved.
              </p>
            </div>
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
                    <span>Rating: {selectedProduct.rating}</span>
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

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  ShoppingBag,
  Star,
  Package,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  created_at: string;
}

interface UserOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: any;
  created_at: string;
}

interface UserReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  comment: string;
  reviewImages: string[];
  createdAt: string;
  helpfulCount: number;
}

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "reviews" | "profile"
  >("overview");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }

      // Use auth user metadata directly (more reliable)
      const userProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || "",
        full_name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.display_name ||
          "",
        phone: authUser.user_metadata?.phone || "",
        address: authUser.user_metadata?.address || "",
        avatar_url: authUser.user_metadata?.avatar_url || "",
        created_at: authUser.created_at || new Date().toISOString(),
      };

      setUser(userProfile);
      setProfileForm({
        full_name: userProfile.full_name || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
      });

      // Load user orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", userProfile.email)
        .order("created_at", { ascending: false });

      if (!ordersError && ordersData) {
        setOrders(ordersData as UserOrder[]);
      }

      // Load user reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("product_reviews")
        .select(
          `
          *,
          products!inner(title, cover_image)
        `,
        )
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      if (!reviewsError && reviewsData) {
        const userReviews: UserReview[] = reviewsData.map((review) => ({
          id: review.id,
          productId: review.product_id,
          productName: review.products.title,
          productImage: review.products.cover_image,
          rating: review.rating,
          comment: review.comment || "",
          reviewImages: review.review_images || [],
          createdAt: review.created_at,
          helpfulCount: review.helpful_count,
        }));
        setReviews(userReviews);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      // Update auth metadata directly
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          address: profileForm.address,
          avatar_url: user?.avatar_url,
        },
      });

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setEditingProfile(false);

      // Force refresh by waiting a moment then reloading
      setTimeout(() => {
        loadUserData();
      }, 500);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            User not found
          </h1>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-500" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user.full_name || "User"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {user.email}
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: "overview", label: "Overview", icon: Package },
                  { id: "orders", label: "My Orders", icon: ShoppingBag },
                  { id: "reviews", label: "My Reviews", icon: Star },
                  { id: "profile", label: "Profile Settings", icon: User },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Total Orders
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {orders.length}
                        </p>
                      </div>
                      <ShoppingBag className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Reviews Written
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {reviews.length}
                        </p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Member Since
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {new Date(user.created_at).getFullYear()}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Orders
                  </h3>
                  {orders.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">
                      You haven't placed any orders yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Order #{order.id.slice(0, 8)}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(
                                  order.created_at,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900 dark:text-white">
                                ${order.total_amount.toFixed(2)}
                              </p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "shipped"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.status === "processing"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : order.status === "cancelled"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  My Orders
                </h3>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Orders Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start shopping to see your orders here
                    </p>
                    <button
                      onClick={() => router.push("/products")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              Order #{order.id.slice(0, 8)}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              ${order.total_amount.toFixed(2)}
                            </p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.status === "processing"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : order.status === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            <strong>Shipping Address:</strong>{" "}
                            {order.shipping_address}
                          </p>
                          <p>
                            <strong>Items:</strong>{" "}
                            {JSON.stringify(order.items).length} items
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  My Reviews
                </h3>
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Share your experience with products you've purchased
                    </p>
                    <button
                      onClick={() => router.push("/products")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex gap-4">
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <Image
                              src={review.productImage}
                              alt={review.productName}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {review.productName}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                              {review.comment}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>{review.helpfulCount} helpful</span>
                              {review.reviewImages.length > 0 && (
                                <span>{review.reviewImages.length} images</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Settings
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadUserData}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Refresh profile data"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingProfile(!editingProfile)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                      {editingProfile ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>
                </div>

                {editingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            full_name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address
                      </label>
                      <textarea
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Email
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {user.full_name && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Full Name
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {user.full_name}
                          </p>
                        </div>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Phone
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {user.phone}
                          </p>
                        </div>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Address
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {user.address}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Member Since
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

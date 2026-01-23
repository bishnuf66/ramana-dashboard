"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Users,
  TrendingUp,
  Package,
  Filter,
  CheckSquare,
  XSquare,
} from "lucide-react";
import {
  DiscountService,
  type Coupon,
  type CouponProduct,
} from "@/lib/discounts/DiscountService";

interface CouponFormData {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  discount_value: number;
  minimum_order_amount: number;
  usage_limit: number | null;
  first_time_only: boolean;
  is_active: boolean;
  expires_at: string;
  is_product_specific: boolean;
  product_inclusion_type: "include" | "exclude";
}

export default function DiscountManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    minimum_order_amount: 0,
    usage_limit: null,
    first_time_only: false,
    is_active: true,
    expires_at: "",
    is_product_specific: false,
    product_inclusion_type: "include",
  });

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price")
        .eq("is_active", true)
        .order("title");

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        code: formData.code.toUpperCase(),
        expires_at: formData.expires_at || null,
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from("coupons")
          .update(submitData)
          .eq("id", editingCoupon.id);

        if (error) throw error;

        // Handle product associations if product-specific
        if (formData.is_product_specific) {
          // Get existing products for this coupon
          const { data: existingProducts } = await supabase
            .from("coupon_products")
            .select("product_id")
            .eq("coupon_id", editingCoupon.id);

          const existingProductIds =
            existingProducts?.map((p) => p.product_id) || [];

          // Remove products that are no longer selected
          const toRemove = existingProductIds.filter(
            (id) => !selectedProducts.includes(id),
          );
          if (toRemove.length > 0) {
            await DiscountService.removeProductsFromCoupon(
              editingCoupon.id,
              toRemove,
            );
          }

          // Add newly selected products
          const toAdd = selectedProducts.filter(
            (id) => !existingProductIds.includes(id),
          );
          if (toAdd.length > 0) {
            await DiscountService.addProductsToCoupon(editingCoupon.id, toAdd);
          }
        }

        toast.success("Coupon updated successfully");
      } else {
        const { data: newCoupon, error } = await supabase
          .from("coupons")
          .insert(submitData)
          .select()
          .single();

        if (error) throw error;

        // Add product associations if product-specific
        if (formData.is_product_specific && selectedProducts.length > 0) {
          await DiscountService.addProductsToCoupon(
            newCoupon.id,
            selectedProducts,
          );
        }

        toast.success("Coupon created successfully");
      }

      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.message || "Failed to save coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      minimum_order_amount: coupon.minimum_order_amount,
      usage_limit: coupon.usage_limit,
      first_time_only: coupon.first_time_only,
      is_active: coupon.is_active,
      expires_at: coupon.expires_at?.split("T")[0] || "",
      is_product_specific: coupon.is_product_specific || false,
      product_inclusion_type: coupon.product_inclusion_type || "include",
    });

    // Load selected products if product-specific
    if (coupon.is_product_specific) {
      const couponProducts = await DiscountService.getCouponProducts(coupon.id);
      setSelectedProducts(couponProducts.map((cp) => cp.product_id));
    } else {
      setSelectedProducts([]);
    }

    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);

      if (error) throw error;
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      minimum_order_amount: 0,
      usage_limit: null,
      first_time_only: false,
      is_active: true,
      expires_at: "",
      is_product_specific: false,
      product_inclusion_type: "include",
    });
    setSelectedProducts([]);
    setEditingCoupon(null);
  };

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="w-4 h-4" />;
      case "fixed_amount":
        return <DollarSign className="w-4 h-4" />;
      case "free_shipping":
        return <Truck className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getUsagePercentage = (coupon: Coupon) => {
    if (!coupon.usage_limit) return 0;
    return (coupon.usage_count / coupon.usage_limit) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Discount & Coupon Management
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Coupons
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {coupons.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {coupons.filter((c) => c.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                First-Time
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {coupons.filter((c) => c.first_time_only).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expired
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {
                  coupons.filter(
                    (c) => c.expires_at && new Date(c.expires_at) < new Date(),
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getDiscountIcon(coupon.discount_type)}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {coupon.code}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {coupon.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {coupon.discount_type === "percentage" &&
                        `${coupon.discount_value}%`}
                      {coupon.discount_type === "fixed_amount" &&
                        `$${coupon.discount_value}`}
                      {coupon.discount_type === "free_shipping" &&
                        "Free Shipping"}
                    </div>
                    {coupon.minimum_order_amount > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Min: ${coupon.minimum_order_amount}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {coupon.first_time_only && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          First-Time Only
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {coupon.usage_count}
                      {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                    </div>
                    {coupon.usage_limit && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${getUsagePercentage(coupon)}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {coupon.is_active ? "Active" : "Inactive"}
                    </span>
                    {coupon.expires_at &&
                      new Date(coupon.expires_at) < new Date() && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          Expired
                        </span>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="FIRST10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="First-time customer discount - 10% off!"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Type
                    </label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_type: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed_amount">Fixed Amount</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_value: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Minimum Order Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minimum_order_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minimum_order_amount: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.usage_limit || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usage_limit: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) =>
                      setFormData({ ...formData, expires_at: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.first_time_only}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          first_time_only: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      First-time customers only
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </span>
                  </label>
                </div>

                {/* Product-Specific Options */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_product_specific}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_product_specific: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Product-specific coupon
                    </span>
                  </label>

                  {formData.is_product_specific && (
                    <div className="space-y-3 pl-6 border-l-2 border-gray-200 dark:border-gray-600">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Product Selection Type
                        </label>
                        <select
                          value={formData.product_inclusion_type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              product_inclusion_type: e.target.value as
                                | "include"
                                | "exclude",
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="include">
                            Include only selected products
                          </option>
                          <option value="exclude">
                            Exclude selected products (apply to all others)
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {formData.product_inclusion_type === "include"
                            ? "Select products to include"
                            : "Select products to exclude"}
                        </label>
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-48 overflow-y-auto dark:bg-gray-700">
                          {products.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No products available
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {products.map((product) => (
                                <label
                                  key={product.id}
                                  className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(
                                      product.id,
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedProducts([
                                          ...selectedProducts,
                                          product.id,
                                        ]);
                                      } else {
                                        setSelectedProducts(
                                          selectedProducts.filter(
                                            (id) => id !== product.id,
                                          ),
                                        );
                                      }
                                    }}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {product.title}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      ${product.price}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedProducts.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {selectedProducts.length} product
                            {selectedProducts.length !== 1 ? "s" : ""} selected
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingCoupon
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

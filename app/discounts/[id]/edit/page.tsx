"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { DiscountService } from "@/lib/discounts/DiscountService";
import type { Database } from "@/types/database.types";

type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

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

export default function EditDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const discountId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<CouponRow | null>(null);

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
    fetchCouponData();
    fetchProducts();
  }, [discountId]);

  const fetchCouponData = async () => {
    try {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("id", discountId)
        .single();

      if (error) throw error;

      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || "",
        discount_type: coupon.discount_type as any,
        discount_value: coupon.discount_value || 0,
        minimum_order_amount: coupon.minimum_order_amount || 0,
        usage_limit: coupon.usage_limit,
        first_time_only: coupon.first_time_only || false,
        is_active: coupon.is_active || false,
        expires_at: coupon.expires_at || "",
        is_product_specific: coupon.is_product_specific || false,
        product_inclusion_type: coupon.product_inclusion_type as any,
      });

      // Fetch selected products if product-specific
      if (coupon.is_product_specific) {
        const { data: couponProducts } = await supabase
          .from("coupon_products")
          .select("product_id")
          .eq("coupon_id", discountId);

        const productIds =
          couponProducts?.map((cp: any) => cp.product_id) || [];
        setSelectedProducts(productIds);
      }
    } catch (error: any) {
      console.error("Failed to fetch coupon:", error);
      toast.error("Failed to load coupon data");
      router.push("/dashboard");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price")
        .eq("is_active", true)
        .order("title");

      if (error) throw error;
      setProducts((data as any) || []);
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    setIsLoading(true);

    try {
      const submitData = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        minimum_order_amount: formData.minimum_order_amount,
        usage_limit: formData.usage_limit,
        first_time_only: formData.first_time_only,
        is_active: formData.is_active,
        expires_at: formData.expires_at || null,
        is_product_specific: formData.is_product_specific,
        product_inclusion_type: formData.product_inclusion_type,
      };

      const { error } = await (supabase as any)
        .from("coupons")
        .update(submitData)
        .eq("id", editingCoupon.id);

      if (error) throw error;

      // Handle product associations if product-specific
      if (formData.is_product_specific) {
        // Get existing products for this coupon
        const { data: existingProducts } = await (supabase as any)
          .from("coupon_products")
          .select("product_id")
          .eq("coupon_id", editingCoupon.id);

        const existingProductIds =
          existingProducts?.map((p: any) => p.product_id) || [];

        // Remove products that are no longer selected
        const toRemove = existingProductIds.filter(
          (id: string) => !selectedProducts.includes(id),
        );
        if (toRemove.length > 0) {
          await DiscountService.removeProductsFromCoupon(
            editingCoupon.id,
            toRemove,
          );
        }

        // Add newly selected products
        const toAdd = selectedProducts.filter(
          (id: string) => !existingProductIds.includes(id),
        );
        if (toAdd.length > 0) {
          await DiscountService.addProductsToCoupon(editingCoupon.id, toAdd);
        }
      }

      toast.success("Coupon updated successfully");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to update coupon");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading coupon data...
          </p>
        </div>
      </div>
    );
  }

  if (!editingCoupon) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Coupon not found
          </p>
          <Link
            href="/dashboard"
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Coupon: {editingCoupon.code}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Update coupon code details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="FIRST10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="First-time customer discount - 10% off!"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expires_at}
                onChange={(e) =>
                  setFormData({ ...formData, expires_at: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-6">
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
                <div className="space-y-4 pl-6 border-l-2 border-gray-200 dark:border-gray-600">
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto dark:bg-gray-700">
                      {products.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No products available
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {products.map((product) => (
                            <label
                              key={product.id}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {selectedProducts.length} product
                        {selectedProducts.length !== 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/dashboard"
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Updating..." : "Update Coupon"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

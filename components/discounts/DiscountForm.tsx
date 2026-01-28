"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { DiscountService } from "@/lib/discounts/DiscountService";
import type { Database } from "@/types/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];

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

interface CouponFormProps {
  initialData?: Partial<CouponFormData>;
  editingCoupon?: CouponRow | null;
  onSubmit: (data: CouponFormData, selectedProducts: string[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export default function CouponForm({
  initialData,
  editingCoupon,
  onSubmit,
  onCancel,
  isLoading = false,
  submitButtonText = "Create Coupon",
}: CouponFormProps) {
  const [products, setProducts] = useState<ProductRow[]>([]);
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
    ...initialData,
  });

  useEffect(() => {
    fetchProducts();
    if (editingCoupon && editingCoupon.is_product_specific) {
      fetchSelectedProducts();
    }
  }, [editingCoupon]);

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

  const fetchSelectedProducts = async () => {
    if (!editingCoupon) return;

    try {
      const { data: couponProducts } = await supabase
        .from("coupon_products")
        .select("product_id")
        .eq("coupon_id", editingCoupon.id);

      const productIds = couponProducts?.map((cp: any) => cp.product_id) || [];
      setSelectedProducts(productIds);
    } catch (error: any) {
      console.error("Failed to fetch selected products:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, selectedProducts);
  };

  return (
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
                usage_limit: e.target.value ? parseInt(e.target.value) : null,
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
                <option value="include">Include only selected products</option>
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
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving..." : submitButtonText}
        </button>
      </div>
    </form>
  );
}

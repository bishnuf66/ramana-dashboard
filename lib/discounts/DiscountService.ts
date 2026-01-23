import { supabase } from "@/lib/supabase/client";

export interface CouponValidationResult {
  valid: boolean;
  discount_amount: number;
  message: string;
  coupon_id?: string;
  applicable_products?: string[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  discount_value: number;
  minimum_order_amount: number;
  usage_limit: number | null;
  usage_count: number;
  first_time_only: boolean;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
  is_product_specific?: boolean;
  product_inclusion_type?: "include" | "exclude";
}

export interface CouponProduct {
  id: string;
  coupon_id: string;
  product_id: string;
  created_at: string;
}

export class DiscountService {
  // Validate coupon code with product support
  static async validateCoupon(
    code: string,
    customerEmail: string,
    orderTotal: number,
    productIds?: string[],
  ): Promise<CouponValidationResult> {
    try {
      const { data, error } = await supabase.rpc("validate_coupon", {
        coupon_code: code,
        customer_email: customerEmail,
        order_total: orderTotal,
        product_ids: productIds || null,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        return data[0];
      }

      return {
        valid: false,
        discount_amount: 0,
        message: "Invalid coupon code",
      };
    } catch (error: any) {
      console.error("Coupon validation error:", error);
      return {
        valid: false,
        discount_amount: 0,
        message: error.message || "Failed to validate coupon",
      };
    }
  }

  // Get products associated with a coupon
  static async getCouponProducts(couponId: string): Promise<CouponProduct[]> {
    try {
      const { data, error } = await supabase
        .from("coupon_products")
        .select("*")
        .eq("coupon_id", couponId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Get coupon products error:", error);
      return [];
    }
  }

  // Add products to a coupon
  static async addProductsToCoupon(
    couponId: string,
    productIds: string[],
  ): Promise<boolean> {
    try {
      const productsToAdd = productIds.map((productId) => ({
        coupon_id: couponId,
        product_id: productId,
      }));

      const { error } = await supabase
        .from("coupon_products")
        .insert(productsToAdd);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Add products to coupon error:", error);
      return false;
    }
  }

  // Remove products from a coupon
  static async removeProductsFromCoupon(
    couponId: string,
    productIds: string[],
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("coupon_products")
        .delete()
        .eq("coupon_id", couponId)
        .in("product_id", productIds);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Remove products from coupon error:", error);
      return false;
    }
  }

  // Update coupon to be product-specific
  static async updateCouponProductSpecific(
    couponId: string,
    isProductSpecific: boolean,
    productInclusionType: "include" | "exclude" = "include",
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({
          is_product_specific: isProductSpecific,
          product_inclusion_type: productInclusionType,
        })
        .eq("id", couponId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Update coupon product specific error:", error);
      return false;
    }
  }

  // Get applicable coupons for a cart
  static async getApplicableCoupons(
    customerEmail: string,
    orderTotal: number,
    productIds?: string[],
  ): Promise<Coupon[]> {
    try {
      const { data, error } = await supabase.rpc("get_applicable_coupons", {
        customer_email: customerEmail,
        product_ids: productIds || null,
        order_total: orderTotal,
      });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Get applicable coupons error:", error);
      return [];
    }
  }

  // Apply coupon after order completion
  static async applyCouponUsage(
    couponId: string,
    customerEmail: string,
    orderId: string,
    discountAmount: number,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc("apply_coupon_usage", {
        coupon_id: couponId,
        customer_email: customerEmail,
        order_id: orderId,
        discount_amount: discountAmount,
      });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Apply coupon usage error:", error);
      return false;
    }
  }

  // Get available coupons for display
  static async getAvailableCoupons(): Promise<Coupon[]> {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .or("expires_at.is.null,expires_at.gt.now()")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Get coupons error:", error);
      return [];
    }
  }

  // Check if customer is first-time
  static async isFirstTimeCustomer(customerEmail: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("customer_discounts")
        .select("first_purchase_completed")
        .eq("customer_email", customerEmail)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        throw error;
      }

      return !data?.first_purchase_completed;
    } catch (error: any) {
      console.error("Check first-time customer error:", error);
      return true; // Assume first-time if there's an error
    }
  }

  // Get first-time customer coupons
  static async getFirstTimeCoupons(): Promise<Coupon[]> {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .eq("first_time_only", true)
        .or("expires_at.is.null,expires_at.gt.now()")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Get first-time coupons error:", error);
      return [];
    }
  }

  // Get product-specific coupons
  static async getProductSpecificCoupons(): Promise<Coupon[]> {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .eq("is_product_specific", true)
        .or("expires_at.is.null,expires_at.gt.now()")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Get product-specific coupons error:", error);
      return [];
    }
  }

  // Format discount display
  static formatDiscount(coupon: Coupon): string {
    switch (coupon.discount_type) {
      case "percentage":
        return `${coupon.discount_value}% OFF`;
      case "fixed_amount":
        return `$${coupon.discount_value} OFF`;
      case "free_shipping":
        return "FREE SHIPPING";
      default:
        return "DISCOUNT";
    }
  }

  // Calculate final price with discount
  static calculateDiscountedPrice(
    originalPrice: number,
    discountType: string,
    discountValue: number,
  ): number {
    switch (discountType) {
      case "percentage":
        return originalPrice * (1 - discountValue / 100);
      case "fixed_amount":
        return Math.max(0, originalPrice - discountValue);
      case "free_shipping":
        return originalPrice; // Shipping handled separately
      default:
        return originalPrice;
    }
  }

  // Get coupon usage statistics
  static async getCouponStats() {
    try {
      const { data: coupons, error: couponsError } = await supabase
        .from("coupons")
        .select("id, usage_count, usage_limit, is_product_specific");

      if (couponsError) throw couponsError;

      const totalCoupons = coupons?.length || 0;
      const activeCoupons =
        coupons?.filter((c) => c.usage_count > 0).length || 0;
      const productSpecificCoupons =
        coupons?.filter((c) => c.is_product_specific).length || 0;
      const totalUsage =
        coupons?.reduce((sum, c) => sum + c.usage_count, 0) || 0;

      return {
        totalCoupons,
        activeCoupons,
        productSpecificCoupons,
        totalUsage,
      };
    } catch (error: any) {
      console.error("Get coupon stats error:", error);
      return {
        totalCoupons: 0,
        activeCoupons: 0,
        productSpecificCoupons: 0,
        totalUsage: 0,
      };
    }
  }

  // Validate coupon for specific products in cart
  static async validateCouponForCart(
    code: string,
    customerEmail: string,
    cartItems: Array<{ product_id: string; price: number; quantity: number }>,
  ): Promise<CouponValidationResult> {
    const productIds = cartItems.map((item) => item.product_id);
    const orderTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return this.validateCoupon(code, customerEmail, orderTotal, productIds);
  }
}
